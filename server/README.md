# HablaChat — Backend

API REST + WebSocket para chat en tiempo real con salas, historial e imágenes.

## Requisitos

- **Node.js 22 o superior** — usa el módulo nativo `node:sqlite`, no necesitas instalar SQLite aparte
- npm

## Instalación

```bash
cd server
cp .env.example .env
npm install
```

## Ejecución

```bash
npm run dev     # desarrollo (recarga automática con --watch)
npm start       # producción
```

El servidor queda disponible en `http://localhost:4000`.

## Base de datos

Usa **SQLite** mediante el módulo nativo `node:sqlite` (incluido en Node 22+, sin dependencias nativas).

El archivo se crea solo en el primer arranque:

```
server/hablachat.db
```

Inspeccionarlo desde la terminal:

```bash
node -e "const{DatabaseSync}=require('node:sqlite');const db=new DatabaseSync('./hablachat.db');console.log(db.prepare('SELECT * FROM mensajes').all())"
```

### Esquema

```sql
CREATE TABLE salas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE COLLATE NOCASE,
  creada_en TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE mensajes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sala_id INTEGER NOT NULL,
  autor TEXT NOT NULL,
  contenido TEXT NOT NULL DEFAULT '',
  imagen_url TEXT,
  creado_en TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (sala_id) REFERENCES salas(id) ON DELETE CASCADE
);
```

Las migraciones son incrementales: si agregas una columna nueva a `db/migrations.js`, se aplica con `ALTER TABLE` sobre bases existentes sin perder datos.

## Variables de entorno

Copia `.env.example` a `.env`:

| Variable | Default | Descripción |
|----------|---------|-------------|
| `PORT` | `4000` | Puerto del servidor |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Origen permitido por CORS |
| `DB_PATH` | `./hablachat.db` | Ruta del archivo SQLite |
| `MAX_MESSAGE_LENGTH` | `1000` | Longitud máxima de un mensaje |
| `RATE_LIMIT_WINDOW_MS` | `1000` | Ventana del limitador de frecuencia (ms) |
| `RATE_LIMIT_MAX_MESSAGES` | `5` | Mensajes máximos por ventana |

## Estructura

```
server/
├── config/index.js        → carga y valida variables de entorno
├── db/
│   ├── connection.js      → instancia única de SQLite
│   └── migrations.js      → creación de tablas + migraciones
├── routes/
│   ├── health.js          → GET /health
│   ├── salas.js           → listado e historial
│   └── upload.js          → subida de imágenes (multer)
├── services/
│   ├── salaService.js     → consultas y persistencia
│   └── rateLimiter.js     → anti-spam por socket
├── sockets/chat.js        → eventos Socket.IO
├── uploads/               → imágenes (se crea sola)
└── server.js              → Express + HTTP + Socket.IO
```

## API REST

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Estado del servidor |
| `GET` | `/api/salas` | Lista de salas |
| `GET` | `/api/salas/:sala/mensajes?limite=50` | Historial (máx. 100) |
| `POST` | `/api/upload` | Sube imagen → `{ url }` |

### Subida de imágenes

Envía `multipart/form-data` con el campo **`imagen`**:

```bash
curl -F "imagen=@foto.jpg" http://localhost:4000/api/upload
```

Restricciones: JPG, PNG, GIF o WebP — máximo **5 MB**. El archivo se guarda en `uploads/` con nombre aleatorio y se sirve en `/uploads/<archivo>`.

## Eventos Socket.IO

**Cliente → Servidor**

| Evento | Payload | Respuesta (ack) |
|--------|---------|-----------------|
| `sala:unirse` | `{ nombre, sala }` | `{ success, sala, historial }` |
| `mensaje:enviar` | `{ contenido, imagenUrl? }` | `{ success }` |
| `escribiendo` | — | — |
| `sala:salir` | — | — |

**Servidor → Cliente**

| Evento | Payload |
|--------|---------|
| `mensaje:nuevo` | `{ id, autor, contenido, imagen_url, creado_en }` |
| `mensaje:sistema` | `{ contenido }` |
| `usuarios:actualizados` | `["Ana", "Luis"]` |
| `escribiendo` | `{ usuario }` |

### Validaciones

- Nombre: 2–20 caracteres
- Sala: 1–30 caracteres
- Mensaje: 1–1000 caracteres (o debe traer imagen)
- `imagenUrl` solo acepta rutas `/uploads/<archivo>` — bloquea path traversal y URLs externas
- Rate limit: 5 mensajes por segundo y socket

## Verificación

```bash
curl http://localhost:4000/health
# {"status":"ok","timestamp":"..."}

curl http://localhost:4000/api/salas
# {"success":true,"data":[{"id":1,"nombre":"General"}]}
```

## Migrar a PostgreSQL

Todo el acceso a datos pasa por `db/connection.js` y `services/salaService.js`. Para cambiar de motor solo modifica esos dos archivos; el resto de la aplicación no cambia.