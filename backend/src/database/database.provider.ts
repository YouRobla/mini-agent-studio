import type { Provider } from '@nestjs/common';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

/**
 * Token de inyección de la conexión a SQLite. Quien la necesita la pide con
 * @Inject(DATABASE) en su constructor, sin saber de dónde sale el archivo.
 */
export const DATABASE = Symbol('DATABASE');

/**
 * Busca la raíz del backend (la carpeta con package.json) subiendo desde este
 * archivo. Así la ruta de la base de datos no depende del directorio desde el
 * que se arranca el servidor ni de si el código corre desde src/ o dist/.
 */
function findBackendRoot(): string {
  let dir = import.meta.dirname;
  while (!existsSync(join(dir, 'package.json'))) {
    const parent = dirname(dir);
    if (parent === dir) return process.cwd();
    dir = parent;
  }
  return dir;
}

function resolveDatabasePath(): string {
  return (
    process.env.DATABASE_PATH ?? join(findBackendRoot(), 'data', 'agents.db')
  );
}

/**
 * Pasa un texto a minúsculas y le quita las tildes ("INGLÉS" → "ingles").
 * LOWER() y NOCASE de SQLite solo entienden letras sin tilde, así que sin esto
 * buscar "INGLÉS" no encontraría "inglés" y "Ángel" se ordenaría después de la Z.
 */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/**
 * Abre la base de datos. Con ':memory:' vive solo en memoria: es lo que usan
 * las pruebas para no tocar el archivo real.
 */
export function openDatabase(path = resolveDatabasePath()): DatabaseSync {
  if (path !== ':memory:') {
    // En una instalación limpia la carpeta puede no existir todavía.
    mkdirSync(dirname(path), { recursive: true });
  }
  const db = new DatabaseSync(path);
  // Función propia disponible dentro del SQL: normalize_text(columna).
  db.function('normalize_text', { deterministic: true }, (value) =>
    normalizeText(String(value ?? '')),
  );
  return db;
}

export const databaseProvider: Provider = {
  provide: DATABASE,
  useFactory: () => openDatabase(),
};
