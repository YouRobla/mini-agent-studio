import type { CreateAgentInput } from '../schemas/agent.schemas.ts'
import { request } from './client.ts'

export interface Agent {
  id: string
  name: string
  instructions: string
  createdAt: string
}

export function listAgents(): Promise<Agent[]> {
  return request<Agent[]>('/agents')
}

export function createAgent(input: CreateAgentInput): Promise<Agent> {
  return request<Agent>('/agents', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}
