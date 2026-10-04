import db from '../db/connection.js';

export function obtenerSalas() {
  return db.prepare('SELECT id, nombre FROM salas ORDER BY nombre').all();
}

export function obtenerSalaPorNombre(nombre) {
  return db.prepare('SELECT id, nombre FROM salas WHERE nombre = ? COLLATE NOCASE').get(nombre);
}

export function crearSala(nombre) {
  const existente = obtenerSalaPorNombre(nombre);
  if (existente) return existente;
  const result = db.prepare('INSERT INTO salas (nombre) VALUES (?)').run(nombre);
  return { id: result.lastInsertRowid, nombre };
}

export function guardarMensaje(salaId, autor, contenido, imagenUrl = null) {
  const result = db.prepare(
    'INSERT INTO mensajes (sala_id, autor, contenido, imagen_url) VALUES (?, ?, ?, ?)'
  ).run(salaId, autor, contenido, imagenUrl);
  return db.prepare('SELECT * FROM mensajes WHERE id = ?').get(result.lastInsertRowid);
}

export function obtenerMensajes(salaId, limite = 50) {
  return db
    .prepare(
      'SELECT id, autor, contenido, imagen_url, creado_en FROM mensajes WHERE sala_id = ? ORDER BY id DESC LIMIT ?'
    )
    .all(salaId, limite)
    .reverse();
}
