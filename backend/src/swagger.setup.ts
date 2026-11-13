import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const SWAGGER_PATH = 'api/docs';

/**
 * Publica la documentación interactiva de la API (Swagger UI) en /api/docs
 * y el documento OpenAPI en /api/docs-json.
 *
 * El documento se genera al arrancar leyendo los controladores: las rutas
 * salen de @Get/@Post..., y los cuerpos y parámetros, de los mismos esquemas
 * Zod que validan las peticiones.
 */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Mini Agent Studio API')
    .setDescription(
      [
        'API para crear, listar, editar, eliminar y consultar agentes de IA.',
        'Por defecto funciona en modo simulado, sin API key. Con `AI_PROVIDER=anthropic` en `backend/.env` responde Claude; `GET /api/ai/status` dice cuál está activo.',
        '',
        '**Cómo probar el flujo completo desde esta página**',
        '',
        '1. `POST /api/agents`: elige el ejemplo «Agente válido» y pulsa **Execute**.',
        '2. Copia el `id` de la respuesta.',
        '3. `POST /api/agents/{id}/run`: pega el `id`, pulsa **Execute** y verás la respuesta del agente.',
        '',
        'Cada ruta trae también ejemplos con datos inválidos para ver el error que devuelve.',
        'Todos los errores tienen el mismo formato: `statusCode`, `error`, `message` y, en los de validación, `details`.',
      ].join('\n'),
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(SWAGGER_PATH, app, document, {
    customSiteTitle: 'Mini Agent Studio · API',
    swaggerOptions: {
      // Los campos ya salen editables, sin pulsar antes «Try it out».
      tryItOutEnabled: true,
      // Muestra cuánto tardó cada petición.
      displayRequestDuration: true,
      // Lista de rutas visible y plegada; los esquemas, al final y cerrados.
      docExpansion: 'list',
      defaultModelsExpandDepth: 0,
    },
  });
}
