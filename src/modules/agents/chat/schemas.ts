import z from 'zod'

export const chatMessageContentSchema = z
  .string()
  .trim()
  .min(1, '消息不能为空')
  .max(4000, '消息长度不能大于4000个字符')

export const chatConversationIdSchema = z.string().trim().min(1, '试聊ID不能为空')

export const chatSendSchema = z
  .object({
    content: chatMessageContentSchema.optional(),
    conversationId: chatConversationIdSchema.optional(),
    retryOfMessageId: z.string().trim().min(1).optional()
  })
  .superRefine((value, context) => {
    if (!value.retryOfMessageId && !value.content) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: '消息不能为空',
        path: ['content']
      })
    }
  })

export const chatRetrieveStatusSchema = z.enum([
  'skipped',
  'hit',
  'miss',
  'error'
])

export const chatCitationSchema = z.object({
  chunkId: z.string(),
  docId: z.string().nullable().optional(),
  filename: z.string(),
  excerpt: z.string(),
  content: z.string().optional()
})

export const chatRunSchema = z.object({
  recorded: z.boolean(),
  model: z.string(),
  temperature: z.number(),
  historyLimit: z.number(),
  retrieveTopK: z.number(),
  promptProfileId: z.string().nullable(),
  promptName: z.string().nullable(),
  systemPrompt: z.string(),
  knowledgeId: z.string().nullable(),
  knowledgeName: z.string().nullable(),
  retrieve: z.object({
    status: chatRetrieveStatusSchema,
    reason: z.string().nullable(),
    items: z.array(chatCitationSchema)
  })
})

export const chatCitationsPayloadSchema = z.object({
  items: z.array(chatCitationSchema),
  error: z.string().optional()
})

export type ChatSendValues = z.infer<typeof chatSendSchema>
export type ChatCitation = z.infer<typeof chatCitationSchema>
export type ChatRun = z.infer<typeof chatRunSchema>
export type ChatRetrieveStatus = z.infer<typeof chatRetrieveStatusSchema>
export type ChatCitationsPayload = z.infer<typeof chatCitationsPayloadSchema>
