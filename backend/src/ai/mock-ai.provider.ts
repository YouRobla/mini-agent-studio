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
 * muestra el mensaje que se enviaría a un modelo real, construido con las
 * instrucciones del agente y la consulta del usuario.
 */
@Injectable()
export class MockAiProvider implements AiProvider {
  readonly name = 'mock';

  async generate(request: AiRequest): Promise<string> {
    await sleep(SIMULATED_DELAY_MS);

    return [
      `[Modo simulado] Soy "${request.agentName}".`,
      '',
      'Esto es lo que se enviaría al modelo de IA:',
      `• Instrucciones (mensaje de sistema): "${request.instructions}"`,
      `• Consulta (mensaje del usuario): "${request.query}"`,
      '',
      'Con un proveedor real, aquí verías la respuesta generada siguiendo esas instrucciones.',
    ].join('\n');
  }
}
