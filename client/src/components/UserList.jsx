import { useChat } from '../context/ChatContext.jsx';
import { colorParaNombre, iniciales } from '../utils/avatar.js';
import { Users } from 'lucide-react';

export default function UserList() {
  const { usuarios, usuario } = useChat();

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
            <div className="relative">
              <div
                className={`w-8 h-8 rounded-full ${colorParaNombre(u)} flex items-center justify-center text-white text-xs font-semibold`}
                aria-hidden="true"
              >
                {iniciales(u)}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full border-2 border-surface" />
            </div>
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
