import { Injectable } from '@nestjs/common';
import { setTimeout as sleep } from 'node:timers/promises';
import { AiProvider, AiRequest } from './ai-provider.js';

/**
 * Espera artificial. El mock respondería al instante y el estado de carga
 * de la interfaz no llegaría a verse; un LLM real tarda segundos.
 */
const SIMULATED_DELAY_MS = 500;

/**
 * Proveedor simulado: funciona sin API key, sin costo y sin red.
 * Es determinista (misma entrada, misma salida) y no finge inteligencia:
 * responde con el nombre del agente, sus instrucciones y la consulta (§3.C).
 * No repite que es simulado: ya lo indican el campo `provider` y la interfaz.
 */
@Injectable()
export class MockAiProvider implements AiProvider {
  readonly name = 'mock';

  async generate(request: AiRequest): Promise<string> {
    await sleep(SIMULATED_DELAY_MS);

    return [
      `Soy «${request.agentName}» y sigo estas instrucciones: «${request.instructions}».`,
      `Tu consulta fue: «${request.query}».`,
    ].join('\n');
  }
}
