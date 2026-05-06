import z from 'zod'

export const knowledgeIdSchema = z.string().trim().min(1, '知识库ID不能为空')

export const agentIdSchema = z.string().trim().min(1, '助手ID不能为空')

export const userIdSchema = z.string().trim().min(1, '用户ID不能为空')

export const knowledgeDocIdSchema = z.string().trim().min(1, '文档ID不能为空')

export const knowledgeDocCateIdSchema = z
  .string()
  .trim()
  .min(1, '文档类目ID不能为空')

export const knowledgeDocSourceSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal('docCate'),
    categoryId: knowledgeDocCateIdSchema,
    documentIds: z.undefined()
  }),
  z.object({
    mode: z.literal('doc'),
    categoryId: z.undefined(),
    documentIds: z.array(knowledgeDocIdSchema).min(1, '至少需要一个文档ID')
  })
])

export const knowledgeSchema = z.object({
  id: knowledgeIdSchema,
  user: z.object({
    id: userIdSchema,
    name: z.string().trim().min(1, '用户名不能为空')
  }),
  name: z
    .string()
    .trim()
    .min(2, '名称长度不能小于2个字符')
    .max(50, '名称长度不能大于50个字符'),
  description: z
    .string()
    .trim()
    .min(1, '描述不能为空')
    .max(500, '描述长度不能大于500个字符'),
  agent: z
    .array(
      z.object({
        id: agentIdSchema,
        name: z.string().trim().min(1, '助手名称不能为空')
      })
    )
    .default([]),
  docSource: knowledgeDocSourceSchema
})

export const knowledgeCreateSchema = knowledgeSchema.omit({
  id: true,
  user: true,
  agent: true
})

export const knowledgeEditSchema = knowledgeSchema

export const knowledgeViewSchema = knowledgeSchema

export type KnowledgeFormValues = z.infer<typeof knowledgeSchema>

export type KnowledgeCreateFormValues = z.infer<typeof knowledgeCreateSchema>

export type KnowledgeEditFormValues = z.infer<typeof knowledgeEditSchema>

export type KnowledgeViewValues = z.infer<typeof knowledgeViewSchema>

export type KnowledgeValues = z.infer<typeof knowledgeSchema>

export type KnowledgeDocSourceValues = z.infer<typeof knowledgeDocSourceSchema>
