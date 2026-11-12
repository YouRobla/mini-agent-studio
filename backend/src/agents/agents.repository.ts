import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { Agent } from './agent.types.js';

/** Fila tal como está guardada en la tabla `agents`. */
interface AgentRow {
  id: string;
  name: string;
  instructions: string;
  created_at: string;
}

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
 * Persistencia de agentes en SQLite (módulo integrado de Node, sin dependencias).
 * Es la única clase que sabe dónde y cómo se guardan los datos.
 * Todas las consultas usan sentencias preparadas con parámetros.
 */
@Injectable()
export class AgentsRepository implements OnModuleDestroy {
  private readonly db: DatabaseSync;

  constructor() {
    const path = resolveDatabasePath();
    if (path !== ':memory:') {
      // En una instalación limpia la carpeta puede no existir todavía.
      mkdirSync(dirname(path), { recursive: true });
    }
    this.db = new DatabaseSync(path);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS agents (
        id           TEXT PRIMARY KEY,
        name         TEXT NOT NULL,
        instructions TEXT NOT NULL,
        created_at   TEXT NOT NULL
      )
    `);
  }

  insert(agent: Agent): void {
    this.db
      .prepare(
        'INSERT INTO agents (id, name, instructions, created_at) VALUES (?, ?, ?, ?)',
      )
      .run(agent.id, agent.name, agent.instructions, agent.createdAt);
  }

  findAll(): Agent[] {
    const rows = this.db
      .prepare(
        'SELECT id, name, instructions, created_at FROM agents ORDER BY created_at DESC, rowid DESC',
      )
      .all() as unknown as AgentRow[];
    return rows.map(toAgent);
  }

  findById(id: string): Agent | undefined {
    const row = this.db
      .prepare(
        'SELECT id, name, instructions, created_at FROM agents WHERE id = ?',
      )
      .get(id) as unknown as AgentRow | undefined;
    return row ? toAgent(row) : undefined;
  }

  onModuleDestroy(): void {
    this.db.close();
  }
}

function toAgent(row: AgentRow): Agent {
  return {
    id: row.id,
    name: row.name,
    instructions: row.instructions,
    createdAt: row.created_at,
  };
}
