import { HttpStatus } from '@nestjs/common';
import { AppException } from '../common/errors/app.exception.js';

export class AgentNotFoundException extends AppException {
  constructor(id: string) {
    super(
      HttpStatus.NOT_FOUND,
      'AGENT_NOT_FOUND',
      `No existe un agente con el id "${id}"`,
    );
  }
}
