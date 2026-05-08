import z from 'zod'

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

export const agentModelSchema = z
  .string()
  .trim()
  .max(100, '模型名称长度不能大于100个字符')
  .optional()

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

export const agentSchema = z.object({
  id: agentIdSchema,
  name: agentNameSchema,
  description: agentDescriptionSchema,
  status: agentStatusSchema,
  model: agentModelSchema,
  promptProfileId: agentPromptProfileIdSchema,
  knowledgeId: agentKnowledgeIdSchema
})

export const agentCreateSchema = agentSchema.omit({ id: true })

export type AgentCreateFormValues = z.infer<typeof agentCreateSchema>
