export type PromptProfileOptionDto = {
  id: string
  name: string
  description: string | null
}

export type PromptProfileRowDto = {
  id: string
  userId: string
  name: string
  systemPrompt: string
  createdAt: Date
  updatedAt: Date
  refAgentCount: number
}

export type FetchPromptProfilesResultDto = {
  promptProfiles: PromptProfileRowDto[]
  total: number
}
