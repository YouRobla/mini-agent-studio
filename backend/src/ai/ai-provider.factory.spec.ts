import { describe, expect, it } from 'vitest';
import {
  createAiProvider,
  DEFAULT_ANTHROPIC_MODEL,
  DEFAULT_OPENAI_MODEL,
} from './ai-provider.factory.js';
import { AnthropicAiProvider } from './providers/anthropic-ai.provider.js';
import { MockAiProvider } from './providers/mock-ai.provider.js';
import { OpenAiProvider } from './providers/openai-ai.provider.js';

describe('createAiProvider', () => {
  it('usa el simulado si AI_PROVIDER no está definido', () => {
    const provider = createAiProvider({});
    expect(provider).toBeInstanceOf(MockAiProvider);
    expect(provider.model).toBeNull();
  });

  it('usa Claude con Haiku por defecto, o el modelo de AI_MODEL', () => {
    const porDefecto = createAiProvider({
      AI_PROVIDER: 'anthropic',
      ANTHROPIC_API_KEY: 'clave-de-prueba',
    });
    expect(porDefecto).toBeInstanceOf(AnthropicAiProvider);
    expect(porDefecto.model).toBe(DEFAULT_ANTHROPIC_MODEL);

    const otro = createAiProvider({
      AI_PROVIDER: 'anthropic',
      ANTHROPIC_API_KEY: 'clave-de-prueba',
      AI_MODEL: 'claude-sonnet-5-5',
    });
    expect(otro.model).toBe('claude-sonnet-5-5');
  });

  it('usa OpenAI con su modelo por defecto, o el de AI_MODEL', () => {
    const porDefecto = createAiProvider({
      AI_PROVIDER: 'openai',
      OPENAI_API_KEY: 'clave-de-prueba',
    });
    expect(porDefecto).toBeInstanceOf(OpenAiProvider);
    expect(porDefecto.model).toBe(DEFAULT_OPENAI_MODEL);

    expect(() => createAiProvider({ AI_PROVIDER: 'openai' })).toThrow(
      'AI_PROVIDER=openai necesita la variable OPENAI_API_KEY',
    );
  });

  it('no arranca con Claude sin clave y explica qué falta', () => {
    expect(() => createAiProvider({ AI_PROVIDER: 'anthropic' })).toThrow(
      'AI_PROVIDER=anthropic necesita la variable ANTHROPIC_API_KEY',
    );
  });

  it('rechaza un proveedor desconocido', () => {
    expect(() => createAiProvider({ AI_PROVIDER: 'otro' })).toThrow(
      'AI_PROVIDER="otro" no es válido',
    );
  });
});
