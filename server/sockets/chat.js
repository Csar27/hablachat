import { crearRateLimiter } from '../services/rateLimiter.js';
import {
  obtenerSalaPorNombre,
  crearSala,
  guardarMensaje,
  obtenerMensajes,
} from '../services/salaService.js';
import { config } from '../config/index.js';

const NOMBRE_MAX = 20;
const SALA_MAX = 30;
const HISTORIAL_MAX = 50;

function validarNombre(nombre) {
  return typeof nombre === 'string' && nombre.trim().length >= 2 && nombre.trim().length <= NOMBRE_MAX;
}

function validarSala(sala) {
  return typeof sala === 'string' && sala.trim().length >= 1 && sala.trim().length <= SALA_MAX;
}

function validarMensaje(contenido) {
  return (
    typeof contenido === 'string' &&
    contenido.trim().length >= 1 &&
    contenido.length <= config.maxMessageLength
  );
}

function validarImagen(imagenUrl) {
  if (imagenUrl === null || imagenUrl === undefined) return false;
  if (typeof imagenUrl !== 'string') return false;
  return /^\/uploads\/[A-Za-z0-9._-]+$/.test(imagenUrl);
}

export function registrarChat(io) {
  const limitar = crearRateLimiter();
  const usuariosPorSala = new Map();

  function obtenerUsuarios(sala) {
    return Array.from(usuariosPorSala.get(sala) || []);
  }

  function broadcastUsuarios(sala) {
    io.to(sala).emit('usuarios:actualizados', obtenerUsuarios(sala));
  }

  function salirDeSala(socket, usuario, sala) {
    socket.leave(sala);
    const lista = usuariosPorSala.get(sala);
    if (lista) {
      lista.delete(usuario);
      if (lista.size === 0) usuariosPorSala.delete(sala);
    }
    io.to(sala).emit('mensaje:sistema', { contenido: `${usuario} salió de la sala` });
    broadcastUsuarios(sala);
  }

  io.on('connection', (socket) => {
    let usuario = null;
    let salaActual = null;

    socket.on('sala:unirse', (payload, callback) => {
      try {
        const { nombre, sala } = payload || {};

        if (!validarNombre(nombre) || !validarSala(sala)) {
          return callback?.({ success: false, error: 'Nombre o sala inválidos' });
        }

        const nombreLimpio = nombre.trim();
        const salaLimpia = sala.trim();

        if (salaActual) {
          salirDeSala(socket, usuario, salaActual);
          salaActual = null;
        }

        let salaDb = obtenerSalaPorNombre(salaLimpia) || crearSala(salaLimpia);

        usuario = nombreLimpio;
        salaActual = salaLimpia;
        socket.join(salaActual);

        if (!usuariosPorSala.has(salaActual)) {
          usuariosPorSala.set(salaActual, new Set());
        }
        usuariosPorSala.get(salaActual).add(usuario);

        const historial = obtenerMensajes(salaDb.id, HISTORIAL_MAX);

        callback?.({ success: true, sala: salaDb.nombre, historial });

        socket.to(salaActual).emit('mensaje:sistema', { contenido: `${usuario} se unió a la sala` });
        broadcastUsuarios(salaActual);
      } catch (error) {
        console.error('[socket] sala:unirse:', error.message);
        callback?.({ success: false, error: 'No se pudo entrar a la sala' });
      }
    });

    socket.on('mensaje:enviar', (payload, callback) => {
      try {
        if (!usuario || !salaActual) {
          return callback?.({ success: false, error: 'No estás en una sala' });
        }

        const { contenido, imagenUrl } = payload || {};
        const tieneContenido = validarMensaje(contenido);
        const tieneImagen = validarImagen(imagenUrl);

        if (!tieneContenido && !tieneImagen) {
          return callback?.({ success: false, error: 'Mensaje inválido' });
        }

        if (contenido && contenido.length > config.maxMessageLength) {
          return callback?.({ success: false, error: 'Mensaje demasiado largo' });
        }

        if (limitar(socket.id)) {
          return callback?.({ success: false, error: 'Demasiados mensajes, espera un momento' });
        }

        const salaDb = obtenerSalaPorNombre(salaActual);
        if (!salaDb) return callback?.({ success: false, error: 'La sala ya no existe' });

        const mensaje = guardarMensaje(
          salaDb.id,
          usuario,
          tieneContenido ? contenido.trim() : '',
          tieneImagen ? imagenUrl : null
        );

        io.to(salaActual).emit('mensaje:nuevo', mensaje);
        callback?.({ success: true });
      } catch (error) {
        console.error('[socket] mensaje:enviar:', error.message);
        callback?.({ success: false, error: 'No se pudo guardar el mensaje' });
      }
    });

    socket.on('escribiendo', () => {
      if (!usuario || !salaActual) return;
      socket.to(salaActual).emit('escribiendo', { usuario });
    });

    socket.on('sala:salir', () => {
      if (!salaActual || !usuario) return;
      try {
        salirDeSala(socket, usuario, salaActual);
      } catch (error) {
        console.error('[socket] sala:salir:', error.message);
      } finally {
        salaActual = null;
        usuario = null;
      }
    });

    socket.on('disconnect', () => {
      if (!salaActual || !usuario) return;
      try {
        salirDeSala(socket, usuario, salaActual);
      } catch (error) {
        console.error('[socket] disconnect:', error.message);
      }
    });
  });
}