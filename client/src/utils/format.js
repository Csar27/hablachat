export function formatearHora(fechaISO) {
  const fecha = new Date(fechaISO);
  return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

export function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO);
  const hoy = new Date();
  const ayer = new Date(hoy);
  ayer.setDate(ayer.getDate() - 1);

  const esHoy = fecha.toDateString() === hoy.toDateString();
  const esAyer = fecha.toDateString() === ayer.toDateString();

  if (esHoy) return 'Hoy';
  if (esAyer) return 'Ayer';

  return fecha.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function esMismaFecha(fechaISO1, fechaISO2) {
  return new Date(fechaISO1).toDateString() === new Date(fechaISO2).toDateString();
}
