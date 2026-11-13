import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  ApiUnexpectedErrorResponse,
  ApiValidationErrorResponse,
} from '../common/errors/api-error-responses.js';
import type { Agent, PaginatedAgents, RunResult } from './agent.types.js';
import {
  ApiAgentBodyExamples,
  ApiAgentIdParam,
  ApiAgentNotFoundResponse,
  ApiAiProviderErrorResponse,
  ApiRunBodyExamples,
} from './agents.docs.js';
import {
  agentSchema,
  createAgentSchema,
  listAgentsQuerySchema,
  paginatedAgentsSchema,
  runAgentSchema,
  runResultSchema,
} from './agents.schemas.js';
import type {
  CreateAgentInput,
  ListAgentsQuery,
  RunAgentInput,
} from './agents.schemas.js';
import { AgentsService } from './agents.service.js';

/**
 * Rutas HTTP de los agentes. Solo traduce entre HTTP y el servicio.
 * Los decoradores @Api... documentan cada ruta en Swagger (/api/docs);
 * no cambian su comportamiento.
 */
@ApiTags('Agentes')
@ApiUnexpectedErrorResponse()
@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un agente' })
  @ApiAgentBodyExamples()
  @ApiCreatedResponse({
    description: 'Agente creado',
    standardSchema: agentSchema,
  })
  @ApiValidationErrorResponse()
  create(@Body({ schema: createAgentSchema }) body: CreateAgentInput): Agent {
    return this.agentsService.create(body);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar agentes',
    description: 'Listado paginado, con búsqueda y orden opcionales.',
  })
  @ApiOkResponse({
    description: 'Página de agentes',
    standardSchema: paginatedAgentsSchema,
  })
  @ApiValidationErrorResponse()
  findAll(
    @Query({ schema: listAgentsQuerySchema }) query: ListAgentsQuery,
  ): PaginatedAgents {
    return this.agentsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un agente por su id' })
  @ApiAgentIdParam()
  @ApiOkResponse({
    description: 'Agente encontrado',
    standardSchema: agentSchema,
  })
  @ApiAgentNotFoundResponse()
  findOne(@Param('id') id: string): Agent {
    return this.agentsService.findById(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Editar un agente',
    description: 'Reemplaza el nombre y las instrucciones.',
  })
  @ApiAgentBodyExamples()
  @ApiAgentIdParam()
  @ApiOkResponse({
    description: 'Agente actualizado',
    standardSchema: agentSchema,
  })
  @ApiValidationErrorResponse()
  @ApiAgentNotFoundResponse()
  update(
    @Param('id') id: string,
    @Body({ schema: createAgentSchema }) body: CreateAgentInput,
  ): Agent {
    return this.agentsService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar un agente' })
  @ApiAgentIdParam()
  @ApiNoContentResponse({ description: 'Agente eliminado, sin cuerpo' })
  @ApiAgentNotFoundResponse()
  remove(@Param('id') id: string): void {
    this.agentsService.remove(id);
  }

  // 200 y no 201: ejecutar una consulta no crea ningún recurso.
  // Cada consulta llama al proveedor de IA, que cuesta dinero: 10 por minuto.
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @Post(':id/run')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Consultar a un agente',
    description:
      'Envía la consulta al proveedor de IA junto con las instrucciones del agente.',
  })
  @ApiRunBodyExamples()
  @ApiAgentIdParam()
  @ApiOkResponse({
    description: 'Respuesta del agente',
    standardSchema: runResultSchema,
  })
  @ApiValidationErrorResponse()
  @ApiAgentNotFoundResponse()
  @ApiAiProviderErrorResponse()
  run(
    @Param('id') id: string,
    @Body({ schema: runAgentSchema }) body: RunAgentInput,
  ): Promise<RunResult> {
    return this.agentsService.run(id, body);
  }
}
