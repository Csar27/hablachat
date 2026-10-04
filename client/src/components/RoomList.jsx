import { useState } from 'react';
import { Hash, Plus, X } from 'lucide-react';
import { useChat } from '../context/ChatContext.jsx';

export default function RoomList({ onCerrar }) {
  const { salas, salaActual, unirseSala, cargarSalas } = useChat();
  const [mostrarNueva, setMostrarNueva] = useState(false);
  const [nuevaSala, setNuevaSala] = useState('');

  const handleCrearSala = (e) => {
    e.preventDefault();
    const nombre = nuevaSala.trim();
    if (!nombre) return;
    unirseSala(nombre);
    setNuevaSala('');
    setMostrarNueva(false);
    onCerrar?.();
  };

  const handleSeleccionarSala = (nombre) => {
    if (nombre !== salaActual) {
      unirseSala(nombre);
    }
    onCerrar?.();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-secondary uppercase tracking-wide">Salas</span>
          <button
            onClick={() => setMostrarNueva(!mostrarNueva)}
            aria-label="Crear nueva sala"
            className="p-1.5 rounded-lg hover:bg-elevated text-secondary hover:text-primary transition-colors focus-ring"
          >
            {mostrarNueva ? <X size={14} /> : <Plus size={14} />}
          </button>
        </div>

        {mostrarNueva && (
          <form onSubmit={handleCrearSala} className="mb-2">
            <input
              type="text"
              value={nuevaSala}
              onChange={(e) => setNuevaSala(e.target.value)}
              placeholder="Nombre de la sala"
              maxLength={30}
              autoFocus
              className="w-full px-3 py-2 rounded-lg bg-elevated border border-border text-sm text-primary placeholder:text-secondary focus-ring"
            />
            <button
              type="submit"
              disabled={!nuevaSala.trim()}
              className="mt-1.5 w-full py-1.5 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent-hover disabled:opacity-40 transition-colors focus-ring"
            >
              Crear y unirse
            </button>
          </form>
        )}

        <button
          onClick={cargarSalas}
          className="text-[10px] text-secondary hover:text-primary transition-colors"
        >
          Actualizar lista
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2" aria-label="Lista de salas">
        <ul className="space-y-0.5">
          {salas.map((sala) => (
            <li key={sala.id}>
              <button
                onClick={() => handleSeleccionarSala(sala.nombre)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors focus-ring ${
                  sala.nombre === salaActual
                    ? 'bg-accent/10 text-accent font-medium'
                    : 'text-primary hover:bg-elevated'
                }`}
                aria-current={sala.nombre === salaActual ? 'true' : undefined}
              >
                <Hash size={14} className="shrink-0" aria-hidden="true" />
                <span className="truncate">{sala.nombre}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
