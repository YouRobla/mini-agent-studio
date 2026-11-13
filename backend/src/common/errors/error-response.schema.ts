import { z } from 'zod';

/**
 * Forma única de todas las respuestas de error de la API.
 * El filtro global construye sus respuestas con este tipo y Swagger publica
 * este mismo esquema, así que el código y la documentación no pueden diferir.
 */
export const errorResponseSchema = z
  .object({
    statusCode: z.number().int().meta({ description: 'Código de estado HTTP' }),
    error: z.string().meta({
      description: 'Código del error, pensado para programas',
      example: 'VALIDATION_ERROR',
    }),
    message: z.string().meta({ description: 'Explicación para personas' }),
    details: z
      .array(
        z.object({
          field: z.string().meta({ description: 'Campo que falló' }),
          message: z.string().meta({ description: 'Motivo del fallo' }),
        }),
      )
      .optional()
      .meta({
        description: 'Solo en errores de validación: un fallo por campo',
      }),
  })
  .meta({ id: 'ErrorResponse' });

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
