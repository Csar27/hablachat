import { config } from '../config/index.js';

export function crearRateLimiter() {
  const timestamps = new Map();

  return function limitado(socketId) {
    const ahora = Date.now();
    const ventana = config.rateLimitWindowMs;
    const max = config.rateLimitMaxMessages;

    if (!timestamps.has(socketId)) {
      timestamps.set(socketId, []);
    }

    const lista = timestamps.get(socketId).filter((t) => ahora - t < ventana);

    if (lista.length >= max) {
      timestamps.set(socketId, lista);
      return true;
    }

    lista.push(ahora);
    timestamps.set(socketId, lista);
    return false;
  };
}
