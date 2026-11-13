import { StandardSchemaValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AllExceptionsFilter } from './common/errors/all-exceptions.filter.js';
import { ValidationException } from './common/errors/app.exception.js';

/**
 * Configuración global de la aplicación.
 * Vive fuera de main.ts para que las pruebas e2e usen exactamente la misma.
 */
export function configureApp(app: NestExpressApplication): void {
  app.setGlobalPrefix('api');

  // No anunciar en cada respuesta con qué tecnología está hecho el servidor.
  app.disable('x-powered-by');

  // Detrás de un proxy local (Vite o nginx), la IP real del cliente llega en
  // X-Forwarded-For; sin esto, el límite de peticiones contaría a todos como uno.
  app.set('trust proxy', 'loopback, uniquelocal');

  // Con el proxy de Vite el navegador no necesita CORS; esto es para quien llame
  // al backend directamente desde otro origen (VITE_API_URL).
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  });

  // Valida los parámetros que declaran un esquema: @Body({ schema }).
  // Los fallos se convierten en un error con el detalle por campo.
  app.useGlobalPipes(
    new StandardSchemaValidationPipe({
      exceptionFactory: (issues) =>
        new ValidationException(
          issues.map((issue) => ({
            field: fieldName(issue.path),
            message: issue.message,
          })),
        ),
    }),
  );

  // Todas las respuestas de error salen con el mismo formato.
  app.useGlobalFilters(new AllExceptionsFilter());
}

type IssuePath = ReadonlyArray<PropertyKey | { readonly key: PropertyKey }>;

/** Convierte la ruta de un error de validación en un nombre de campo. */
function fieldName(path: IssuePath | undefined): string {
  if (!path || path.length === 0) return 'body';
  return path
    .map((segment) =>
      String(typeof segment === 'object' ? segment.key : segment),
    )
    .join('.');
}
