import { useState } from 'react';
import { formatearHora } from '../utils/format.js';
import { colorParaNombre, iniciales } from '../utils/avatar.js';
import { urlAbsoluta } from '../services/api.js';

export default function MessageBubble({ mensaje, esMio, mostrarAutor, esSistema }) {
  const [falloCarga, setFalloCarga] = useState(false);

  if (esSistema) {
    return (
      <div className="flex justify-center my-2" role="status">
        <span className="text-xs text-secondary font-medium px-3 py-1 rounded-full bg-surface">
          {mensaje.contenido}
        </span>
      </div>
    );
  }

  const imagen = urlAbsoluta(mensaje.imagen_url);
  const alineacion = esMio ? 'justify-end' : 'justify-start';
  const burbuja = esMio
    ? 'bg-accent text-white rounded-2xl rounded-br-md'
    : 'bg-surface text-primary rounded-2xl rounded-bl-md border border-border';

  return (
    <div className={`flex ${alineacion} ${mostrarAutor ? 'mt-4' : 'mt-0.5'}`}>
      <div className={`max-w-[75%] sm:max-w-[65%] ${esMio ? 'items-end' : 'items-start'} flex flex-col`}>
        {mostrarAutor && !esMio && (
          <div className="flex items-center gap-2 mb-1 ml-1">
            <div
              className={`w-6 h-6 rounded-full ${colorParaNombre(mensaje.autor)} flex items-center justify-center text-white text-xs font-semibold shrink-0`}
              aria-hidden="true"
            >
              {iniciales(mensaje.autor)}
            </div>
            <span className="text-xs font-medium text-secondary">{mensaje.autor}</span>
          </div>
        )}

        <div className={`${burbuja} overflow-hidden max-w-full`}>
          {imagen && !falloCarga && (
            <img
              src={imagen}
              alt="Imagen adjunta"
              onError={() => setFalloCarga(true)}
              className="block h-auto w-auto max-w-full max-h-72"
              loading="lazy"
            />
          )}

          {imagen && falloCarga && (
            <span className="block px-3.5 py-2 text-xs opacity-70">
              La imagen no se pudo cargar
            </span>
          )}

          {mensaje.contenido && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words px-3.5 py-2">
              {mensaje.contenido}
            </p>
          )}
        </div>

        <span className="text-[10px] text-secondary mt-0.5 ml-1 font-mono">
          {formatearHora(mensaje.creado_en)}
        </span>
      </div>
    </div>
  );
}