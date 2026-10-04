import { useState, useRef, useCallback } from 'react';
import { Send, Image as ImageIcon, X } from 'lucide-react';
import { useChat } from '../context/ChatContext.jsx';
import { subirImagen } from '../services/api.js';

const MAX_LENGTH = 1000;
const MAX_IMAGEN_MB = 5;

export default function MessageInput() {
  const { enviarMensaje, notificarEscribiendo, salaActual } = useChat();
  const [texto, setTexto] = useState('');
  const [imagenPreview, setImagenPreview] = useState(null);
  const [errorLocal, setErrorLocal] = useState('');
  const [subiendo, setSubiendo] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const debounceRef = useRef(null);

  const handleChange = useCallback((e) => {
    setTexto(e.target.value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      notificarEscribiendo();
    }, 300);
  }, [notificarEscribiendo]);

  const handleFileSelect = useCallback((e) => {
    const archivo = e.target.files?.[0];
    if (!archivo) return;

    if (!archivo.type.startsWith('image/')) {
      setErrorLocal('Solo se permiten imágenes');
      e.target.value = '';
      return;
    }

    if (archivo.size > MAX_IMAGEN_MB * 1024 * 1024) {
      setErrorLocal(`La imagen no puede pesar más de ${MAX_IMAGEN_MB}MB`);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagenPreview({ url: reader.result, archivo });
      setErrorLocal('');
    };
    reader.readAsDataURL(archivo);

    e.target.value = '';
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    const contenido = texto.trim();
    if ((!contenido && !imagenPreview) || !salaActual) return;

    const limpiarInput = () => {
      setTexto('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    };

    if (imagenPreview) {
      setSubiendo(true);
      setErrorLocal('');
      try {
        const res = await subirImagen(imagenPreview.archivo);
        enviarMensaje(contenido, res.url);
        setImagenPreview(null);
        limpiarInput();
      } catch (err) {
        setErrorLocal(err.message || 'No se pudo subir la imagen');
      } finally {
        setSubiendo(false);
      }
    } else {
      enviarMensaje(contenido);
      limpiarInput();
    }
  }, [texto, imagenPreview, salaActual, enviarMensaje]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  const handleInput = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  const cancelarImagen = useCallback(() => {
    setImagenPreview(null);
  }, []);

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t border-border bg-surface">
      {errorLocal && (
        <p className="text-error text-xs mb-2" role="alert">{errorLocal}</p>
      )}

      {imagenPreview && (
        <div className="mb-2 relative inline-block">
          <img
            src={imagenPreview.url}
            alt="Vista previa"
            className="h-20 rounded-lg border border-border object-cover"
          />
          <button
            type="button"
            onClick={cancelarImagen}
            aria-label="Quitar imagen"
            className="absolute -top-2 -right-2 p-1 rounded-full bg-error text-white hover:opacity-80 transition-opacity"
          >
            <X size={12} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Adjuntar imagen"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={subiendo}
          aria-label="Adjuntar imagen"
          className="p-2.5 rounded-xl hover:bg-elevated text-secondary hover:text-primary transition-colors focus-ring disabled:opacity-40"
        >
          <ImageIcon size={18} />
        </button>

        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={texto}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Escribe un mensaje..."
            rows={1}
            maxLength={MAX_LENGTH}
            aria-label="Escribe un mensaje"
            className="w-full resize-none rounded-xl bg-elevated border border-border px-4 py-2.5 text-sm text-primary placeholder:text-secondary focus-ring min-h-[42px] max-h-[120px]"
          />
          <span className="absolute bottom-1.5 right-2 text-[10px] font-mono text-secondary">
            {texto.length}/{MAX_LENGTH}
          </span>
        </div>
        <button
          type="submit"
          disabled={(!texto.trim() && !imagenPreview) || !salaActual || subiendo}
          aria-label="Enviar mensaje"
          className="p-2.5 rounded-xl bg-accent text-white hover:bg-accent-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-ring"
        >
          <Send size={18} aria-hidden="true" />
        </button>
      </div>
      <p className="text-[10px] text-secondary mt-1.5 ml-1">
        Enter para enviar · Shift+Enter para nueva línea · Máx. {MAX_IMAGEN_MB}MB por imagen
      </p>
    </form>
  );
}
