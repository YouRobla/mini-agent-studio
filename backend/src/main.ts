import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { configureApp } from './app.setup.js';
import { setupSwagger, SWAGGER_PATH } from './swagger.setup.js';

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
