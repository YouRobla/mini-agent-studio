import { z } from 'zod';

/**
 * Reglas de validación de la API. El servidor las aplica siempre,
 * aunque el frontend ya haya validado por su cuenta.
 */

export const NAME_MAX_LENGTH = 100;
export const INSTRUCTIONS_MAX_LENGTH = 5000;
export const QUERY_MAX_LENGTH = 5000;
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

export const createAgentSchema = z.object(
  {
    name: requiredText('El nombre es obligatorio', NAME_MAX_LENGTH),
    instructions: requiredText(
      'Las instrucciones son obligatorias',
      INSTRUCTIONS_MAX_LENGTH,
    ),
  },
  { error: 'El cuerpo de la petición debe ser un objeto JSON' },
);

export const runAgentSchema = z.object(
  {
    query: requiredText('La consulta es obligatoria', QUERY_MAX_LENGTH),
  },
  { error: 'El cuerpo de la petición debe ser un objeto JSON' },
);

export const listAgentsQuerySchema = z.object({
  page: z.coerce
    .number({ error: 'La página debe ser un número' })
    .int('La página debe ser un número entero')
    .min(1, 'La página debe ser mayor o igual a 1')
    .default(DEFAULT_PAGE),
  limit: z.coerce
    .number({ error: 'El límite debe ser un número' })
    .int('El límite debe ser un número entero')
    .min(1, 'El límite debe ser mayor o igual a 1')
    .max(MAX_LIMIT, `El límite no puede superar ${MAX_LIMIT}`)
    .default(DEFAULT_LIMIT),
  search: z
    .string()
    .trim()
    .max(
      SEARCH_MAX_LENGTH,
      `La búsqueda no puede superar los ${SEARCH_MAX_LENGTH} caracteres`,
    )
    .optional()
    .default(''),
  sort: z
    .enum(['recent', 'oldest', 'name'], {
      error: 'El orden debe ser recent, oldest o name',
    })
    .optional()
    .default('recent'),
});

export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type RunAgentInput = z.infer<typeof runAgentSchema>;
export type ListAgentsQuery = z.infer<typeof listAgentsQuerySchema>;
