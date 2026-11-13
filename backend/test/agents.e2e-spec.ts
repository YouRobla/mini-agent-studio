import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';

describe('Agents API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.DATABASE_PATH = ':memory:';
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    delete process.env.DATABASE_PATH;
  });

  it('GET /api/agents pagina, filtra y valida parámetros de consulta', async () => {
    const server = app.getHttpServer();

    for (let i = 1; i <= 7; i += 1) {
      await request(server)
        .post('/api/agents')
        .send({
          name: `Agente ${i}`,
          instructions: `Instrucción del agente ${i}`,
        })
        .expect(201);
    }

    const defaultRes = await request(server).get('/api/agents').expect(200);
    expect(defaultRes.body.items).toHaveLength(6);
    expect(defaultRes.body.meta).toMatchObject({
      page: 1,
      limit: 6,
      total: 7,
      totalAll: 7,
      totalPages: 2,
      hasNextPage: true,
      hasPrevPage: false,
    });

    const page2Res = await request(server)
      .get('/api/agents?page=2&limit=6')
      .expect(200);
    expect(page2Res.body.items).toHaveLength(1);
    expect(page2Res.body.meta.hasNextPage).toBe(false);
    expect(page2Res.body.meta.hasPrevPage).toBe(true);

    const searchRes = await request(server)
      .get('/api/agents?search=Agente%203')
      .expect(200);
    expect(searchRes.body.items).toHaveLength(1);
    expect(searchRes.body.items[0].name).toBe('Agente 3');

    const firstId = defaultRes.body.items[0].id as string;
    const detailRes = await request(server)
      .get(`/api/agents/${firstId}`)
      .expect(200);
    expect(detailRes.body.id).toBe(firstId);

    await request(server).get('/api/agents/no-existe').expect(404);

    const invalidQuery = await request(server)
      .get('/api/agents?page=0&limit=999')
      .expect(400);
    expect(invalidQuery.body.error).toBe('VALIDATION_ERROR');
  });
});
