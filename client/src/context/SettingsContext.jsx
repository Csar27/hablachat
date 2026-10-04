import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const SettingsContext = createContext(null);

const CLAVE = {
  color: 'hablachat:color',
  tema: 'hablachat:tema',
  fondo: 'hablachat:fondo',
  fondoOpacidad: 'hablachat:fondoOpacidad',
  avatar: 'hablachat:avatar',
};

export const COLORES = [
  { id: 'coral', nombre: 'Coral', muestra: '#E85D4A', oscuro: '232 93 74', hover: '240 107 88', claro: '217 74 56', hoverClaro: '190 60 45' },
  { id: 'indigo', nombre: 'Índigo', muestra: '#6366F1', oscuro: '99 102 241', hover: '129 140 248', claro: '79 70 229', hoverClaro: '67 56 202' },
  { id: 'esmeralda', nombre: 'Esmeralda', muestra: '#10B981', oscuro: '16 185 129', hover: '52 211 153', claro: '5 150 105', hoverClaro: '4 120 87' },
  { id: 'violeta', nombre: 'Violeta', muestra: '#A855F7', oscuro: '168 85 247', hover: '192 132 252', claro: '147 51 234', hoverClaro: '126 34 206' },
  { id: 'ambar', nombre: 'Ámbar', muestra: '#F59E0B', oscuro: '245 158 11', hover: '251 191 36', claro: '217 119 6', hoverClaro: '180 83 9' },
  { id: 'rosa', nombre: 'Rosa', muestra: '#EC4899', oscuro: '236 72 153', hover: '244 114 182', claro: '219 39 119', hoverClaro: '190 24 93' },
  { id: 'cian', nombre: 'Cian', muestra: '#06B6D4', oscuro: '6 182 212', hover: '34 211 238', claro: '8 145 178', hoverClaro: '14 116 144' },
  { id: 'lima', nombre: 'Lima', muestra: '#84CC16', oscuro: '132 204 22', hover: '163 230 53', claro: '101 163 13', hoverClaro: '77 124 15' },
];

const COLOR_POR_DEFECTO = COLORES[0].id;
const TEMAS = ['claro', 'oscuro', 'sistema'];

function leer(clave, porDefecto) {
  try {
    const valor = localStorage.getItem(clave);
    return valor === null ? porDefecto : valor;
  } catch {
    return porDefecto;
  }
}

function guardar(clave, valor) {
  try {
    if (valor === null || valor === '') localStorage.removeItem(clave);
    else localStorage.setItem(clave, valor);
  } catch {
    /* cuota excedida: se ignora */
  }
}

function sistemaPrefiereOscuro() {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches;
}

export function SettingsProvider({ children }) {
  const [colorId, setColorId] = useState(() => leer(CLAVE.color, COLOR_POR_DEFECTO));
  const [tema, setTema] = useState(() => {
    const guardado = leer(CLAVE.tema, 'oscuro');
    return TEMAS.includes(guardado) ? guardado : 'oscuro';
  });
  const [fondo, setFondo] = useState(() => leer(CLAVE.fondo, ''));
  const [fondoOpacidad, setFondoOpacidad] = useState(() => {
    const n = Number(leer(CLAVE.fondoOpacidad, 80));
    return Number.isFinite(n) ? Math.min(95, Math.max(20, n)) : 80;
  });
  const [avatar, setAvatar] = useState(() => leer(CLAVE.avatar, ''));
  const [preferenciaSistema, setPreferenciaSistema] = useState(sistemaPrefiereOscuro);

  const temaEfectivo = tema === 'sistema' ? (preferenciaSistema ? 'oscuro' : 'claro') : tema;

  useEffect(() => {
    if (typeof matchMedia === 'undefined') return;
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const alCambiar = (e) => setPreferenciaSistema(e.matches);
    mq.addEventListener('change', alCambiar);
    return () => mq.removeEventListener('change', alCambiar);
  }, []);

  useEffect(() => {
    const raiz = document.documentElement;
    raiz.classList.toggle('dark', temaEfectivo === 'oscuro');
    raiz.classList.toggle('light', temaEfectivo === 'claro');

    const preset = COLORES.find((c) => c.id === colorId) ?? COLORES[0];
    const oscuro = temaEfectivo === 'oscuro';
    raiz.style.setProperty('--color-accent', oscuro ? preset.oscuro : preset.claro);
    raiz.style.setProperty('--color-accent-hover', oscuro ? preset.hover : preset.hoverClaro);
  }, [colorId, temaEfectivo]);

  const cambiarColor = useCallback((id) => {
    setColorId(id);
    guardar(CLAVE.color, id);
  }, []);

  const cambiarTema = useCallback((valor) => {
    if (!TEMAS.includes(valor)) return;
    setTema(valor);
    guardar(CLAVE.tema, valor);
  }, []);

  const cambiarFondo = useCallback((dataUrl) => {
    setFondo(dataUrl || '');
    guardar(CLAVE.fondo, dataUrl || '');
  }, []);

  const cambiarOpacidad = useCallback((valor) => {
    const n = Math.min(95, Math.max(20, Number(valor) || 80));
    setFondoOpacidad(n);
    guardar(CLAVE.fondoOpacidad, String(n));
  }, []);

  const cambiarAvatar = useCallback((dataUrl) => {
    setAvatar(dataUrl || '');
    guardar(CLAVE.avatar, dataUrl || '');
  }, []);

  const restablecer = useCallback(() => {
    setColorId(COLOR_POR_DEFECTO);
    setTema('oscuro');
    setFondo('');
    setFondoOpacidad(80);
    setAvatar('');
    guardar(CLAVE.color, null);
    guardar(CLAVE.tema, null);
    guardar(CLAVE.fondo, null);
    guardar(CLAVE.fondoOpacidad, null);
    guardar(CLAVE.avatar, null);
  }, []);

  const valor = useMemo(
    () => ({
      colorId,
      color: COLORES.find((c) => c.id === colorId) ?? COLORES[0],
      tema,
      temaEfectivo,
      fondo,
      fondoOpacidad,
      avatar,
      cambiarColor,
      cambiarTema,
      cambiarFondo,
      cambiarOpacidad,
      cambiarAvatar,
      restablecer,
    }),
    [
      colorId,
      tema,
      temaEfectivo,
      fondo,
      fondoOpacidad,
      avatar,
      cambiarColor,
      cambiarTema,
      cambiarFondo,
      cambiarOpacidad,
      cambiarAvatar,
      restablecer,
    ]
  );

  return <SettingsContext.Provider value={valor}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings debe usarse dentro de SettingsProvider');
  return ctx;
}