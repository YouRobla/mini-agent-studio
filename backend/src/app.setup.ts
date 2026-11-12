import { INestApplication, StandardSchemaValidationPipe } from '@nestjs/common';

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
  app.useGlobalPipes(new StandardSchemaValidationPipe());
}
