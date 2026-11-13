import type OpenAI from 'openai';
import type { AiProvider, AiRequest } from '../ai-provider.js';
import { withAiDeadline } from '../ai.request.js';

/**
 * Proveedor real con la API de OpenAI (Responses API). Adapta el contrato
 * propio a su formato: las instrucciones del agente van en `instructions` y el
 * historial más la consulta, en `input`.
 *
 * No fija el esfuerzo de razonamiento: AI_MODEL puede ser un modelo sin
 * razonamiento y ese parámetro lo haría fallar.
 *
 * Recibe el cliente ya creado (lo crea la fábrica), así las pruebas pueden darle
 * uno falso y no hacen llamadas reales.
 */
export class OpenAiProvider implements AiProvider {
  readonly name = 'openai';

  constructor(
    private readonly client: Pick<OpenAI, 'responses'>,
    readonly model: string,
  ) {}

  async generate({ instructions, history, query }: AiRequest): Promise<string> {
    const response = await withAiDeadline((signal) =>
      this.client.responses.create(
        {
          model: this.model,
          instructions,
          input: [...history, { role: 'user', content: query }],
        },
        { signal },
      ),
    );

    // Sin texto (rechazo del modelo o respuesta incompleta) cuenta como fallo.
    if (!response.output_text) {
      throw new Error(
        `OpenAI no devolvió texto (estado: ${response.status ?? 'desconocido'})`,
      );
    }
    return response.output_text;
  }
}
