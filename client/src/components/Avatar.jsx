import { colorParaNombre, iniciales } from '../utils/avatar.js';

export default function Avatar({ nombre, imagen, tam = 'md', conEstado = false, className = '' }) {
  const tamanos = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
  };

  const base = tamanos[tam] ?? tamanos.md;

  return (
    <div className={`relative shrink-0 ${className}`}>
      {imagen ? (
        <img
          src={imagen}
          alt={`Avatar de ${nombre}`}
          className={`${base} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${base} rounded-full ${colorParaNombre(nombre)} flex items-center justify-center text-white font-semibold`}
          aria-hidden="true"
        >
          {iniciales(nombre)}
        </div>
      )}

      {conEstado && (
        <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-surface" />
      )}
    </div>
  );
}