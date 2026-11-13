import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AgentsModule } from './agents/agents.module.js';

@Module({
  imports: [
    AgentsModule,
    // Límite por IP y ruta: 100 peticiones por minuto. Protege la API de
    // saturaciones; /run tiene uno más estricto porque gasta dinero en la IA.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
