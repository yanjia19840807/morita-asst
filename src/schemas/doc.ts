import z from 'zod'

export const DOC_MAX_SIZE = 100 // 100MB
export const DOC_MAX_FILES = 10
export const DOC_ACCEPT_MINE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-word.document.macroEnabled.12',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
  'application/vnd.ms-word.template.macroEnabled.12',
  'text/plain'
]
export const DOC_ACCEPT_TYPES = ['PDF', 'DOC', 'TXT']

export const docCreateSchema = z.object({
  categoryId: z.uuid('类目不能为空'),
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

export const docCreateActionSchema = z.object({
  categoryId: z.uuid('类目不能为空'),
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

export type DocCreateFormValues = z.infer<typeof docCreateSchema>
export type DocCreateActionValues = z.infer<typeof docCreateActionSchema>

export const docCateSchema = z.object({
  id: z.string().min(1, '类目ID不能为空'),
  name: z.string().min(1, '类目名称不能为空')
})

export const docCateCreateSchema = docCateSchema.omit({ id: true })

export const docCateEditSchema = docCateSchema.extend({})

export type DocCateCreateFormValues = z.infer<typeof docCateCreateSchema>

export type DocCateEditFormValues = z.infer<typeof docCateEditSchema>

export type DocCateFormValues = z.infer<typeof docCateSchema>
