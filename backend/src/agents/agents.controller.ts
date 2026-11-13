import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import type { Agent, PaginatedAgents, RunResult } from './agent.types.js';
import {
  createAgentSchema,
  listAgentsQuerySchema,
  runAgentSchema,
} from './agents.schemas.js';
import type {
  CreateAgentInput,
  ListAgentsQuery,
  RunAgentInput,
} from './agents.schemas.js';
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
  findAll(
    @Query({ schema: listAgentsQuerySchema }) query: ListAgentsQuery,
  ): PaginatedAgents {
    return this.agentsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Agent {
    return this.agentsService.findById(id);
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
