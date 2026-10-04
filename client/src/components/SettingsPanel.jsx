import { useRef, useState, useEffect, useCallback } from 'react';
import { X, Image as ImageIcon, User, RotateCcw, Check } from 'lucide-react';
import { useSettings, COLORES } from '../context/SettingsContext.jsx';
import { comprimirImagen, estimarPeso } from '../utils/image.js';
import Avatar from './Avatar.jsx';

const TEMAS = [
  { id: 'claro', nombre: 'Claro' },
  { id: 'oscuro', nombre: 'Oscuro' },
  { id: 'sistema', nombre: 'Sistema' },
];

export default function SettingsPanel({ abierto, onCerrar, usuario }) {
  const {
    colorId,
    tema,
    fondo,
    fondoOpacidad,
    avatar,
    cambiarColor,
    cambiarTema,
    cambiarFondo,
    cambiarOpacidad,
    cambiarAvatar,
    restablecer,
  } = useSettings();

  const fondoRef = useRef(null);
  const avatarRef = useRef(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState('');

  useEffect(() => {
    if (!abierto) return;
    const alPresionar = (e) => {
      if (e.key === 'Escape') onCerrar();
    };
    document.addEventListener('keydown', alPresionar);
    return () => document.removeEventListener('keydown', alPresionar);
  }, [abierto, onCerrar]);

  const procesar = useCallback(async (archivo, destino) => {
    setError('');
    setCargando(destino);
    try {
      const dataUrl = await comprimirImagen(archivo, destino === 'fondo' ? 1600 : 256, destino === 'fondo' ? 0.72 : 0.85);
      if (destino === 'fondo') cambiarFondo(dataUrl);
      else cambiarAvatar(dataUrl);
    } catch (err) {
      setError(err.message || 'No se pudo procesar la imagen');
    } finally {
      setCargando('');
    }
  }, [cambiarFondo, cambiarAvatar]);

  if (!abierto) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onCerrar} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Configuración"
        className="relative w-full sm:max-w-md bg-surface border border-border rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto"
      >
        <header className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-surface border-b border-border">
          <h2 className="font-display text-lg font-semibold text-primary">Configuración</h2>
          <button
            onClick={onCerrar}
            aria-label="Cerrar configuración"
            className="p-2 rounded-lg hover:bg-elevated text-secondary hover:text-primary transition-colors focus-ring"
          >
            <X size={18} />
          </button>
        </header>

        <div className="p-5 space-y-6">
          {error && (
            <p className="text-error text-xs bg-error/10 border border-error/30 rounded-lg px-3 py-2" role="alert">
              {error}
            </p>
          )}

          {/* Avatar */}
          <section>
            <h3 className="text-xs font-semibold text-secondary uppercase tracking-wide mb-3">
              Tu avatar
            </h3>
            <div className="flex items-center gap-4">
              <Avatar nombre={usuario || '?'} imagen={avatar} tam="lg" />
              <div className="flex-1 flex flex-wrap gap-2">
                <input
                  ref={avatarRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) procesar(f, 'avatar');
                    e.target.value = '';
                  }}
                  className="hidden"
                />
                <button
                  onClick={() => avatarRef.current?.click()}
                  disabled={cargando === 'avatar'}
                  className="px-3 py-2 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:opacity-50 transition-colors focus-ring"
                >
                  {cargando === 'avatar' ? 'Subiendo...' : avatar ? 'Cambiar' : 'Subir foto'}
                </button>
                {avatar && (
                  <button
                    onClick={() => cambiarAvatar('')}
                    className="px-3 py-2 rounded-lg text-sm text-secondary hover:text-error transition-colors focus-ring"
                  >
                    Quitar
                  </button>
                )}
              </div>
            </div>
            <p className="text-[11px] text-secondary mt-2">Se muestra en tu lista y en tus mensajes.</p>
          </section>

          {/* Color */}
          <section>
            <h3 className="text-xs font-semibold text-secondary uppercase tracking-wide mb-3">
              Color
            </h3>
            <div className="grid grid-cols-8 gap-2">
              {COLORES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => cambiarColor(c.id)}
                  aria-label={c.nombre}
                  aria-pressed={colorId === c.id}
                  title={c.nombre}
                  className={`relative aspect-square rounded-full transition-transform hover:scale-110 focus-ring ${
                    colorId === c.id ? 'ring-2 ring-offset-2 ring-offset-surface ring-primary' : ''
                  }`}
                  style={{ backgroundColor: c.muestra }}
                >
                  {colorId === c.id && <Check size={14} className="absolute inset-0 m-auto text-white" />}
                </button>
              ))}
            </div>
          </section>

          {/* Tema */}
          <section>
            <h3 className="text-xs font-semibold text-secondary uppercase tracking-wide mb-3">
              Tema
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {TEMAS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => cambiarTema(t.id)}
                  aria-pressed={tema === t.id}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-ring ${
                    tema === t.id
                      ? 'bg-accent text-white'
                      : 'bg-elevated text-secondary hover:text-primary'
                  }`}
                >
                  {t.nombre}
                </button>
              ))}
            </div>
          </section>

          {/* Fondo */}
          <section>
            <h3 className="text-xs font-semibold text-secondary uppercase tracking-wide mb-3">
              Fondo del chat
            </h3>
            <input
              ref={fondoRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) procesar(f, 'fondo');
                e.target.value = '';
              }}
              className="hidden"
            />

            {fondo ? (
              <div className="space-y-3">
                <div
                  className="h-24 rounded-xl border border-border bg-cover bg-center"
                  style={{ backgroundImage: `url(${fondo})` }}
                  role="img"
                  aria-label="Vista previa del fondo"
                />
                <div>
                  <label htmlFor="opacidad-fondo" className="block text-xs text-secondary mb-1.5">
                    Intensidad del fondo: {fondoOpacidad}%
                  </label>
                  <input
                    id="opacidad-fondo"
                    type="range"
                    min="20"
                    max="95"
                    value={fondoOpacidad}
                    onChange={(e) => cambiarOpacidad(e.target.value)}
                    className="w-full accent-[rgb(var(--color-accent))]"
                  />
                </div>
                <button
                  onClick={() => cambiarFondo('')}
                  className="px-3 py-2 rounded-lg text-sm text-secondary hover:text-error transition-colors focus-ring"
                >
                  Quitar fondo
                </button>
              </div>
            ) : (
              <button
                onClick={() => fondoRef.current?.click()}
                disabled={cargando === 'fondo'}
                className="w-full py-6 rounded-xl border border-dashed border-border text-secondary hover:text-primary hover:border-accent transition-colors focus-ring flex flex-col items-center gap-2"
              >
                <ImageIcon size={22} />
                <span className="text-sm">
                  {cargando === 'fondo' ? 'Procesando...' : 'Subir imagen de fondo'}
                </span>
              </button>
            )}
            <p className="text-[11px] text-secondary mt-2">
              {fondo ? `≈ ${estimarPeso(fondo)} KB guardados` : 'Se reduce y optimiza automáticamente.'}
            </p>
          </section>

          <button
            onClick={restablecer}
            className="w-full py-2.5 rounded-lg border border-border text-sm text-secondary hover:text-error hover:border-error transition-colors focus-ring flex items-center justify-center gap-2"
          >
            <RotateCcw size={14} />
            Restablecer valores
          </button>

          <p className="text-[11px] text-secondary flex items-center gap-1.5 justify-center">
            <User size={12} />
            Se guarda solo en este navegador
          </p>
        </div>
      </div>
    </div>
  );
}