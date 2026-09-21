import z from 'zod'

export const chatMessageContentSchema = z
  .string()
  .trim()
  .min(1, '消息不能为空')
  .max(4000, '消息长度不能大于4000个字符')

export const chatSendSchema = z.object({
  content: chatMessageContentSchema
})

export const chatCitationSchema = z.object({
  chunkId: z.string(),
  docId: z.string().optional(),
  filename: z.string(),
  excerpt: z.string()
})

export const chatCitationsPayloadSchema = z.object({
  items: z.array(chatCitationSchema),
  error: z.string().optional()
})

export type ChatSendValues = z.infer<typeof chatSendSchema>
export type ChatCitation = z.infer<typeof chatCitationSchema>
export type ChatCitationsPayload = z.infer<typeof chatCitationsPayloadSchema>
