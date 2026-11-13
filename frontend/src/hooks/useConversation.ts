import { useState } from "react";
import type { ChatMessage } from "../types/agent.ts";

/** Mensaje del chat: el de la API más, en las respuestas, el proveedor que respondió. */
export interface ConversationMessage extends ChatMessage {
  provider?: string;
}

/** Mensajes anteriores que acepta el backend en cada consulta. */
const HISTORY_LIMIT = 20;

/*
 * Conversaciones por agente, en memoria: se conservan al cambiar de vista o de
 * agente y se pierden al recargar la página. El backend no guarda ninguna.
 */
const conversations = new Map<string, ConversationMessage[]>();

/**
 * Conversación con un agente. `history` es lo que se envía al backend: solo
 * rol y texto, y como mucho los últimos 20 mensajes (siempre pares consulta y
 * respuesta, así empieza por una consulta como exige la API).
 */
export function useConversation(agentId: string) {
  const [messages, setMessages] = useState<ConversationMessage[]>(
    () => conversations.get(agentId) ?? [],
  );

  function save(next: ConversationMessage[]) {
    conversations.set(agentId, next);
    setMessages(next);
  }

  return {
    messages,
    history: messages
      .slice(-HISTORY_LIMIT)
      .map(({ role, content }): ChatMessage => ({ role, content })),
    addExchange: (query: string, response: string, provider: string) =>
      save([
        ...messages,
        { role: "user", content: query },
        { role: "assistant", content: response, provider },
      ]),
    clear: () => save([]),
  };
}
