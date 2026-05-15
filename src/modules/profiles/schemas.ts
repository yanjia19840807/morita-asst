import z from 'zod'

export const userIssueSchema = z.object({
  id: z.string().trim().min(1).optional(),
  priority: z.number().int().positive('优先级必须大于 0'),
  tags: z.array(z.string().trim().min(1)).default([]),
  description: z.string().trim().min(1, '问题描述不能为空').max(1000)
})

export const userProfileSchema = z.object({
  id: z.string().trim().min(1).nullable().optional(),
  userId: z.string().trim().min(1, '用户 ID 不能为空'),
  gender: z.string().trim().max(50).nullable().optional(),
  ageRange: z.string().trim().max(50).nullable().optional(),
  occupation: z.string().trim().max(100).nullable().optional(),
  issues: z.array(userIssueSchema).default([])
})

export const userProfileEditSchema = userProfileSchema.superRefine(
  (value, context) => {
    const prioritySet = new Set<number>()

    value.issues.forEach((issue, index) => {
      if (prioritySet.has(issue.priority)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: '问题优先级不能重复',
          path: ['issues', index, 'priority']
        })
      }

      prioritySet.add(issue.priority)
    })
  }
)

export type UserIssueValues = z.infer<typeof userIssueSchema>
export type UserProfileValues = z.infer<typeof userProfileSchema>
export type UserProfileEditValues = z.infer<typeof userProfileEditSchema>
