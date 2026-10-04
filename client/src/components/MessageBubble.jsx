import { useState } from 'react';
import { formatearHora } from '../utils/format.js';
import { urlAbsoluta } from '../services/api.js';
import { useSettings } from '../context/SettingsContext.jsx';
import Avatar from './Avatar.jsx';

export default function MessageBubble({ mensaje, esMio, mostrarAutor, esSistema }) {
  const { avatar } = useSettings();
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
    <div className={`flex ${alineacion} gap-2 ${mostrarAutor ? 'mt-4' : 'mt-0.5'}`}>
      {mostrarAutor && !esMio && (
        <Avatar nombre={mensaje.autor} tam="sm" className="mt-5" />
      )}

      <div className={`max-w-[75%] sm:max-w-[65%] flex flex-col ${esMio ? 'items-end' : 'items-start'}`}>
        {mostrarAutor && !esMio && (
          <span className="text-xs font-medium text-secondary mb-1 ml-1">{mensaje.autor}</span>
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

      {mostrarAutor && esMio && <Avatar nombre={mensaje.autor} imagen={avatar} tam="sm" className="mt-5" />}
    </div>
  );
}