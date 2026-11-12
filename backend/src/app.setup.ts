import { INestApplication, StandardSchemaValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/all-exceptions.filter.js';
import { ValidationException } from './common/exceptions.js';

/**
 * Configuración global de la aplicación.
 * Vive fuera de main.ts para que las pruebas e2e usen exactamente la misma.
 */
export function configureApp(app: INestApplication): void {
  app.setGlobalPrefix('api');

  // El frontend corre en otro puerto (Vite), así que el navegador necesita CORS.
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
