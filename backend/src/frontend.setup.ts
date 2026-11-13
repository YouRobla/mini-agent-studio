import type { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';
import { join } from 'node:path';

/**
 * Sirve el frontend compilado desde el mismo servidor que la API. Solo se usa en
 * Docker (variable FRONTEND_DIST): así basta un contenedor y la página y la API
 * comparten origen, sin CORS. En desarrollo el frontend lo sirve Vite.
 */
export function serveFrontend(app: NestExpressApplication, dir: string): void {
  app.useStaticAssets(dir);

  // Rutas de React Router (/consultar/…): lo que no es la API ni un archivo
  // devuelve index.html, y el router del navegador pinta la página.
  const indexHtml = join(dir, 'index.html');
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      res.sendFile(indexHtml);
      return;
    }
    next();
  });
}
