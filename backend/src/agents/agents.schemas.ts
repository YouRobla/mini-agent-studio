import { z } from 'zod';
import type { Agent, PaginatedAgents, RunResult } from './agent.types.js';

/**
 * Reglas de validación de la API. El servidor las aplica siempre,
 * aunque el frontend ya haya validado por su cuenta.
 *
 * Swagger lee estos mismos esquemas para generar la documentación:
 * `.meta()` añade la descripción y el ejemplo que se ven en /api/docs,
 * y su `id` es el nombre con el que aparece el esquema.
 */

export const NAME_MAX_LENGTH = 100;
export const INSTRUCTIONS_MAX_LENGTH = 5000;
export const QUERY_MAX_LENGTH = 5000;
export const HISTORY_MAX_MESSAGES = 20;
export const SEARCH_MAX_LENGTH = 100;
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 6;
export const MAX_LIMIT = 100;

/** Texto obligatorio: se recortan los espacios y no puede quedar vacío. */
function requiredText(requiredMessage: string, maxLength: number) {
  return z
    .string({ error: requiredMessage })
    .trim()
    .min(1, requiredMessage)
    .max(maxLength, `No puede superar los ${maxLength} caracteres`);
}

export const createAgentSchema = z
  .object(
    {
      name: requiredText('El nombre es obligatorio', NAME_MAX_LENGTH).meta({
        description: 'Nombre del agente',
        example: 'Asistente de resúmenes',
      }),
      instructions: requiredText(
        'Las instrucciones son obligatorias',
        INSTRUCTIONS_MAX_LENGTH,
      ).meta({
        description: 'Instrucciones que definen cómo responde el agente',
        example: 'Eres un asistente que resume textos',
      }),
    },
    { error: 'El cuerpo de la petición debe ser un objeto JSON' },
  )
  .meta({ id: 'AgentInput' });

const chatMessageSchema = z
  .object({
    role: z.enum(['user', 'assistant'], {
      error: 'El rol debe ser "user" o "assistant"',
    }),
    content: requiredText('El mensaje no puede estar vacío', QUERY_MAX_LENGTH),
  })
  .meta({ id: 'ChatMessage' });

/**
 * Historial de la conversación. Alterna usuario y agente empezando por el
 * usuario y termina en una respuesta del agente, así la consulta nueva sigue
 * el orden que esperan los modelos.
 */
const historySchema = z
  .array(chatMessageSchema)
  .max(
    HISTORY_MAX_MESSAGES,
    `El historial no puede superar los ${HISTORY_MAX_MESSAGES} mensajes`,
  )
  .refine(
    (messages) =>
      messages.length % 2 === 0 &&
      messages.every((m, i) => m.role === (i % 2 === 0 ? 'user' : 'assistant')),
    'El historial debe alternar "user" y "assistant", empezando por "user"',
  )
  .default([])
  .meta({
    description:
      'Mensajes anteriores de la conversación, del más antiguo al más reciente. Opcional.',
  });

export const runAgentSchema = z
  .object(
    {
      query: requiredText('La consulta es obligatoria', QUERY_MAX_LENGTH).meta({
        description: 'Consulta para el agente',
        example: 'Resume este texto: NestJS es un framework de Node.js...',
      }),
      history: historySchema,
    },
    { error: 'El cuerpo de la petición debe ser un objeto JSON' },
  )
  .meta({ id: 'RunAgentInput' });

export const listAgentsQuerySchema = z.object({
  page: z.coerce
    .number({ error: 'La página debe ser un número' })
    .int('La página debe ser un número entero')
    .min(1, 'La página debe ser mayor o igual a 1')
    .default(DEFAULT_PAGE)
    .meta({ description: 'Número de página, empezando en 1' }),
  limit: z.coerce
    .number({ error: 'El límite debe ser un número' })
    .int('El límite debe ser un número entero')
    .min(1, 'El límite debe ser mayor o igual a 1')
    .max(MAX_LIMIT, `El límite no puede superar ${MAX_LIMIT}`)
    .default(DEFAULT_LIMIT)
    .meta({ description: 'Agentes por página' }),
  search: z
    .string()
    .trim()
    .max(
      SEARCH_MAX_LENGTH,
      `La búsqueda no puede superar los ${SEARCH_MAX_LENGTH} caracteres`,
    )
    .optional()
    .default('')
    .meta({ description: 'Texto a buscar en el nombre o las instrucciones' }),
  sort: z
    .enum(['recent', 'oldest', 'name'], {
      error: 'El orden debe ser recent, oldest o name',
    })
    .optional()
    .default('recent')
    .meta({
      description:
        'Orden: más recientes (recent), más antiguos (oldest) o por nombre (name)',
    }),
});

/** Entero para documentar respuestas, sin los límites técnicos de `.int()`. */
function integer(meta: { description?: string; example?: number } = {}) {
  return z.number().meta({ type: 'integer', ...meta });
}

/**
 * Esquemas de las respuestas. No validan nada: describen en Swagger lo que
 * devuelve cada ruta. `satisfies` hace que el compilador avise si dejan de
 * coincidir con los tipos de agent.types.ts.
 */

export const agentSchema = z
  .object({
    id: z.string().meta({
      description: 'Identificador único (UUID)',
      example: '1c4c8e63-2f0e-4c24-aad6-57b31dfdc208',
    }),
    name: z.string().meta({ example: 'Asistente de resúmenes' }),
    instructions: z
      .string()
      .meta({ example: 'Eres un asistente que resume textos' }),
    createdAt: z.string().meta({
      description: 'Fecha de creación en formato ISO 8601',
      example: '2026-11-13T12:00:00.000Z',
    }),
  })
  .meta({ id: 'Agent' }) satisfies z.ZodType<Agent>;

export const paginatedAgentsSchema = z
  .object({
    items: z.array(agentSchema),
    meta: z.object({
      page: integer({ example: 1 }),
      limit: integer({ example: DEFAULT_LIMIT }),
      total: integer({
        description: 'Agentes que coinciden con la búsqueda',
        example: 1,
      }),
      totalAll: integer({
        description: 'Agentes guardados, sin aplicar la búsqueda',
        example: 1,
      }),
      totalPages: integer({ example: 1 }),
      hasNextPage: z.boolean().meta({ example: false }),
      hasPrevPage: z.boolean().meta({ example: false }),
    }),
  })
  .meta({ id: 'PaginatedAgents' }) satisfies z.ZodType<PaginatedAgents>;

export const runResultSchema = z
  .object({
    agentId: z
      .string()
      .meta({ example: '1c4c8e63-2f0e-4c24-aad6-57b31dfdc208' }),
    response: z.string().meta({
      description: 'Respuesta generada por el proveedor de IA',
      example:
        'Soy «Asistente de resúmenes» y sigo estas instrucciones: «Eres un asistente que resume textos».\nTu consulta fue: «Resume este párrafo».',
    }),
    provider: z.string().meta({
      description: 'Proveedor que generó la respuesta',
      example: 'mock',
    }),
  })
  .meta({ id: 'RunResult' }) satisfies z.ZodType<RunResult>;

export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type RunAgentInput = z.infer<typeof runAgentSchema>;
export type ListAgentsQuery = z.infer<typeof listAgentsQuerySchema>;
