import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module.js';
import { DatabaseModule } from '../database/database.module.js';
import { AgentsController } from './agents.controller.js';
import { AgentsRepository } from './agents.repository.js';
import { AgentsService } from './agents.service.js';

@Module({
  imports: [AiModule, DatabaseModule],
  controllers: [AgentsController],
  providers: [AgentsService, AgentsRepository],
})
export class AgentsModule {}
