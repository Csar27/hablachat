import { useRef, useCallback, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';

export default function ImageLightbox({ imagenes, indice, onCerrar, onCambiar }) {
  const botonCerrarRef = useRef(null);
  const focoPrevioRef = useRef(null);

  const total = imagenes.length;
  const imagen = imagenes[indice];

  const anterior = useCallback(() => {
    if (total < 2) return;
    onCambiar((indice - 1 + total) % total);
  }, [indice, total, onCambiar]);

  const siguiente = useCallback(() => {
    if (total < 2) return;
    onCambiar((indice + 1) % total);
  }, [indice, total, onCambiar]);

  useEffect(() => {
    focoPrevioRef.current = document.activeElement;
    botonCerrarRef.current?.focus();

    const alPresionar = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCerrar();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        anterior();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        siguiente();
      } else if (e.key === 'Tab') {
        // Mantiene el foco dentro del modal
        const fokusables = botonCerrarRef.current?.parentElement?.querySelectorAll(
          'button:not([disabled]), a[href]'
        );
        if (!fokusables || fokusables.length === 0) return;
        const primero = fokusables[0];
        const ultimo = fokusables[fokusables.length - 1];
        if (e.shiftKey && document.activeElement === primero) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && document.activeElement === ultimo) {
          e.preventDefault();
          primero.focus();
        }
      }
    };

    document.addEventListener('keydown', alPresionar);
    return () => document.removeEventListener('keydown', alPresionar);
  }, [onCerrar, anterior, siguiente]);

  useEffect(() => {
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previo;
    };
  }, []);

  useEffect(() => {
    if (focoPrevioRef.current instanceof HTMLElement) {
      focoPrevioRef.current.focus();
    }
  }, []);

  if (!imagen) return null;

  const nombreArchivo = imagen.url.split('/').pop() || 'imagen';

  return (
    <div className="fixed inset-0 z-[60] flex flex-col">
      <div
        className="absolute inset-0 bg-black/85 backdrop-blur-sm"
        onClick={onCerrar}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Imagen ampliada${total > 1 ? `, ${indice + 1} de ${total}` : ''}`}
        className="relative flex flex-col h-full"
      >
        <header className="flex items-center justify-between gap-3 p-4 shrink-0">
          <div className="min-w-0 text-sm text-white/80">
            {imagen.autor && <span className="font-medium text-white">{imagen.autor}</span>}
            {imagen.contenido && (
              <span className="ml-2 truncate text-white/60">{imagen.contenido}</span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {total > 1 && (
              <span className="text-xs font-mono text-white/60 px-2 py-1 rounded bg-white/10">
                {indice + 1} / {total}
              </span>
            )}
            <a
              href={imagen.url}
              download={nombreArchivo}
              aria-label="Descargar imagen"
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors focus-ring"
            >
              <Download size={18} />
            </a>
            <button
              ref={botonCerrarRef}
              onClick={onCerrar}
              aria-label="Cerrar"
              className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors focus-ring"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        <div className="relative flex-1 flex items-center justify-center px-4 pb-4 min-h-0">
          {total > 1 && (
            <button
              onClick={anterior}
              aria-label="Imagen anterior"
              className="absolute left-2 sm:left-4 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus-ring"
            >
              <ChevronLeft size={22} />
            </button>
          )}

          <img
            src={imagen.url}
            alt={imagen.contenido || `Imagen de ${imagen.autor}`}
            onClick={(e) => e.stopPropagation()}
            className="max-w-full max-h-full object-contain rounded-lg"
          />

          {total > 1 && (
            <button
              onClick={siguiente}
              aria-label="Imagen siguiente"
              className="absolute right-2 sm:right-4 z-10 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus-ring"
            >
              <ChevronRight size={22} />
            </button>
          )}
        </div>

        {imagen.ancho && imagen.alto && (
          <p className="text-center text-xs font-mono text-white/40 pb-3 shrink-0">
            {imagen.ancho} × {imagen.alto}
          </p>
        )}
      </div>
    </div>
  );
}