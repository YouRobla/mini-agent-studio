import { z } from 'zod';

/** Proveedor de IA activo. Solo describe la respuesta en Swagger. */
export const aiStatusSchema = z
  .object({
    provider: z.string().meta({
      description: 'Proveedor que responde las consultas: mock, anthropic…',
      example: 'mock',
    }),
    model: z.string().nullable().meta({
      description: 'Modelo que responde; null en el modo simulado',
      example: null,
    }),
  })
  .meta({ id: 'AiStatus' });

export type AiStatus = z.infer<typeof aiStatusSchema>;
