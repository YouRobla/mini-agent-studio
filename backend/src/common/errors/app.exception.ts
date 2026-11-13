import { HttpException, HttpStatus } from '@nestjs/common';

/** Detalle de un error de validación: qué campo falló y por qué. */
export interface ErrorDetail {
  field: string;
  message: string;
}

/**
 * Excepción base de la aplicación. Lleva un código legible por máquinas
 * (`code`) además del mensaje para personas.
 */
export class AppException extends HttpException {
  constructor(
    status: HttpStatus,
    readonly code: string,
    message: string,
    readonly details?: ErrorDetail[],
  ) {
    super(message, status);
  }
}

export class ValidationException extends AppException {
  constructor(details: ErrorDetail[]) {
    super(
      HttpStatus.BAD_REQUEST,
      'VALIDATION_ERROR',
      'Los datos enviados no son válidos',
      details,
    );
  }
}
