import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { describe, expect, it } from 'vitest';
import { aiProviderErrorFor } from './ai.exceptions.js';

describe('aiProviderErrorFor', () => {
  it('explica una clave inválida (401 o 403) en lugar de pedir reintentar', () => {
    for (const status of [401, 403]) {
      const error = aiProviderErrorFor({ status });
      expect(error.getStatus()).toBe(502);
      expect(error.code).toBe('AI_PROVIDER_AUTH_ERROR');
      expect(error.message).toContain('clave de API');
    }
  });

  it('pide esperar si hay demasiadas consultas (429)', () => {
    expect(aiProviderErrorFor({ status: 429 }).code).toBe(
      'AI_PROVIDER_RATE_LIMIT',
    );
  });

  it('identifica los timeouts de ambos SDK y el plazo total', () => {
    for (const cause of [
      new OpenAI.APIConnectionTimeoutError(),
      new Anthropic.APIConnectionTimeoutError(),
      new DOMException('Timeout', 'TimeoutError'),
    ]) {
      const error = aiProviderErrorFor(cause);
      expect(error.getStatus()).toBe(502);
      expect(error.code).toBe('AI_PROVIDER_TIMEOUT');
      expect(error.message).toContain('tardó demasiado');
    }
  });

  it('usa el error genérico para cualquier otro fallo', () => {
    expect(aiProviderErrorFor(new Error('sin conexión')).code).toBe(
      'AI_PROVIDER_ERROR',
    );
  });
});
