import {
  ApiBadGatewayResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiParam,
} from '@nestjs/swagger';
import { errorResponseSchema } from '../common/errors/error-response.schema.js';

/**
 * Decoradores de documentación propios de los agentes.
 * Solo describen la API en Swagger: no cambian el comportamiento.
 */

export const ApiAgentIdParam = () =>
  ApiParam({
    name: 'id',
    description: 'Identificador del agente (UUID)',
    example: '1c4c8e63-2f0e-4c24-aad6-57b31dfdc208',
  });

export const ApiAgentNotFoundResponse = () =>
  ApiNotFoundResponse({
    description: 'No existe un agente con ese id',
    standardSchema: errorResponseSchema,
    example: {
      statusCode: 404,
      error: 'AGENT_NOT_FOUND',
      message:
        'No existe un agente con el id "1c4c8e63-2f0e-4c24-aad6-57b31dfdc208"',
    },
  });

export const ApiAiProviderErrorResponse = () =>
  ApiBadGatewayResponse({
    description: 'El proveedor de IA falló al generar la respuesta',
    standardSchema: errorResponseSchema,
    example: {
      statusCode: 502,
      error: 'AI_PROVIDER_ERROR',
      message:
        'El proveedor de IA no pudo generar una respuesta. Inténtalo de nuevo.',
    },
  });

/**
 * Ejemplos del cuerpo que se eligen en un desplegable de Swagger: uno válido
 * y los inválidos más comunes, para ver el error sin escribir nada.
 */
export const ApiAgentBodyExamples = () =>
  ApiBody({
    // Nombre que el esquema Zod declara con .meta({ id }) en agents.schemas.ts.
    schema: { $ref: '#/components/schemas/AgentInput' },
    examples: {
      valido: {
        summary: 'Agente válido',
        value: {
          name: 'Asistente de resúmenes',
          instructions: 'Eres un asistente que resume textos',
        },
      },
      nombreVacio: {
        summary: 'Nombre vacío (400)',
        value: { name: '   ', instructions: 'Eres un asistente' },
      },
      sinInstrucciones: {
        summary: 'Sin instrucciones (400)',
        value: { name: 'Asistente de resúmenes' },
      },
    },
  });

export const ApiRunBodyExamples = () =>
  ApiBody({
    schema: { $ref: '#/components/schemas/RunAgentInput' },
    examples: {
      valido: {
        summary: 'Consulta válida',
        value: {
          query: 'Resume este texto: NestJS es un framework de Node.js...',
        },
      },
      conHistorial: {
        summary: 'Segunda consulta de una conversación',
        value: {
          query: 'Ahora hazlo más corto',
          history: [
            { role: 'user', content: 'Resume este texto: NestJS es…' },
            { role: 'assistant', content: 'NestJS es un framework de Node.js…' },
          ],
        },
      },
      consultaVacia: {
        summary: 'Consulta vacía (400)',
        value: { query: '' },
      },
      historialDesordenado: {
        summary: 'Historial que no alterna los roles (400)',
        value: {
          query: 'Hola',
          history: [{ role: 'assistant', content: 'Respuesta suelta' }],
        },
      },
    },
  });
