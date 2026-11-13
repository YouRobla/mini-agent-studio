import type OpenAI from 'openai';
import { describe, expect, it, vi } from 'vitest';
import { OpenAiProvider } from './openai-ai.provider.js';

/** Cliente falso: guarda la petición y devuelve la respuesta indicada, sin red. */
function fakeClient(response: object) {
  const create = vi.fn().mockResolvedValue(response);
  const client = { responses: { create } } as unknown as Pick<
    OpenAI,
    'responses'
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

describe('OpenAiProvider', () => {
  it('envía las instrucciones aparte y el historial más la consulta como input', async () => {
    const { client, create } = fakeClient({
      status: 'completed',
      output_text: 'Más corto.',
    });
    const provider = new OpenAiProvider(client, 'gpt-6.1-terra');

    await expect(provider.generate(request)).resolves.toBe('Más corto.');
    expect(create).toHaveBeenCalledWith({
      model: 'gpt-6.1-terra',
      instructions: 'Eres un asistente que resume textos',
      input: [
        { role: 'user', content: 'Resume esto' },
        { role: 'assistant', content: 'Un resumen' },
        { role: 'user', content: 'Ahora más corto' },
      ],
    });
  });

  it('trata una respuesta sin texto como fallo del proveedor', async () => {
    const { client } = fakeClient({ status: 'incomplete', output_text: '' });
    const provider = new OpenAiProvider(client, 'gpt-6.1-terra');

    await expect(provider.generate(request)).rejects.toThrow('incomplete');
  });
});
