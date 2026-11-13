import { Inject, Injectable } from '@nestjs/common';
import { DatabaseSync } from 'node:sqlite';
import { DATABASE, normalizeText } from '../database/database.provider.js';
import { Agent, AgentSort, ListAgentsParams } from './agent.types.js';

/** Fila tal como está guardada en la tabla `agents`. */
interface AgentRow {
  id: string;
  name: string;
  instructions: string;
  created_at: string;
}

interface CountRow {
  count: number;
}

const SORT_ORDER_SQL: Record<AgentSort, string> = {
  recent: 'created_at DESC, rowid DESC',
  oldest: 'created_at ASC, rowid ASC',
  name: 'normalize_text(name) ASC, created_at DESC, rowid DESC',
};

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, '\\$&');
}

/**
 * Persistencia de agentes en SQLite (módulo integrado de Node, sin dependencias).
 * Es la única clase que sabe cómo se guardan los agentes: recibe la conexión
 * ya abierta de DatabaseModule y solo contiene las consultas.
 * Todas las consultas usan sentencias preparadas con parámetros.
 */
@Injectable()
export class AgentsRepository {
  constructor(@Inject(DATABASE) private readonly db: DatabaseSync) {
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

  findPaginated(params: ListAgentsParams): {
    items: Agent[];
    total: number;
    totalAll: number;
  } {
    const totalAllRow = this.db
      .prepare('SELECT COUNT(*) AS count FROM agents')
      .get() as unknown as CountRow;
    const totalAll = totalAllRow.count;

    const searchTerm = params.search.trim();
    const hasSearch = searchTerm.length > 0;
    const likeParam = `%${escapeLikePattern(normalizeText(searchTerm))}%`;
    const whereClause = hasSearch
      ? "WHERE normalize_text(name) LIKE ? ESCAPE '\\' OR normalize_text(instructions) LIKE ? ESCAPE '\\'"
      : '';
    const filterArgs = hasSearch ? [likeParam, likeParam] : [];

    const total = hasSearch
      ? (
          this.db
            .prepare(`SELECT COUNT(*) AS count FROM agents ${whereClause}`)
            .get(...filterArgs) as unknown as CountRow
        ).count
      : totalAll;

    const offset = (params.page - 1) * params.limit;
    const orderBy = SORT_ORDER_SQL[params.sort];
    const rows = this.db
      .prepare(
        `SELECT id, name, instructions, created_at FROM agents ${whereClause} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
      )
      .all(...filterArgs, params.limit, offset) as unknown as AgentRow[];

    return {
      items: rows.map(toAgent),
      total,
      totalAll,
    };
  }

  findById(id: string): Agent | undefined {
    const row = this.db
      .prepare(
        'SELECT id, name, instructions, created_at FROM agents WHERE id = ?',
      )
      .get(id) as unknown as AgentRow | undefined;
    return row ? toAgent(row) : undefined;
  }

  /** Reemplaza nombre e instrucciones. Devuelve false si el agente no existe. */
  update(agent: Agent): boolean {
    const result = this.db
      .prepare('UPDATE agents SET name = ?, instructions = ? WHERE id = ?')
      .run(agent.name, agent.instructions, agent.id);
    return Number(result.changes) > 0;
  }

  /** Elimina un agente. Devuelve false si no existía. */
  delete(id: string): boolean {
    const result = this.db.prepare('DELETE FROM agents WHERE id = ?').run(id);
    return Number(result.changes) > 0;
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
