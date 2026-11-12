import { z } from "zod";

/**
 * Mismas reglas que valida el backend. Aquí sirven para avisar al usuario
 * antes de enviar; la validación que cuenta es siempre la del servidor.
 */

export const NAME_MAX_LENGTH = 100;
export const INSTRUCTIONS_MAX_LENGTH = 5000;
export const QUERY_MAX_LENGTH = 5000;

function requiredText(requiredMessage: string, maxLength: number) {
  return z
    .string()
    .trim()
    .min(1, requiredMessage)
    .max(maxLength, `No puede superar los ${maxLength} caracteres`);
}

export const createAgentSchema = z.object({
  name: requiredText("El nombre es obligatorio", NAME_MAX_LENGTH),
  instructions: requiredText(
    "Las instrucciones son obligatorias",
    INSTRUCTIONS_MAX_LENGTH,
  ),
});

export const runAgentSchema = z.object({
  query: requiredText(
    "Escribe una consulta antes de ejecutar",
    QUERY_MAX_LENGTH,
  ),
});

export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type RunAgentInput = z.infer<typeof runAgentSchema>;
