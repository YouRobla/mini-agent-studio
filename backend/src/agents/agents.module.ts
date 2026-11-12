import { Module } from '@nestjs/common';
import { AgentsRepository } from './agents.repository.js';

@Module({
  providers: [AgentsRepository],
})
export class AgentsModule {}
