export type AgentStatusDto = 'DRAFT' | 'ACTIVE' | 'DISABLED'

export type AgentRelationOptionDto = {
  id: string
  name: string
}

export type AgentRowDto = {
  id: string
  name: string
  description: string | null
  status: AgentStatusDto
  model: string | null
  promptProfile: AgentRelationOptionDto | null
  knowledge: AgentRelationOptionDto | null
}

export type AgentsWithTotalDto = {
  agents: AgentRowDto[]
  total: number
}
