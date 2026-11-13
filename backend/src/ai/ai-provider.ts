/** Un mensaje anterior de la conversación. */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** Lo que necesita un proveedor de IA para responder. */
export interface AiRequest {
  agentName: string;
  /** Instrucciones del agente: en un LLM real serían el mensaje de sistema. */
  instructions: string;
  /** Consulta del usuario: en un LLM real sería el mensaje del usuario. */
  query: string;
  /**
   * Mensajes anteriores, del más antiguo al más reciente (vacío en la primera
   * consulta). El backend no guarda conversaciones: el frontend envía el
   * historial completo en cada petición.
   */
  history: ChatMessage[];
}

/**
 * Contrato que cumple cualquier proveedor de IA (simulado o real).
 * El resto del backend depende solo de esta interfaz, nunca de una
 * implementación concreta.
 */
export interface AiProvider {
  /** Nombre que se devuelve en la respuesta, por ejemplo "mock". */
  readonly name: string;
  /** Modelo que responde, por ejemplo "claude-haiku-5-5"; `null` en el simulado. */
  readonly model: string | null;
  generate(request: AiRequest): Promise<string>;
}

/**
 * Token de inyección. Las interfaces de TypeScript no existen en tiempo de
 * ejecución, así que Nest necesita un identificador para inyectar el proveedor.
 */
export const AI_PROVIDER = Symbol('AI_PROVIDER');
