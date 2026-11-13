import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { AI_PROVIDER } from '../src/ai/ai-provider.js';
import { MockAiProvider } from '../src/ai/providers/mock-ai.provider.js';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { DATABASE, openDatabase } from '../src/database/database.provider.js';

describe('Límites de peticiones (e2e)', () => {
  let app: NestExpressApplication;
  const provider = new MockAiProvider();
  // Sin la pausa visual del mock: aquí se verifica el guard, no la animación.
  const generate = vi
    .spyOn(provider, 'generate')
    .mockResolvedValue('Respuesta simulada');
  let ids: string[];

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(DATABASE)
      .useValue(openDatabase(':memory:'))
      .overrideProvider(AI_PROVIDER)
      .useValue(provider)
      .compile();
    app = moduleRef.createNestApplication<NestExpressApplication>();
    configureApp(app);
    await app.init();
    ids = [];
    for (const name of ['Primero', 'Segundo']) {
      const res = await request(app.getHttpServer())
        .post('/api/agents')
        .send({ name, instructions: 'Responde brevemente' })
        .expect(201);
      ids.push(res.body.id);
    }
  });

  afterAll(async () => {
    await app.close();
  });

  it('permite 10 consultas entre distintos agentes y bloquea la 11 sin llamar al proveedor', async () => {
    const server = app.getHttpServer();
    for (let i = 0; i < 10; i++) {
      await request(server)
        .post(`/api/agents/${ids[i % 2]}/run`)
        .set('X-Forwarded-For', '203.0.113.10')
        .send({ query: 'Hola' })
        .expect(200);
    }
    const blocked = await request(server)
      .post(`/api/agents/${ids[0]}/run`)
      .set('X-Forwarded-For', '203.0.113.10')
      .send({ query: 'Hola' })
      .expect(429);
    expect(blocked.body).toEqual({
      statusCode: 429,
      error: 'TOO_MANY_REQUESTS',
      message: 'Demasiadas peticiones. Espera un momento e inténtalo de nuevo.',
    });
    expect(Number(blocked.headers['retry-after'])).toBeGreaterThan(0);
    expect(generate).toHaveBeenCalledTimes(10);

    // El proxy local de Supertest es de confianza; otro cliente conserva su cupo.
    await request(server)
      .post(`/api/agents/${ids[0]}/run`)
      .set('X-Forwarded-For', '203.0.113.11')
      .send({ query: 'Hola' })
      .expect(200);
    await request(server)
      .get('/api/agents')
      .set('X-Forwarded-For', '203.0.113.10')
      .expect(200);
  });

  it('cuenta también consultas inválidas antes de llamar al proveedor', async () => {
    const callsBefore = generate.mock.calls.length;
    for (let i = 0; i < 11; i++) {
      await request(app.getHttpServer())
        .post(`/api/agents/${ids[0]}/run`)
        .set('X-Forwarded-For', '203.0.113.12')
        .send({ query: '' })
        .expect(i < 10 ? 400 : 429);
    }
    expect(generate).toHaveBeenCalledTimes(callsBefore);
  });

  it('permite 100 peticiones en una ruta general y bloquea la 101', async () => {
    for (let i = 0; i < 101; i++) {
      await request(app.getHttpServer())
        .get('/api/agents')
        .set('X-Forwarded-For', '203.0.113.13')
        .expect(i < 100 ? 200 : 429);
    }
    await request(app.getHttpServer())
      .get('/api/ai/status')
      .set('X-Forwarded-For', '203.0.113.13')
      .expect(200);
  });
});
