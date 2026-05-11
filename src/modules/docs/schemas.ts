import z from 'zod'
import { paginationSchema } from '@/lib/query'
import {
  DOC_ACCEPT_MINE_TYPES,
  DOC_ACCEPT_TYPES,
  DOC_MAX_SIZE,
  DOC_MAX_FILES
} from './constants'

export { DOC_ACCEPT_MINE_TYPES, DOC_ACCEPT_TYPES, DOC_MAX_FILES, DOC_MAX_SIZE }

const docIdSchema = z.string().min(1, '文档ID不能为空')

const docCategoryIdSchema = z.string().min(1, '类目ID不能为空')

export const docCreateFormSchema = z.object({
  categoryId: docCategoryIdSchema,
  files: z
    .array(
      z
        .instanceof(File)
        .refine(
          file => file.size <= DOC_MAX_SIZE * 1024 * 1024,
          `文件大小不能超过${DOC_MAX_SIZE}M`
        )
        .refine(
          file => DOC_ACCEPT_MINE_TYPES.includes(file.type),
          `只支持 ${DOC_ACCEPT_TYPES.join(',')} 文档`
        )
    )
    .min(1, '请至少上传一个文件')
})

export const fetchDocsParamsSchema = paginationSchema.extend({
  searchField: z.enum(['filename']).optional(),
  categoryId: z.string().trim().optional(),
  sortBy: z.enum(['filename', 'fileSize', 'mimeType', 'createdAt']).optional(),
  sortDirection: z.enum(['asc', 'desc']).optional()
})

export const deleteDocsParamsSchema = z
  .array(docIdSchema)
  .min(1, '请至少选择一个文档')

export const docCreateSchema = z.object({
  categoryId: docCategoryIdSchema,
  files: z
    .array(
      z.object({
        filename: z.string().min(1, '文件名不能为空'),
        fileSize: z.number().int().positive('文件大小无效'),
        mimeType: z.string().min(1, 'MIME类型不能为空'),
        storageKey: z.string().min(1, '存储Key不能为空')
      })
    )
    .min(1, '至少需要一个文件')
})

export const docCateSchema = z.object({
  id: z.string().min(1, '类目ID不能为空'),
  name: z.string().min(1, '类目名称不能为空')
})

export const docCateCreateFormSchema = docCateSchema.omit({ id: true })

export const docCateEditFormSchema = docCateSchema.extend({})

export const docCateReorderSchema = z.object({
  sourceId: docCategoryIdSchema.refine(() => true, {
    message: '源类目不能为空'
  }),
  targetId: docCategoryIdSchema.refine(() => true, {
    message: '目标类目不能为空'
  })
})

export type DocCreateValues = z.infer<typeof docCreateSchema>
export type CreateDocInput = DocCreateValues

export type FetchDocsParams = z.infer<typeof fetchDocsParamsSchema>
export type FetchDocsQuery = FetchDocsParams

export type DocCateReorderValues = z.infer<typeof docCateReorderSchema>
export type ReorderDocCateInput = DocCateReorderValues

export type DocCreateFormValues = z.infer<typeof docCreateFormSchema>

export type DocCateCreateFormValues = z.infer<typeof docCateCreateFormSchema>
export type CreateDocCateInput = DocCateCreateFormValues

export type DocCateEditFormValues = z.infer<typeof docCateEditFormSchema>
export type UpdateDocCateInput = DocCateEditFormValues

export type DocCateFormValues = z.infer<typeof docCateSchema>
