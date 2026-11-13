import { HttpStatus } from '@nestjs/common';
import { AppException } from '../common/errors/app.exception.js';

export class AiProviderException extends AppException {
  constructor() {
    super(
      HttpStatus.BAD_GATEWAY,
      'AI_PROVIDER_ERROR',
      'El proveedor de IA no pudo generar una respuesta. Inténtalo de nuevo.',
    );
  }
}
