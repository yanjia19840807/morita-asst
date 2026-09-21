import 'server-only'

import { ChatDeepSeek, type ChatDeepSeekInput } from '@langchain/deepseek'
import { serverEnv } from '@/lib/env/server'
import { resolveChatModel } from './chat-models'

export {
  CHAT_MODEL_OPTIONS,
  CHAT_MODEL_VALUES,
  DEFAULT_CHAT_MODEL,
  resolveChatModel,
  type ChatModelValue
} from './chat-models'

export function createChatModel(
  model?: string | null,
  fields?: Omit<ChatDeepSeekInput, 'model' | 'apiKey'>
) {
  return new ChatDeepSeek({
    temperature: 0,
    ...fields,
    model: resolveChatModel(model),
    apiKey: serverEnv.deepseekApiKey
  })
}

export const llm = createChatModel()
