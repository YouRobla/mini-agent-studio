import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Agent } from './agent.types.js';
import { AgentsRepository } from './agents.repository.js';
import { CreateAgentInput } from './agents.schemas.js';

/** Lógica de negocio de los agentes. No conoce HTTP ni SQL. */
@Injectable()
export class AgentsService {
  constructor(private readonly agentsRepository: AgentsRepository) {}

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

  findAll(): Agent[] {
    return this.agentsRepository.findAll();
  }
}
