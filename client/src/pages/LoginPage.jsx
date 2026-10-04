import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { useChat } from '../context/ChatContext.jsx';
import { solicitarPermisoNotificacion } from '../utils/sound.js';

const MIN_NOMBRE = 2;
const MAX_NOMBRE = 20;

export default function LoginPage() {
  const navigate = useNavigate();
  const { usuario, establecerUsuario } = useChat();
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (usuario) navigate('/chat', { replace: true });
  }, [usuario, navigate]);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const limpio = nombre.trim();

      if (limpio.length < MIN_NOMBRE) {
        setError(`El nombre debe tener al menos ${MIN_NOMBRE} caracteres`);
        return;
      }
      if (limpio.length > MAX_NOMBRE) {
        setError(`El nombre no puede superar ${MAX_NOMBRE} caracteres`);
        return;
      }

      establecerUsuario(limpio);
      solicitarPermisoNotificacion();
    },
    [nombre, establecerUsuario]
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-base">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/10 mb-4">
            <MessageCircle size={32} className="text-accent" aria-hidden="true" />
          </div>
          <h1 className="font-display text-3xl font-bold text-primary">HablaChat</h1>
          <p className="text-secondary text-sm mt-2">Chat en tiempo real, sin complicaciones</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface rounded-2xl p-6 border border-border shadow-xl">
          <label htmlFor="nombre" className="block text-sm font-medium text-primary mb-2">
            Tu nombre
          </label>
          <input
            id="nombre"
            type="text"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              setError('');
            }}
            placeholder="¿Cómo te llamas?"
            maxLength={MAX_NOMBRE}
            autoFocus
            autoComplete="off"
            aria-describedby={error ? 'error-nombre' : undefined}
            aria-invalid={error ? 'true' : 'false'}
            className="w-full px-4 py-3 rounded-xl bg-elevated border border-border text-primary placeholder:text-secondary focus-ring text-sm"
          />
          {error && (
            <p id="error-nombre" className="text-error text-xs mt-2" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={!nombre.trim()}
            className="mt-4 w-full py-3 rounded-xl bg-accent text-white font-medium text-sm hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-ring"
          >
            Entrar al chat
          </button>
          <p className="text-[10px] text-secondary text-center mt-3">
            {MIN_NOMBRE}-{MAX_NOMBRE} caracteres · Sin registro
          </p>
        </form>
      </div>
    </div>
  );
}