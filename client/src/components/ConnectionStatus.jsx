import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useChat } from '../context/ChatContext.jsx';

export default function ConnectionStatus() {
  const { conectado, reconectando } = useChat();

  if (conectado) {
    return (
      <div className="flex items-center gap-1.5 text-success text-xs font-medium" role="status">
        <Wifi size={14} aria-hidden="true" />
        <span className="hidden sm:inline">Conectado</span>
      </div>
    );
  }

  if (reconectando) {
    return (
      <div className="flex items-center gap-1.5 text-warning text-xs font-medium" role="status">
        <RefreshCw size={14} className="animate-spin" aria-hidden="true" />
        <span className="hidden sm:inline">Reconectando</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 text-error text-xs font-medium" role="status">
      <WifiOff size={14} aria-hidden="true" />
      <span className="hidden sm:inline">Desconectado</span>
    </div>
  );
}
