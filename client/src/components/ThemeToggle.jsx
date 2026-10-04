import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [oscuro, setOscuro] = useState(() => {
    const guardado = localStorage.getItem('hablachat-theme');
    return guardado ? guardado === 'dark' : true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (oscuro) {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    localStorage.setItem('hablachat-theme', oscuro ? 'dark' : 'light');
  }, [oscuro]);

  return (
    <button
      onClick={() => setOscuro(!oscuro)}
      aria-label={oscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      className="p-2 rounded-lg hover:bg-elevated text-secondary hover:text-primary transition-colors focus-ring"
    >
      {oscuro ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
    </button>
  );
}
