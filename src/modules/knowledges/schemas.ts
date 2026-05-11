import z from 'zod'
import { paginationSchema } from '@/lib/query'

export const knowledgeIdSchema = z.string().trim().min(1, '知识库ID不能为空')

export const agentIdSchema = z.string().trim().min(1, '助手ID不能为空')

export const userIdSchema = z.string().trim().min(1, '用户ID不能为空')

export const knowledgeDocIdSchema = z.string().trim().min(1, '文档ID不能为空')

export const knowledgeDocCateIdSchema = z
  .string()
  .trim()
  .min(1, '文档类目ID不能为空')

export const KNOWLEDGE_SOURCE_MODE = {
  DOC_CATE: 'DOC_CATE',
  DOC: 'DOC'
} as const

export const knowledgeSourceModeSchema = z.enum([
  KNOWLEDGE_SOURCE_MODE.DOC_CATE,
  KNOWLEDGE_SOURCE_MODE.DOC
])

export const knowledgeDocSourceSchema = z.discriminatedUnion('mode', [
  z.object({
    mode: z.literal(KNOWLEDGE_SOURCE_MODE.DOC_CATE),
    categoryId: knowledgeDocCateIdSchema,
    docIds: z.undefined()
  }),
  z.object({
    mode: z.literal(KNOWLEDGE_SOURCE_MODE.DOC),
    categoryId: z.undefined(),
    docIds: z.array(knowledgeDocIdSchema).min(1, '至少需要一个文档ID')
  })
])

export const knowledgeSourceSchema = z.discriminatedUnion('sourceMode', [
  z.object({
    sourceMode: z.literal(KNOWLEDGE_SOURCE_MODE.DOC_CATE),
    categoryId: knowledgeDocCateIdSchema
  }),
  z.object({
    sourceMode: z.literal(KNOWLEDGE_SOURCE_MODE.DOC),
    categoryId: z.null().optional()
  })
])

const knowledgeBaseSchema = z.object({
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
    .default([])
})

export const knowledgeSchema = knowledgeBaseSchema
  .extend({
    id: knowledgeIdSchema,
    user: z.object({
      id: userIdSchema,
      name: z.string().trim().min(1, '用户名不能为空')
    })
  })
  .and(knowledgeSourceSchema)

export const knowledgeCreateSchema = z.object({
  name: knowledgeBaseSchema.shape.name,
  description: knowledgeBaseSchema.shape.description,
  docSource: knowledgeDocSourceSchema
})

export const fetchKnowledgeDocsParamsSchema = paginationSchema.extend({
  knowledgeId: knowledgeIdSchema
})

export const knowledgeEditSchema = knowledgeSchema

export const knowledgeViewSchema = knowledgeSchema

export type KnowledgeFormValues = z.infer<typeof knowledgeSchema>

export type KnowledgeCreateFormValues = z.infer<typeof knowledgeCreateSchema>
export type CreateKnowledgeInput = KnowledgeCreateFormValues

export type KnowledgeEditFormValues = z.infer<typeof knowledgeEditSchema>

export type KnowledgeViewValues = z.infer<typeof knowledgeViewSchema>

export type KnowledgeValues = z.infer<typeof knowledgeSchema>

export type KnowledgeDocSourceValues = z.infer<typeof knowledgeDocSourceSchema>

export type KnowledgeSourceValues = z.infer<typeof knowledgeSourceSchema>

export type KnowledgeSourceModeValues = z.infer<
  typeof knowledgeSourceModeSchema
>

export type FetchKnowledgeDocsParams = z.infer<
  typeof fetchKnowledgeDocsParamsSchema
>
export type FetchKnowledgeDocsQuery = FetchKnowledgeDocsParams
