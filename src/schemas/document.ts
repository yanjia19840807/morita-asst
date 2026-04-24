import z from 'zod'

export const DocumentCreateSchema = z.object({
  categoryId: z.uuid('分类 ID 格式无效'),
  files: z
    .array(
      z
        .instanceof(File)
        .refine(file => file.size <= 100 * 1024 * 1024, '文件大小不能超过100MB')
        .refine(
          file =>
            [
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/vnd.ms-word.document.macroEnabled.12',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
              'application/vnd.ms-word.template.macroEnabled.12',
              'text/plain'
            ].includes(file.type),
          '只支持 PDF、Word 和 TXT 文档'
        )
    )
    .min(1, '请至少上传一个文件')
})
