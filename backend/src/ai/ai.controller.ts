import { Controller, Get, Inject } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AI_PROVIDER } from './ai-provider.js';
import type { AiProvider } from './ai-provider.js';
import { aiStatusSchema } from './ai.schemas.js';
import type { AiStatus } from './ai.schemas.js';
import { ApiRateLimitErrorResponse } from '../common/errors/api-error-responses.js';

/** Información sobre el proveedor de IA, para que la interfaz sepa cuál responde. */
@ApiTags('IA')
@ApiRateLimitErrorResponse()
@Controller('ai')
export class AiController {
  constructor(@Inject(AI_PROVIDER) private readonly aiProvider: AiProvider) {}

  @Get('status')
  @ApiOperation({
    summary: 'Proveedor de IA activo',
    description:
      'Lo elige AI_PROVIDER al arrancar el servidor. La interfaz lo muestra en la barra superior.',
  })
  @ApiOkResponse({
    description: 'Proveedor y modelo activos',
    standardSchema: aiStatusSchema,
  })
  status(): AiStatus {
    return { provider: this.aiProvider.name, model: this.aiProvider.model };
  }
}
