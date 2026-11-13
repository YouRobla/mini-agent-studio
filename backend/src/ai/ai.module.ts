import { Module } from '@nestjs/common';
import { AiController } from './ai.controller.js';
import { createAiProvider } from './ai-provider.factory.js';
import { AI_PROVIDER } from './ai-provider.js';

/**
 * Entrega el proveedor de IA a quien pide AI_PROVIDER. Lo construye la fábrica
 * al arrancar, según el .env; añadir un proveedor es añadir un caso a la fábrica.
 */
@Module({
  controllers: [AiController],
  providers: [{ provide: AI_PROVIDER, useFactory: () => createAiProvider() }],
  exports: [AI_PROVIDER],
})
export class AiModule {}
