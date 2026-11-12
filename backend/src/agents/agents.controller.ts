import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import type { Agent, RunResult } from './agent.types.js';
import { createAgentSchema, runAgentSchema } from './agents.schemas.js';
import type { CreateAgentInput, RunAgentInput } from './agents.schemas.js';
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

  // 200 y no 201: ejecutar una consulta no crea ningún recurso.
  @Post(':id/run')
  @HttpCode(200)
  run(
    @Param('id') id: string,
    @Body({ schema: runAgentSchema }) body: RunAgentInput,
  ): Promise<RunResult> {
    return this.agentsService.run(id, body);
  }
}
