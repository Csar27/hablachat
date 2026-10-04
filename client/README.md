# HablaChat — Frontend

Interfaz de chat en tiempo real con React + Vite + Tailwind CSS.

## Requisitos

- **Node.js 18 o superior**
- El backend de HablaChat corriendo (ver `../server/README.md`)

## Instalación

```bash
cd client
cp .env.example .env
npm install
```

## Ejecución

```bash
npm run dev       # desarrollo → http://localhost:5173
npm run build     # build de producción → dist/
npm run preview   # sirve el build de producción
npm run lint      # ESLint
npm run format    # Prettier
```

## Variables de entorno

Copia `.env.example` a `.env`:

| Variable | Default | Descripción |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:4000` | URL del backend (REST) |
| `VITE_SOCKET_URL` | `http://localhost:4000` | URL del backend (Socket.IO) |

> Las variables con prefijo `VITE_` quedan incrustadas en el bundle al compilar. No expongas secretos con este prefijo.

## Estructura

```
src/
├── components/
│   ├── MessageList.jsx       → lista de mensajes + scroll
│   ├── MessageBubble.jsx     → burbuja (texto e imagen)
│   ├── MessageInput.jsx      → input + adjuntar imagen
│   ├── UserList.jsx          → usuarios conectados
│   ├── RoomList.jsx          → selector de salas
│   ├── ConnectionStatus.jsx  → estado del socket
│   └── ThemeToggle.jsx       → tema oscuro/claro
├── context/ChatContext.jsx   → estado global (useReducer)
├── hooks/useAutoScroll.js    → auto-scroll inteligente
├── pages/
│   ├── LoginPage.jsx         → entrada con nombre
│   └── ChatPage.jsx          → layout del chat
├── services/
│   ├── socket.js             → cliente Socket.IO
│   └── api.js                → llamadas REST + urlAbsoluta
├── utils/
│   ├── avatar.js             → color e iniciales por nombre
│   ├── format.js             → fecha y hora en español
│   └── sound.js              → sonido y notificaciones
├── App.jsx                   → router con lazy loading
└── main.jsx
```

## Características

- Chat en tiempo real con Socket.IO y reconexión automática
- Salas (General por defecto) + creación de nuevas
- Historial de los últimos 50 mensajes al entrar
- Envío de imágenes (JPG/PNG/GIF/WebP, máx. 5 MB) con vista previa
- Indicador "X está escribiendo..."
- Mensajes de sistema al entrar y salir
- Lista de usuarios conectados en vivo
- Sonido + notificación del navegador
- Tema oscuro (por defecto) y claro, persistido en localStorage
- Responsive: sidebar en drawer en móvil
- Accesible: `aria-live` en mensajes, foco visible, navegación por teclado

## Cómo funciona el estado

Un único `ChatProvider` en `context/ChatContext.jsx` usa `useReducer` para manejar todo el estado:

```js
{ conectado, reconectando, usuario, salaActual, salas,
  mensajes, usuarios, escribiendo, error, cargandoHistorial }
```

Los componentes solo leen datos mediante `useChat()`; ninguno crea su propio socket. Esto evita conexiones duplicadas y mantiene el flujo de datos en un solo lugar.

## Tailwind CSS

Los colores se definen como variables CSS en `src/index.css` y se consumen como utilidades:

```css
/* Modo oscuro (default) */
--color-base: 26 27 30;
--color-accent: 232 93 74;
```

```jsx
<div className="bg-base text-primary border-border">...</div>
```

Cambiar la paleta es editar esas variables, no las clases de cada componente.

## Accesos rápidos

```bash
# Limpiar caché de Vite
rm -rf node_modules/.vite

# Ver errores de lint
npm run lint
```