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

  it('usa el error genérico para cualquier otro fallo', () => {
    expect(aiProviderErrorFor(new Error('sin conexión')).code).toBe(
      'AI_PROVIDER_ERROR',
    );
  });
});
