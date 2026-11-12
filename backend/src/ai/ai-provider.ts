/** Lo que necesita un proveedor de IA para responder. */
export interface AiRequest {
  agentName: string;
  /** Instrucciones del agente: en un LLM real serían el mensaje de sistema. */
  instructions: string;
  /** Consulta del usuario: en un LLM real sería el mensaje del usuario. */
  query: string;
}

/**
 * Contrato que cumple cualquier proveedor de IA (simulado o real).
 * El resto del backend depende solo de esta interfaz, nunca de una
 * implementación concreta.
 */
export interface AiProvider {
  /** Nombre que se devuelve en la respuesta, por ejemplo "mock". */
  readonly name: string;
  generate(request: AiRequest): Promise<string>;
}

/**
 * Token de inyección. Las interfaces de TypeScript no existen en tiempo de
 * ejecución, así que Nest necesita un identificador para inyectar el proveedor.
 */
export const AI_PROVIDER = Symbol('AI_PROVIDER');
