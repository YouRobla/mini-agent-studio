import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { AppException, ErrorDetail } from './exceptions.js';

/** Forma única de todas las respuestas de error de la API. */
interface ErrorBody {
  statusCode: number;
  error: string;
  message: string;
  details?: ErrorDetail[];
}

/** Códigos para los errores HTTP que lanza el propio framework. */
const FRAMEWORK_ERROR_CODES: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'BAD_REQUEST',
  [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
  [HttpStatus.PAYLOAD_TOO_LARGE]: 'PAYLOAD_TOO_LARGE',
};

/**
 * Filtro global: convierte cualquier excepción en una respuesta con el mismo
 * formato. Un error inesperado se registra y responde 500, pero nunca detiene
 * el servidor ni filtra detalles internos al cliente.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const body = this.toErrorBody(exception);
    response.status(body.statusCode).json(body);
  }

  private toErrorBody(exception: unknown): ErrorBody {
    if (exception instanceof AppException) {
      return {
        statusCode: exception.getStatus(),
        error: exception.code,
        message: exception.message,
        ...(exception.details && { details: exception.details }),
      };
    }

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      return {
        statusCode,
        error: FRAMEWORK_ERROR_CODES[statusCode] ?? 'HTTP_ERROR',
        message: FRAMEWORK_MESSAGES[statusCode] ?? exception.message,
      };
    }

    this.logger.error(
      'Error no controlado',
      exception instanceof Error ? exception.stack : String(exception),
    );
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'INTERNAL_ERROR',
      message: 'Ocurrió un error inesperado en el servidor',
    };
  }
}

const FRAMEWORK_MESSAGES: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: 'La petición no es válida',
  [HttpStatus.NOT_FOUND]: 'La ruta solicitada no existe',
  [HttpStatus.PAYLOAD_TOO_LARGE]: 'La petición es demasiado grande',
};
