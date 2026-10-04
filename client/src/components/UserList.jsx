import { useChat } from '../context/ChatContext.jsx';
import { useSettings } from '../context/SettingsContext.jsx';
import Avatar from './Avatar.jsx';
import { Users } from 'lucide-react';

export default function UserList() {
  const { usuarios, usuario } = useChat();
  const { avatar } = useSettings();

  return (
    <div className="p-3">
      <div className="flex items-center gap-2 mb-3 px-2">
        <Users size={14} className="text-secondary" aria-hidden="true" />
        <span className="text-xs font-semibold text-secondary uppercase tracking-wide">
          En línea ({usuarios.length})
        </span>
      </div>
      <ul className="space-y-1" aria-label="Usuarios conectados">
        {usuarios.map((u) => (
          <li
            key={u}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-elevated transition-colors"
          >
            <Avatar
              nombre={u}
              imagen={u === usuario ? avatar : ''}
              tam="sm"
              conEstado
            />
            <span className="text-sm text-primary truncate">
              {u}
              {u === usuario && <span className="text-secondary ml-1">(tú)</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}