import {
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { errorResponseSchema } from './error-response.schema.js';

/**
 * Decoradores de documentación para los errores comunes a cualquier ruta.
 * Solo describen la respuesta en Swagger: no cambian el comportamiento.
 */

export const ApiValidationErrorResponse = () =>
  ApiBadRequestResponse({
    description: 'Los datos enviados no son válidos',
    standardSchema: errorResponseSchema,
    example: {
      statusCode: 400,
      error: 'VALIDATION_ERROR',
      message: 'Los datos enviados no son válidos',
      details: [{ field: 'name', message: 'El nombre es obligatorio' }],
    },
  });

export const ApiUnexpectedErrorResponse = () =>
  ApiInternalServerErrorResponse({
    description: 'Error inesperado del servidor',
    standardSchema: errorResponseSchema,
    example: {
      statusCode: 500,
      error: 'INTERNAL_ERROR',
      message: 'Ocurrió un error inesperado en el servidor',
    },
  });

export const ApiRateLimitErrorResponse = (limit = 100) =>
  ApiTooManyRequestsResponse({
    description: `Límite de ${limit} peticiones por minuto por IP y ruta. En /run se comparte entre todos los agentes.`,
    standardSchema: errorResponseSchema,
    headers: {
      'Retry-After': {
        description: 'Segundos que hay que esperar antes de reintentar',
        schema: { type: 'integer' },
      },
    },
    example: {
      statusCode: 429,
      error: 'TOO_MANY_REQUESTS',
      message: 'Demasiadas peticiones. Espera un momento e inténtalo de nuevo.',
    },
  });
