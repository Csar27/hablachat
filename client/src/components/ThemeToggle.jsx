import { Sun, Moon, Monitor } from 'lucide-react';
import { useSettings } from '../context/SettingsContext.jsx';

const CICLO = { oscuro: 'claro', claro: 'sistema', sistema: 'oscuro' };
const ICONOS = { oscuro: Moon, claro: Sun, sistema: Monitor };
const ETIQUETAS = { oscuro: 'Tema oscuro', claro: 'Tema claro', sistema: 'Tema del sistema' };

export default function ThemeToggle() {
  const { tema, cambiarTema } = useSettings();

  const siguiente = CICLO[tema] ?? 'oscuro';
  const Icono = ICONOS[tema] ?? Moon;
  const etiqueta = ETIQUETAS[tema] ?? 'Tema';

  return (
    <button
      onClick={() => cambiarTema(siguiente)}
      aria-label={`${etiqueta}. Cambiar a tema ${siguiente}`}
      title={etiqueta}
      className="p-2 rounded-lg hover:bg-elevated text-secondary hover:text-primary transition-colors focus-ring"
    >
      <Icono size={18} aria-hidden="true" />
    </button>
  );
}