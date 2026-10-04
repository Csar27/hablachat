import db from './connection.js';

function columnaExiste(tabla, columna) {
  const filas = db.prepare(`PRAGMA table_info(${tabla})`).all();
  return filas.some((c) => c.name === columna);
}

export function runMigrations() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS salas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE COLLATE NOCASE,
      creada_en TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS mensajes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sala_id INTEGER NOT NULL,
      autor TEXT NOT NULL,
      contenido TEXT NOT NULL DEFAULT '',
      creado_en TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (sala_id) REFERENCES salas(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_mensajes_sala ON mensajes(sala_id, id DESC);
  `);

  // Migración incremental: agrega columnas a bases de datos ya creadas.
  if (!columnaExiste('mensajes', 'imagen_url')) {
    db.exec('ALTER TABLE mensajes ADD COLUMN imagen_url TEXT');
  }

  const general = db.prepare('SELECT id FROM salas WHERE nombre = ?').get('General');
  if (!general) {
    db.prepare('INSERT INTO salas (nombre) VALUES (?)').run('General');
  }
}