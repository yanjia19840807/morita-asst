import z from 'zod'
import { CHAT_MODEL_VALUES } from './models/chat-models'

export const agentIdSchema = z.string().trim().min(1, '助手ID不能为空')

export const agentNameSchema = z
  .string()
  .trim()
  .min(2, '名称长度不能小于2个字符')
  .max(50, '名称长度不能大于50个字符')

export const agentDescriptionSchema = z
  .string()
  .trim()
  .max(500, '描述长度不能大于500个字符')
  .optional()

export const agentStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'DISABLED'], {
  message: '状态不合法'
})

export const agentModelSchema = z.preprocess(
  value => (typeof value === 'string' && value.trim() === '' ? undefined : value),
  z.enum(CHAT_MODEL_VALUES, { message: '模型不合法' }).optional()
)

export const agentPromptProfileIdSchema = z
  .string()
  .trim()
  .min(1, '提示词ID不能为空')
  .optional()

export const agentKnowledgeIdSchema = z
  .string()
  .trim()
  .min(1, '知识库ID不能为空')
  .optional()

export const DEFAULT_AGENT_TEMPERATURE = 0
export const DEFAULT_AGENT_HISTORY_LIMIT = 20
export const DEFAULT_AGENT_RETRIEVE_TOP_K = 4

export const agentTemperatureSchema = z
  .number({ message: '温度必须是数字' })
  .min(0, '温度不能小于 0')
  .max(2, '温度不能大于 2')

export const agentHistoryLimitSchema = z
  .number({ message: '历史条数必须是数字' })
  .int('历史条数必须是整数')
  .min(1, '历史条数不能小于 1')
  .max(50, '历史条数不能大于 50')

export const agentRetrieveTopKSchema = z
  .number({ message: '检索条数必须是数字' })
  .int('检索条数必须是整数')
  .min(1, '检索条数不能小于 1')
  .max(20, '检索条数不能大于 20')

export const agentSchema = z.object({
  id: agentIdSchema,
  name: agentNameSchema,
  description: agentDescriptionSchema,
  status: agentStatusSchema,
  model: agentModelSchema,
  temperature: agentTemperatureSchema,
  historyLimit: agentHistoryLimitSchema,
  retrieveTopK: agentRetrieveTopKSchema,
  promptProfileId: agentPromptProfileIdSchema,
  knowledgeId: agentKnowledgeIdSchema
})

export const agentCreateSchema = agentSchema.omit({ id: true })

export const agentEditSchema = agentSchema

export type AgentValues = z.infer<typeof agentSchema>
export type AgentCreateFormValues = z.infer<typeof agentCreateSchema>
export type CreateAgentInput = AgentCreateFormValues
export type AgentEditFormValues = z.infer<typeof agentEditSchema>
