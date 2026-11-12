import { Module } from '@nestjs/common';
import { AI_PROVIDER } from './ai-provider.js';
import { MockAiProvider } from './mock-ai.provider.js';

/**
 * Decide qué implementación se entrega cuando alguien pide AI_PROVIDER.
 * Conectar un LLM real es cambiar `useClass` aquí; nada más se toca.
 */
@Module({
  providers: [{ provide: AI_PROVIDER, useClass: MockAiProvider }],
  exports: [AI_PROVIDER],
})
export class AiModule {}
