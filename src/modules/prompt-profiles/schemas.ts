import z from 'zod'

export const promptProfileIdSchema = z
  .string()
  .trim()
  .min(1, '提示词ID不能为空')

export const promptProfileNameSchema = z
  .string()
  .trim()
  .min(2, '名称长度不能小于2个字符')
  .max(50, '名称长度不能大于50个字符')

export const promptProfileSystemPromptSchema = z
  .string()
  .trim()
  .min(1, '系统提示词不能为空')
  .max(20000, '系统提示词长度不能大于20000个字符')

export const promptProfileSchema = z.object({
  id: promptProfileIdSchema,
  name: promptProfileNameSchema,
  systemPrompt: promptProfileSystemPromptSchema
})

export const promptProfileCreateSchema = promptProfileSchema.omit({ id: true })

export const promptProfileEditSchema = promptProfileSchema

export type PromptProfileValues = z.infer<typeof promptProfileSchema>

export type PromptProfileFormValues = z.infer<typeof promptProfileCreateSchema>

export type PromptProfileCreateFormValues = z.infer<
  typeof promptProfileCreateSchema
>
export type CreatePromptProfileInput = PromptProfileCreateFormValues

export type PromptProfileEditFormValues = z.infer<
  typeof promptProfileEditSchema
>
export type UpdatePromptProfileInput = PromptProfileEditFormValues
