import { HttpStatus } from '@nestjs/common';
import { APIConnectionTimeoutError as OpenAiTimeoutError } from 'openai';
import { APIConnectionTimeoutError as AnthropicTimeoutError } from '@anthropic-ai/sdk';
import { AppException } from '../common/errors/app.exception.js';

/** El proveedor de IA falló. El código y el mensaje dicen por qué, si se sabe. */
export class AiProviderException extends AppException {
  constructor(
    code = 'AI_PROVIDER_ERROR',
    message = 'El proveedor de IA no pudo generar una respuesta. Inténtalo de nuevo.',
  ) {
    super(HttpStatus.BAD_GATEWAY, code, message);
  }
}

/**
 * Traduce un fallo del proveedor a un error para el usuario. Los SDK de Claude y
 * de OpenAI incluyen en sus errores el código HTTP de su API (`status`): con una
 * clave inválida reintentar no sirve, así que el mensaje lo dice.
 */
export function aiProviderErrorFor(error: unknown): AiProviderException {
  if (
    error instanceof OpenAiTimeoutError ||
    error instanceof AnthropicTimeoutError ||
    (error instanceof DOMException && error.name === 'TimeoutError')
  ) {
    return new AiProviderException(
      'AI_PROVIDER_TIMEOUT',
      'El proveedor de IA tardó demasiado en responder. Inténtalo de nuevo.',
    );
  }
  const status =
    typeof error === 'object' && error !== null && 'status' in error
      ? error.status
      : undefined;

  if (status === 401 || status === 403) {
    return new AiProviderException(
      'AI_PROVIDER_AUTH_ERROR',
      'El proveedor de IA rechazó la clave de API. Revisa la configuración del backend (backend/.env).',
    );
  }
  if (status === 429) {
    return new AiProviderException(
      'AI_PROVIDER_RATE_LIMIT',
      'El proveedor de IA está recibiendo demasiadas consultas. Espera un momento e inténtalo de nuevo.',
    );
  }
  return new AiProviderException();
}
