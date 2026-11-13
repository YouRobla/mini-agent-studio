import type Anthropic from '@anthropic-ai/sdk';
import type { AiProvider, AiRequest } from '../ai-provider.js';
import { withAiDeadline } from '../ai.request.js';

/** Tope de la respuesta. Con Haiku, 16 000 tokens de salida cuestan menos de un céntimo. */
const MAX_TOKENS = 16000;

/**
 * Proveedor real con la API de Claude (Anthropic). Adapta el contrato propio al
 * formato de Claude: las instrucciones del agente van como mensaje de sistema y
 * el historial más la consulta, como la conversación.
 *
 * Recibe el cliente ya creado (lo crea la fábrica), así las pruebas pueden darle
 * uno falso y no hacen llamadas reales.
 */
export class AnthropicAiProvider implements AiProvider {
  readonly name = 'anthropic';

  constructor(
    private readonly client: Pick<Anthropic, 'messages'>,
    readonly model: string,
  ) {}

  async generate({ instructions, history, query }: AiRequest): Promise<string> {
    const response = await withAiDeadline((signal) =>
      this.client.messages.create(
        {
          model: this.model,
          max_tokens: MAX_TOKENS,
          system: instructions,
          // En un chat basta poco razonamiento: respuestas más rápidas y baratas.
          output_config: { effort: 'low' },
          messages: [...history, { role: 'user', content: query }],
        },
        { signal },
      ),
    );

    // Un rechazo del modelo llega con estado 200: hay que mirarlo antes de leer el texto.
    if (response.stop_reason === 'refusal') {
      throw new Error('Claude rechazó responder a esta consulta (refusal)');
    }

    // La respuesta puede traer bloques de razonamiento vacíos: solo cuenta el texto.
    const text = response.content
      .flatMap((block) => (block.type === 'text' ? [block.text] : []))
      .join('');
    if (!text) {
      throw new Error(
        `Claude no devolvió texto (stop_reason: ${response.stop_reason})`,
      );
    }
    return text;
  }
}
