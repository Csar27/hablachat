import { useChat } from '../context/ChatContext.jsx';
import { useAutoScroll } from '../hooks/useAutoScroll.js';
import MessageBubble from './MessageBubble.jsx';
import { formatearFecha, esMismaFecha } from '../utils/format.js';
import { MessageSquare, ArrowDown } from 'lucide-react';

export default function MessageList() {
  const { mensajes, usuario, cargandoHistorial, escribiendo } = useChat();
  const { containerRef, handleScroll, scrollAlFinal, lejosDelFinal } = useAutoScroll([
    mensajes.length,
  ]);

  if (cargandoHistorial) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-secondary">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Cargando mensajes...</span>
        </div>
      </div>
    );
  }

  if (mensajes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-secondary">
          <MessageSquare size={48} strokeWidth={1.5} aria-hidden="true" />
          <span className="text-sm">No hay mensajes aún. ¡Escribe el primero!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex-1 flex flex-col min-h-0">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4 space-y-0.5"
        role="log"
        aria-live="polite"
        aria-label="Mensajes del chat"
      >
        {mensajes.map((mensaje, i) => {
          const anterior = mensajes[i - 1];
          const mostrarFecha = !anterior || !esMismaFecha(anterior.creado_en, mensaje.creado_en);
          const mostrarAutor =
            !anterior || anterior.autor !== mensaje.autor || mostrarFecha || anterior.sistema;

          return (
            <div key={mensaje.id}>
              {mostrarFecha && (
                <div className="flex items-center gap-3 my-4">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[10px] font-mono text-secondary uppercase tracking-wide">
                    {formatearFecha(mensaje.creado_en)}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>
              )}
              <MessageBubble
                mensaje={mensaje}
                esMio={mensaje.autor === usuario}
                mostrarAutor={mostrarAutor}
                esSistema={mensaje.sistema}
              />
            </div>
          );
        })}
      </div>

      {escribiendo.length > 0 && (
        <div className="px-4 py-1.5 text-xs text-secondary italic" aria-live="polite">
          {escribiendo.join(', ')} {escribiendo.length === 1 ? 'está' : 'están'} escribiendo...
        </div>
      )}

      {lejosDelFinal && (
        <button
          onClick={scrollAlFinal}
          className="absolute bottom-4 right-6 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-elevated border border-border text-secondary hover:text-primary transition-colors shadow-lg focus-ring"
          aria-label="Ir al último mensaje"
        >
          <ArrowDown size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}