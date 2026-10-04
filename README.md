# HablaChat

Chat en tiempo real con salas, construido con React + Vite + Socket.IO + Express + SQLite.

## Características

- Chat en tiempo real con Socket.IO
- Salas de chat (General por defecto + crear nuevas)
- Historial de últimos 50 mensajes por sala (SQLite)
- Lista de usuarios conectados en vivo
- Indicador "X está escribiendo..."
- Mensajes de sistema (entrada/salida)
- Estado de conexión visible con reconexión automática
- Auto-scroll inteligente
- Tema oscuro/claro con toggle
- 100% responsive (drawer en móvil)
- Accesible (aria-live, foco visible, navegación por teclado)

## Requisitos

- Node.js 18+
- npm

## Instalación y ejecución

### 1. Clonar el repositorio

```bash
git clone <repo-url> hablachat
cd hablachat
```

### 2. Backend

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

El servidor correrá en `http://localhost:4000`.

### 3. Frontend (nueva terminal)

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

La app correrá en `http://localhost:5173`.

### 4. Abrir en el navegador

Ve a `http://localhost:5173`, escribe tu nombre y empieza a chatear.

## Estructura del proyecto

```
hablachat/
├── server/                 # Backend Node.js
│   ├── config/             # Configuración y variables de entorno
│   ├── db/                 # Conexión SQLite y migraciones
│   ├── routes/             # Rutas REST (salas, health)
│   ├── services/           # Lógica de negocio (salas, rate limiting)
│   ├── sockets/            # Eventos de Socket.IO
│   ├── .env.example
│   ├── package.json
│   └── server.js           # Entry point
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes UI
│   │   ├── context/        # ChatContext (estado global)
│   │   ├── hooks/          # useAutoScroll
│   │   ├── pages/          # LoginPage, ChatPage
│   │   ├── services/       # socket.js, api.js
│   │   ├── utils/          # avatar.js, format.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Variables de entorno

### server/.env

| Variable | Default | Descripción |
|----------|---------|-------------|
| `PORT` | `4000` | Puerto del servidor |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Origen permitido para CORS |
| `DB_PATH` | `./hablachat.db` | Ruta del archivo SQLite |
| `MAX_MESSAGE_LENGTH` | `1000` | Longitud máxima de mensaje |
| `RATE_LIMIT_WINDOW_MS` | `1000` | Ventana de rate limiting (ms) |
| `RATE_LIMIT_MAX_MESSAGES` | `5` | Mensajes máximos por ventana |

### client/.env

| Variable | Default | Descripción |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:4000` | URL del backend (REST) |
| `VITE_SOCKET_URL` | `http://localhost:4000` | URL del backend (Socket.IO) |

## Eventos de Socket.IO

| Evento | Dirección | Descripción |
|--------|-----------|-------------|
| `sala:unirse` | Cliente → Servidor | Unirse a una sala |
| `sala:salir` | Cliente → Servidor | Salir de la sala actual |
| `mensaje:enviar` | Cliente → Servidor | Enviar mensaje |
| `mensaje:nuevo` | Servidor → Cliente | Nuevo mensaje en la sala |
| `mensaje:sistema` | Servidor → Cliente | Notificación de sistema |
| `escribiendo` | Bidireccional | Indicador de escritura |
| `usuarios:actualizados` | Servidor → Cliente | Lista de usuarios en la sala |

## API REST

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/health` | Estado del servidor |
| `GET` | `/api/salas` | Lista de salas |
| `GET` | `/api/salas/:sala/mensajes?limite=50` | Historial de mensajes |

## Decisiones técnicas

- **Socket.IO** sobre WebSocket puro: reconexión automática, rooms nativos, fallback HTTP.
- **better-sqlite3**: síncrono, sin configuración, ideal para demo y producción ligera.
- **React Context + useReducer**: estado global sin dependencias extra.
- **Tailwind CSS**: estilos consistentes y responsive sin CSS custom extenso.
- **Rate limiting en memoria**: suficiente para una sola instancia (para producción con múltiples instancias, usar Redis).
- **Tema oscuro por defecto**: experiencia íntima y moderna, con toggle a claro.

## Sugerencias para v2

1. **Login con JWT**
   - Tabla `usuarios` en SQLite
   - Endpoints `POST /api/auth/register` y `POST /api/auth/login`
   - Middleware `io.use(authenticateToken)` en Socket.IO
   - Refresh tokens con rotación

2. **Mensajes privados**
   - Evento `mensaje:privado` con room por usuario (`user:<id>`)
   - Endpoint `GET /api/usuarios` para buscar usuarios

3. **Imágenes y archivos**
   - `multer` para subida de archivos
   - Almacenamiento en `uploads/` o S3
   - URL en el mensaje, renderizado condicional

4. **Funcionalidades adicionales**
   - Reacciones a mensajes
   - Hilos de conversación
   - Edición y eliminación de mensajes
   - Búsqueda de mensajes
   - Notificaciones de escritorio

5. **Escalabilidad**
   - Redis adapter para Socket.IO (múltiples instancias)
   - Migración de SQLite a PostgreSQL
   - Cola de mensajes (RabbitMQ/Service Bus) para notificaciones

## Licencia

MIT
