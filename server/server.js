import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { config } from './config/index.js';
import { runMigrations } from './db/migrations.js';
import salasRouter from './routes/salas.js';
import healthRouter from './routes/health.js';
import uploadRouter from './routes/upload.js';
import { registrarChat } from './sockets/chat.js';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: config.clientOrigin,
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: config.clientOrigin }));
app.use(express.json({ limit: '10kb' }));

app.use('/uploads', express.static(config.uploadsDir));
app.use('/api/upload', uploadRouter);
app.use('/api/salas', salasRouter);
app.use('/health', healthRouter);

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Ruta no encontrada' });
});

app.use((error, req, res, next) => {
  console.error('[server] Error:', error.message);
  res.status(500).json({ success: false, error: 'Error interno del servidor' });
});

httpServer.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`[server] El puerto ${config.port} ya está en uso.`);
    console.error(`[server] Cierra el otro proceso o cambia PORT en server/.env`);
    process.exit(1);
  }
  console.error('[server] Error:', error.message);
  process.exit(1);
});

runMigrations();
registrarChat(io);

httpServer.listen(config.port, () => {
  console.log(`[server] HablaChat corriendo en http://localhost:${config.port}`);
});

// En Render/Railway el proceso recibe SIGTERM al desplegar. Sin este manejo
// las imagenes pendientes y el WAL de SQLite se pierden.
for (const señal of ['SIGTERM', 'SIGINT']) {
  process.on(señal, () => {
    console.log(`[server] ${señal} recibido, cerrando...`);
    io.close(() => {
      httpServer.close(() => process.exit(0));
    });
    setTimeout(() => process.exit(0), 5000).unref();
  });
}
