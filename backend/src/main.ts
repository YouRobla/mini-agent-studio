import { Logger } from '@nestjs/common';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';
import { setupSwagger, SWAGGER_PATH } from './swagger.setup.js';

// Lee backend/.env si existe, con la función integrada de Node (sin dotenv).
// Las variables ya definidas en la terminal tienen prioridad sobre el archivo.
const envFile = join(import.meta.dirname, '..', '.env');
if (existsSync(envFile)) process.loadEnvFile(envFile);

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  configureApp(app);
  setupSwagger(app);

  // Al parar con Ctrl+C, Nest avisa a los módulos para que cierren la base de datos.
  app.enableShutdownHooks();

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  const logger = new Logger('Bootstrap');
  logger.log(`API disponible en http://localhost:${port}/api`);
  logger.log(`Documentación en http://localhost:${port}/${SWAGGER_PATH}`);
}
await bootstrap();
