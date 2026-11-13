import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { aiProviderErrorFor } from './ai.exceptions.js';
import { AI_CLIENT_OPTIONS } from './ai.request.js';
import { AnthropicAiProvider } from './providers/anthropic-ai.provider.js';
import { OpenAiProvider } from './providers/openai-ai.provider.js';

const input = {
  agentName: 'Prueba',
  instructions: 'Responde',
  history: [],
  query: 'Hola',
};

describe('Plazo total con los SDK reales y transporte simulado', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(['openai', 'anthropic'])(
    'cancela un Retry-After largo en %s',
    async (name) => {
      // Solo acortamos el reloj: la cancelación y los reintentos son del SDK real.
      const timeout = AbortSignal.timeout.bind(AbortSignal);
      const deadline = vi
        .spyOn(AbortSignal, 'timeout')
        .mockImplementation(() => timeout(50));
      const fetch = vi
        .fn()
        .mockImplementation(() =>
          Promise.resolve(
            new Response(
              JSON.stringify({
                error: { message: 'Saturado', type: 'rate_limit_error' },
              }),
              {
                status: 429,
                headers: {
                  'content-type': 'application/json',
                  'retry-after': '600',
                },
              },
            ),
          ),
        );
      const options = { apiKey: 'clave-ficticia', ...AI_CLIENT_OPTIONS, fetch };
      const provider =
        name === 'openai'
          ? new OpenAiProvider(new OpenAI(options), 'modelo-de-prueba')
          : new AnthropicAiProvider(new Anthropic(options), 'modelo-de-prueba');
      const result = provider.generate(input).catch(aiProviderErrorFor);
      await expect(result).resolves.toMatchObject({
        code: 'AI_PROVIDER_TIMEOUT',
      });
      expect(deadline).toHaveBeenCalledWith(100_000);
      expect(fetch).toHaveBeenCalledTimes(1);
    },
  );
});
