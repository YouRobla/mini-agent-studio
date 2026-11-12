/** Un agente: un nombre y las instrucciones que definen su comportamiento. */
export interface Agent {
  id: string;
  name: string;
  instructions: string;
  createdAt: string;
}

/** Resultado de ejecutar una consulta sobre un agente. */
export interface RunResult {
  agentId: string;
  response: string;
  provider: string;
}
