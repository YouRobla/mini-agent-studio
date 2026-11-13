import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { AiProvider } from '../ai/ai-provider.js';
import { AgentNotFoundException } from '../common/exceptions.js';
import { AgentsRepository } from './agents.repository.js';
import { listAgentsQuerySchema } from './agents.schemas.js';
import { AgentsService } from './agents.service.js';

const mockAiProvider: AiProvider = {
  name: 'mock',
  generate: async ({ agentName, query }) => `[mock] ${agentName}: ${query}`,
};

describe('AgentsService (paginación, búsqueda y orden)', () => {
  let repository: AgentsRepository;
  let service: AgentsService;

  beforeEach(() => {
    process.env.DATABASE_PATH = ':memory:';
    repository = new AgentsRepository();
    service = new AgentsService(repository, mockAiProvider);
  });

  afterEach(() => {
    repository.onModuleDestroy();
    delete process.env.DATABASE_PATH;
  });

  it('devuelve metadatos vacíos cuando no hay agentes', () => {
    const result = service.findAll(listAgentsQuerySchema.parse({}));

    expect(result).toEqual({
      items: [],
      meta: {
        page: 1,
        limit: 6,
        total: 0,
        totalAll: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    });
  });

  it('pagina correctamente los agentes con page y limit', () => {
    for (let i = 1; i <= 8; i += 1) {
      service.create({
        name: `Agente ${i}`,
        instructions: `Instrucciones ${i}`,
      });
    }

    const page1 = service.findAll(
      listAgentsQuerySchema.parse({ page: 1, limit: 6 }),
    );
    expect(page1.items).toHaveLength(6);
    expect(page1.items[0]?.name).toBe('Agente 8');
    expect(page1.meta).toEqual({
      page: 1,
      limit: 6,
      total: 8,
      totalAll: 8,
      totalPages: 2,
      hasNextPage: true,
      hasPrevPage: false,
    });

    const page2 = service.findAll(
      listAgentsQuerySchema.parse({ page: 2, limit: 6 }),
    );
    expect(page2.items).toHaveLength(2);
    expect(page2.items[0]?.name).toBe('Agente 2');
    expect(page2.items[1]?.name).toBe('Agente 1');
    expect(page2.meta).toEqual({
      page: 2,
      limit: 6,
      total: 8,
      totalAll: 8,
      totalPages: 2,
      hasNextPage: false,
      hasPrevPage: true,
    });
  });

  it('filtra por nombre o instrucciones y escapa caracteres comodín LIKE', () => {
    service.create({ name: 'Resumen 100%', instructions: 'Resume textos' });
    service.create({ name: 'Traductor', instructions: 'Traduce al inglés' });
    service.create({ name: 'Otro_Agente', instructions: 'Ayuda general' });

    const percentMatch = service.findAll(
      listAgentsQuerySchema.parse({ search: '100%' }),
    );
    expect(percentMatch.items.map((a) => a.name)).toEqual(['Resumen 100%']);
    expect(percentMatch.meta.total).toBe(1);
    expect(percentMatch.meta.totalAll).toBe(3);

    const instructionsMatch = service.findAll(
      listAgentsQuerySchema.parse({ search: 'inglés' }),
    );
    expect(instructionsMatch.items.map((a) => a.name)).toEqual(['Traductor']);
  });

  it('ordena por recent, oldest y name', () => {
    service.create({ name: 'Zeta', instructions: '1' });
    service.create({ name: 'alfa', instructions: '2' });
    service.create({ name: 'Beta', instructions: '3' });

    const byName = service.findAll(
      listAgentsQuerySchema.parse({ sort: 'name' }),
    );
    expect(byName.items.map((a) => a.name)).toEqual(['alfa', 'Beta', 'Zeta']);

    const byOldest = service.findAll(
      listAgentsQuerySchema.parse({ sort: 'oldest' }),
    );
    expect(byOldest.items.map((a) => a.name)).toEqual(['Zeta', 'alfa', 'Beta']);

    const byRecent = service.findAll(
      listAgentsQuerySchema.parse({ sort: 'recent' }),
    );
    expect(byRecent.items.map((a) => a.name)).toEqual(['Beta', 'alfa', 'Zeta']);
  });

  it('findById devuelve el agente o lanza AgentNotFoundException', () => {
    const created = service.create({
      name: 'Analista',
      instructions: 'Analiza datos',
    });

    expect(service.findById(created.id)).toEqual(created);
    expect(() => service.findById('no-existe')).toThrow(AgentNotFoundException);
  });
});
