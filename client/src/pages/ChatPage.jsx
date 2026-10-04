import { useState, useEffect } from 'react';
import { Menu, Hash, LogOut, Settings } from 'lucide-react';
import { useChat } from '../context/ChatContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import MessageList from '../components/MessageList.jsx';
import MessageInput from '../components/MessageInput.jsx';
import UserList from '../components/UserList.jsx';
import RoomList from '../components/RoomList.jsx';
import ConnectionStatus from '../components/ConnectionStatus.jsx';
import ThemeToggle from '../components/ThemeToggle.jsx';
import SettingsPanel from '../components/SettingsPanel.jsx';
import Avatar from '../components/Avatar.jsx';

export default function ChatPage() {
  const { usuario, salaActual, unirseSala, cargarSalas, error, limpiarError, salir } = useChat();
  const { avatar, fondo, fondoOpacidad } = useSettings();
  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const [ajustesAbierto, setAjustesAbierto] = useState(false);

  useEffect(() => {
    if (usuario && !salaActual) {
      unirseSala('General');
      cargarSalas();
    }
  }, [usuario, salaActual, unirseSala, cargarSalas]);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(limpiarError, 5000);
    return () => clearTimeout(t);
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
      <aside className="hidden lg:flex w-72 shrink-0">{sidebar}</aside>

      {drawerAbierto && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerAbierto(false)} />
          <aside className="relative w-72 max-w-[85vw] h-full shadow-2xl">{sidebar}</aside>
        </div>
      )}

      <main className="flex-1 flex flex-col min-w-0 min-h-0">
        <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerAbierto(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-elevated text-secondary focus-ring"
              aria-label="Abrir menú de salas"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <Hash size={18} className="text-accent" aria-hidden="true" />
              <h2 className="font-display font-semibold text-primary">{salaActual || '...'}</h2>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-3">
            <ConnectionStatus />
            <button
              onClick={() => setAjustesAbierto(true)}
              aria-label="Abrir configuración"
              className="p-2 rounded-lg hover:bg-elevated text-secondary hover:text-primary transition-colors focus-ring"
            >
              <Settings size={18} />
            </button>
            <Avatar nombre={usuario} imagen={avatar} tam="sm" />
            <button
              onClick={salir}
              aria-label="Cerrar sesión"
              className="p-2 rounded-lg hover:bg-elevated text-secondary hover:text-error transition-colors focus-ring"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {error && (
          <div
            className="mx-4 mt-3 p-3 rounded-xl bg-error/10 border border-error/30 text-error text-sm"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="relative flex-1 flex flex-col min-h-0">
          {fondo && (
            <>
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${fondo})` }}
                aria-hidden="true"
              />
              <div
                className="absolute inset-0 bg-base"
                style={{ opacity: fondoOpacidad / 100 }}
                aria-hidden="true"
              />
            </>
          )}
          <div className="relative flex-1 flex flex-col min-h-0">
            <MessageList />
          </div>
        </div>

        <MessageInput />
      </main>

      <SettingsPanel
        abierto={ajustesAbierto}
        onCerrar={() => setAjustesAbierto(false)}
        usuario={usuario}
      />
    </div>
  );
}