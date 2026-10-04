import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Hash, LogOut } from 'lucide-react';
import { useChat } from '../context/ChatContext.jsx';
import MessageList from '../components/MessageList.jsx';
import MessageInput from '../components/MessageInput.jsx';
import UserList from '../components/UserList.jsx';
import RoomList from '../components/RoomList.jsx';
import ConnectionStatus from '../components/ConnectionStatus.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';

export default function ChatPage() {
  const navigate = useNavigate();
  const { usuario, salaActual, unirseSala, cargarSalas, error, limpiarError, salir } = useChat();
  const [drawerAbierto, setDrawerAbierto] = useState(false);

  useEffect(() => {
    if (!usuario) {
      navigate('/', { replace: true });
    }
  }, [usuario, navigate]);

  useEffect(() => {
    if (usuario && !salaActual) {
      unirseSala('General');
      cargarSalas();
    }
  }, [usuario, salaActual, unirseSala, cargarSalas]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(limpiarError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, limpiarError]);

  if (!usuario) return null;

  const sidebar = (
    <div className="flex flex-col h-full bg-surface border-r border-border">
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between">
          <span className="font-display font-bold text-primary">HablaChat</span>
          <ThemeToggle />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <RoomList onCerrar={() => setDrawerAbierto(false)} />
      </div>
      <div className="border-t border-border">
        <UserList />
      </div>
    </div>
  );

  return (
    <div className="h-screen flex bg-base overflow-hidden">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex w-72 shrink-0">
        {sidebar}
      </aside>

      {/* Drawer móvil */}
      {drawerAbierto && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerAbierto(false)} />
          <aside className="relative w-72 max-w-[85vw] h-full shadow-2xl">
            {sidebar}
          </aside>
        </div>
      )}

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerAbierto(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-elevated text-secondary focus-ring"
              aria-label="Abrir menú de salas"
            >
              <Menu size={20} aria-hidden="true" />
            </button>
            <div className="flex items-center gap-2">
              <Hash size={18} className="text-accent" aria-hidden="true" />
              <h2 className="font-display font-semibold text-primary">{salaActual || '...'}</h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ConnectionStatus />
            <button
              onClick={salir}
              className="p-2 rounded-lg hover:bg-elevated text-secondary hover:text-error transition-colors focus-ring"
              aria-label="Cerrar sesión"
            >
              <LogOut size={18} aria-hidden="true" />
            </button>
          </div>
        </header>

        {/* Error toast */}
        {error && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-error/10 border border-error/30 text-error text-sm" role="alert">
            {error}
          </div>
        )}

        {/* Mensajes */}
        <MessageList />

        {/* Input */}
        <MessageInput />
      </main>
    </div>
  );
}
