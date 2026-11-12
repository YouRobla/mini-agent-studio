import { Body, Controller, Get, Post } from '@nestjs/common';
import type { Agent } from './agent.types.js';
import { createAgentSchema } from './agents.schemas.js';
import type { CreateAgentInput } from './agents.schemas.js';
import { AgentsService } from './agents.service.js';

/** Rutas HTTP de los agentes. Solo traduce entre HTTP y el servicio. */
@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  create(@Body({ schema: createAgentSchema }) body: CreateAgentInput): Agent {
    return this.agentsService.create(body);
  }

  @Get()
  findAll(): Agent[] {
    return this.agentsService.findAll();
  }
}
