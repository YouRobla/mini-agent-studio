import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { AI_PROVIDER } from '../ai/ai-provider.js';
import type { AiProvider } from '../ai/ai-provider.js';
import {
  AgentNotFoundException,
  AiProviderException,
} from '../common/exceptions.js';
import { Agent, PaginatedAgents, RunResult } from './agent.types.js';
import { AgentsRepository } from './agents.repository.js';
import {
  CreateAgentInput,
  ListAgentsQuery,
  RunAgentInput,
} from './agents.schemas.js';

/** Lógica de negocio de los agentes. No conoce HTTP ni SQL. */
@Injectable()
export class AgentsService {
  private readonly logger = new Logger(AgentsService.name);

  constructor(
    private readonly agentsRepository: AgentsRepository,
    @Inject(AI_PROVIDER) private readonly aiProvider: AiProvider,
  ) {}

  create(input: CreateAgentInput): Agent {
    const agent: Agent = {
      id: randomUUID(),
      name: input.name,
      instructions: input.instructions,
      createdAt: new Date().toISOString(),
    };
    this.agentsRepository.insert(agent);
    return agent;
  }

  findAll(query: ListAgentsQuery): PaginatedAgents {
    const { items, total, totalAll } =
      this.agentsRepository.findPaginated(query);
    const totalPages = total === 0 ? 0 : Math.ceil(total / query.limit);

    return {
      items,
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalAll,
        totalPages,
        hasNextPage: query.page < totalPages,
        hasPrevPage: query.page > 1 && totalPages > 0,
      },
    };
  }

  findById(id: string): Agent {
    const agent = this.agentsRepository.findById(id);
    if (!agent) {
      throw new AgentNotFoundException(id);
    }
    return agent;
  }

  /** Ejecuta una consulta: une las instrucciones del agente con la consulta. */
  async run(agentId: string, input: RunAgentInput): Promise<RunResult> {
    const agent = this.agentsRepository.findById(agentId);
    if (!agent) {
      throw new AgentNotFoundException(agentId);
    }

    let response: string;
    try {
      response = await this.aiProvider.generate({
        agentName: agent.name,
        instructions: agent.instructions,
        query: input.query,
      });
    } catch (error) {
      // El fallo del proveedor se registra y se traduce a un error controlado.
      this.logger.error(
        `Falló el proveedor de IA "${this.aiProvider.name}"`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new AiProviderException();
    }

    return { agentId: agent.id, response, provider: this.aiProvider.name };
  }
}
