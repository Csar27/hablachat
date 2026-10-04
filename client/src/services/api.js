const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export function urlAbsoluta(ruta) {
  if (!ruta) return null;
  if (/^https?:\/\//i.test(ruta)) return ruta;
  return `${API_URL}${ruta.startsWith('/') ? ruta : `/${ruta}`}`;
}

async function request(path, options = {}) {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error en la petición');
    }
    return data;
  } catch (error) {
    if (error.name === 'TypeError') {
      throw new Error('No se pudo conectar con el servidor');
    }
    throw error;
  }
}

export function obtenerSalas() {
  return request('/api/salas');
}

export function obtenerMensajes(sala, limite = 50) {
  return request(`/api/salas/${encodeURIComponent(sala)}/mensajes?limite=${limite}`);
}

export async function subirImagen(archivo) {
  const formData = new FormData();
  formData.append('imagen', archivo);

  try {
    const res = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Error al subir imagen');
    }
    return data;
  } catch (error) {
    if (error.name === 'TypeError') {
      throw new Error('No se pudo conectar con el servidor');
    }
    throw error;
  }
}
