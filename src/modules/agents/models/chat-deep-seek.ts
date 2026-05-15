import { ChatDeepSeek } from '@langchain/deepseek'

export const llm = new ChatDeepSeek({
  model: 'deepseek-reasoner',
  temperature: 0
})
