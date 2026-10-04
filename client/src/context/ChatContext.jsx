import { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import { getSocket, disconnectSocket } from '../services/socket.js';
import { obtenerSalas as apiObtenerSalas } from '../services/api.js';
import { reproducirSonidoMensaje, mostrarNotificacion } from '../utils/sound.js';

const ChatContext = createContext(null);

const initialState = {
  conectado: false,
  reconectando: false,
  usuario: null,
  salaActual: null,
  salas: [],
  mensajes: [],
  usuarios: [],
  escribiendo: [],
  error: null,
  cargandoHistorial: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'CONECTADO':
      return { ...state, conectado: true, reconectando: false };
    case 'DESCONECTADO':
      return { ...state, conectado: false, reconectando: true };
    case 'USUARIO_ESTABLECIDO':
      return { ...state, usuario: action.payload };
    case 'SALA_ACTUAL':
      return { ...state, salaActual: action.payload, mensajes: [], usuarios: [], escribiendo: [] };
    case 'SALAS_CARGADAS':
      return { ...state, salas: action.payload };
    case 'MENSAJES_CARGADOS':
      return { ...state, mensajes: action.payload, cargandoHistorial: false };
    case 'MENSAJE_NUEVO':
      return { ...state, mensajes: [...state.mensajes, action.payload] };
    case 'MENSAJE_SISTEMA':
      return {
        ...state,
        mensajes: [
          ...state.mensajes,
          {
            id: `sys-${Date.now()}-${Math.random()}`,
            sistema: true,
            contenido: action.payload.contenido,
            creado_en: new Date().toISOString(),
          },
        ],
      };
    case 'USUARIOS_ACTUALIZADOS':
      return { ...state, usuarios: action.payload };
    case 'ESCRIBIENDO_AGG':
      if (state.escribiendo.includes(action.payload)) return state;
      return { ...state, escribiendo: [...state.escribiendo, action.payload] };
    case 'ESCRIBIENDO_REMOVE':
      return { ...state, escribiendo: state.escribiendo.filter((u) => u !== action.payload) };
    case 'ERROR':
      return { ...state, error: action.payload };
    case 'CARGANDO_HISTORIAL':
      return { ...state, cargandoHistorial: action.payload ?? true };
    case 'LIMPIAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const socketRef = useRef(null);
  const timersRef = useRef({});
  const usuarioRef = useRef(null);
  const salaRef = useRef(null);

  usuarioRef.current = state.usuario;
  salaRef.current = state.salaActual;

  useEffect(() => {
    const guardado = localStorage.getItem('hablachat:nombre');
    if (guardado) dispatch({ type: 'USUARIO_ESTABLECIDO', payload: guardado });

    return () => {
      disconnectSocket();
      Object.values(timersRef.current).forEach(clearTimeout);
    };
  }, []);

  // Los listeners se registran UNA sola vez por usuario: no dependen del reducer.
  useEffect(() => {
    if (!state.usuario) return;

    const socket = getSocket();
    socketRef.current = socket;

    socket.on('connect', () => {
      dispatch({ type: 'CONECTADO' });
      if (salaRef.current) {
        socket.emit('sala:unirse', { nombre: usuarioRef.current, sala: salaRef.current }, (res) => {
          if (res?.success) dispatch({ type: 'MENSAJES_CARGADOS', payload: res.historial });
        });
      }
    });

    socket.on('disconnect', () => dispatch({ type: 'DESCONECTADO' }));

    socket.on('mensaje:nuevo', (mensaje) => {
      dispatch({ type: 'MENSAJE_NUEVO', payload: mensaje });

      if (mensaje.autor === usuarioRef.current) return;

      reproducirSonidoMensaje();

      if (document.hidden) {
        const resumen = mensaje.contenido?.trim() ? mensaje.contenido : 'Envió una imagen';
        mostrarNotificacion(mensaje.autor, resumen.length > 60 ? `${resumen.slice(0, 60)}...` : resumen);
      }
    });

    socket.on('mensaje:sistema', (data) => dispatch({ type: 'MENSAJE_SISTEMA', payload: data }));

    socket.on('usuarios:actualizados', (usuarios) =>
      dispatch({ type: 'USUARIOS_ACTUALIZADOS', payload: usuarios })
    );

    socket.on('escribiendo', ({ usuario }) => {
      if (usuario === usuarioRef.current) return;

      dispatch({ type: 'ESCRIBIENDO_AGG', payload: usuario });
      clearTimeout(timersRef.current[usuario]);
      timersRef.current[usuario] = setTimeout(() => {
        dispatch({ type: 'ESCRIBIENDO_REMOVE', payload: usuario });
      }, 3000);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('mensaje:nuevo');
      socket.off('mensaje:sistema');
      socket.off('usuarios:actualizados');
      socket.off('escribiendo');
    };
  }, [state.usuario]);

  const unirseSala = useCallback((sala) => {
    const socket = socketRef.current;
    if (!socket || !usuarioRef.current) return;

    dispatch({ type: 'CARGANDO_HISTORIAL', payload: true });

    socket.emit('sala:unirse', { nombre: usuarioRef.current, sala }, (res) => {
      if (res?.success) {
        dispatch({ type: 'SALA_ACTUAL', payload: res.sala });
        dispatch({ type: 'MENSAJES_CARGADOS', payload: res.historial });
      } else {
        dispatch({ type: 'ERROR', payload: res?.error || 'No se pudo entrar a la sala' });
        dispatch({ type: 'CARGANDO_HISTORIAL', payload: false });
      }
    });
  }, []);

  const enviarMensaje = useCallback((contenido, imagenUrl = null) => {
    const socket = socketRef.current;
    if (!socket || !salaRef.current) return;

    socket.emit('mensaje:enviar', { contenido, imagenUrl }, (res) => {
      if (!res?.success) {
        dispatch({ type: 'ERROR', payload: res?.error || 'No se pudo enviar el mensaje' });
      }
    });
  }, []);

  const notificarEscribiendo = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || !salaRef.current) return;
    socket.emit('escribiendo');
  }, []);

  const cargarSalas = useCallback(async () => {
    try {
      const res = await apiObtenerSalas();
      dispatch({ type: 'SALAS_CARGADAS', payload: res.data });
    } catch (error) {
      dispatch({ type: 'ERROR', payload: error.message });
    }
  }, []);

  const limpiarError = useCallback(() => dispatch({ type: 'LIMPIAR_ERROR' }), []);

  const establecerUsuario = useCallback((nombre) => {
    localStorage.setItem('hablachat:nombre', nombre);
    dispatch({ type: 'USUARIO_ESTABLECIDO', payload: nombre });
  }, []);

  const salir = useCallback(() => {
    disconnectSocket();
    localStorage.removeItem('hablachat:nombre');
    dispatch({ type: 'USUARIO_ESTABLECIDO', payload: null });
  }, []);

  const value = {
    ...state,
    unirseSala,
    enviarMensaje,
    notificarEscribiendo,
    cargarSalas,
    limpiarError,
    establecerUsuario,
    salir,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat debe usarse dentro de ChatProvider');
  }
  return context;
}