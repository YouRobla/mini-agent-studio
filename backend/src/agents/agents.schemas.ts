import { z } from 'zod';

/**
 * Reglas de validación de la API. El servidor las aplica siempre,
 * aunque el frontend ya haya validado por su cuenta.
 */

export const NAME_MAX_LENGTH = 100;
export const INSTRUCTIONS_MAX_LENGTH = 5000;
export const QUERY_MAX_LENGTH = 5000;

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

export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type RunAgentInput = z.infer<typeof runAgentSchema>;
