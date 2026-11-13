import type Anthropic from '@anthropic-ai/sdk';
import { describe, expect, it, vi } from 'vitest';
import { AnthropicAiProvider } from './anthropic-ai.provider.js';

/** Cliente falso: guarda la petición y devuelve la respuesta indicada, sin red. */
function fakeClient(response: object) {
  const create = vi.fn().mockResolvedValue(response);
  const client = { messages: { create } } as unknown as Pick<
    Anthropic,
    'messages'
  >;
  return { client, create };
}

const request = {
  agentName: 'Asistente de resúmenes',
  instructions: 'Eres un asistente que resume textos',
  query: 'Ahora más corto',
  history: [
    { role: 'user' as const, content: 'Resume esto' },
    { role: 'assistant' as const, content: 'Un resumen' },
  ],
};

describe('AnthropicAiProvider', () => {
  it('envía las instrucciones como sistema y el historial más la consulta', async () => {
    const { client, create } = fakeClient({
      stop_reason: 'end_turn',
      content: [
        { type: 'thinking', thinking: '', signature: 'x' },
        { type: 'text', text: 'Más corto.' },
      ],
    });
    const provider = new AnthropicAiProvider(client, 'claude-haiku-5-5');

    await expect(provider.generate(request)).resolves.toBe('Más corto.');
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'claude-haiku-5-5',
        system: 'Eres un asistente que resume textos',
        output_config: { effort: 'low' },
        messages: [
          { role: 'user', content: 'Resume esto' },
          { role: 'assistant', content: 'Un resumen' },
          { role: 'user', content: 'Ahora más corto' },
        ],
      }),
      { signal: expect.any(AbortSignal) },
    );
  });

  it('trata un rechazo del modelo como fallo del proveedor', async () => {
    const { client } = fakeClient({ stop_reason: 'refusal', content: [] });
    const provider = new AnthropicAiProvider(client, 'claude-haiku-5-5');

    await expect(provider.generate(request)).rejects.toThrow('refusal');
  });
});
