import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import type { AiProvider } from './ai-provider.js';
import { AnthropicAiProvider } from './providers/anthropic-ai.provider.js';
import { MockAiProvider } from './providers/mock-ai.provider.js';
import { OpenAiProvider } from './providers/openai-ai.provider.js';
import { AI_CLIENT_OPTIONS } from './ai.request.js';

/** Modelo de Claude si no se indica otro en AI_MODEL: el más barato. */
export const DEFAULT_ANTHROPIC_MODEL = 'claude-haiku-5-5';

/** Modelo de OpenAI si no se indica otro en AI_MODEL: el rápido y ligero, como Haiku en Claude. */
export const DEFAULT_OPENAI_MODEL = 'gpt-6.1-terra';

/** Lee una variable obligatoria o explica qué falta, para que el servidor no arranque a medias. */
function requireEnv(
  env: NodeJS.ProcessEnv,
  name: string,
  provider: string,
): string {
  const value = env[name]?.trim();
  if (!value) {
    throw new Error(
      `AI_PROVIDER=${provider} necesita la variable ${name} en backend/.env`,
    );
  }
  return value;
}

/**
 * Fábrica del proveedor de IA. Elige la implementación una sola vez, al arrancar,
 * según `AI_PROVIDER` (por defecto `mock`). El resto del backend solo conoce la
 * interfaz `AiProvider`: cambiar de proveedor es cambiar el .env, no el código.
 */
export function createAiProvider(
  env: NodeJS.ProcessEnv = process.env,
): AiProvider {
  const provider = env.AI_PROVIDER?.trim() || 'mock';
  const model = env.AI_MODEL?.trim();

  switch (provider) {
    case 'mock':
      return new MockAiProvider();
    case 'anthropic': {
      const apiKey = requireEnv(env, 'ANTHROPIC_API_KEY', provider);
      return new AnthropicAiProvider(
        new Anthropic({ apiKey, ...AI_CLIENT_OPTIONS }),
        model || DEFAULT_ANTHROPIC_MODEL,
      );
    }
    case 'openai': {
      const apiKey = requireEnv(env, 'OPENAI_API_KEY', provider);
      return new OpenAiProvider(
        new OpenAI({ apiKey, ...AI_CLIENT_OPTIONS }),
        model || DEFAULT_OPENAI_MODEL,
      );
    }
    default:
      throw new Error(
        `AI_PROVIDER="${provider}" no es válido. Valores posibles: mock, anthropic, openai`,
      );
  }
}
