import z from 'zod'

export const AVATAR_MAX_SIZE = 5

export const nameSchema = z
  .string()
  .min(3, '长度不能小于3个字符')
  .max(30, '长度不能大于30个字符')
  .trim()

export const emailSchema = z.email('邮箱地址不正确').trim()

export const passwordSchema = z
  .string()
  .min(8, '长度不能小于8个字符')
  .max(30, '长度不能大于30个字符')
  .trim()

export const roleSchema = z.enum(['user', 'admin'], {
  message: '角色必须是 user 或 admin'
})

export const avatarFileSchema = z
  .instanceof(File)
  .refine(file => file.size <= AVATAR_MAX_SIZE * 1024 * 1024, {
    message: `图片大小不能超过${AVATAR_MAX_SIZE}MB`
  })
  .refine(
    file =>
      ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(
        file.type
      ),
    { message: '仅支持 JPG、PNG、WebP、GIF 格式' }
  )

export const avatarStorageKeySchema = z.string().trim().min(1)

export const avatarInputSchema = z.union([
  avatarFileSchema,
  avatarStorageKeySchema.nullable().optional()
])

export const emailSignUpSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string()
  })
  .refine(data => data.password === data.confirmPassword, {
    message: '两次密码输入不一致',
    path: ['confirmPassword']
  })

export const emailSignInSchema = z.object({
  email: emailSchema,
  password: passwordSchema
})

export const forgotPasswordSchema = z.object({
  email: emailSchema
})

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
    token: z.string().trim().min(1, '无效的重置令牌')
  })
  .refine(data => data.password === data.confirmPassword, {
    message: '两次密码输入不一致',
    path: ['confirmPassword']
  })

export const userIdSchema = z.string().trim().min(1, '用户ID不能为空')

export const userSchema = z.object({
  id: userIdSchema,
  email: emailSchema,
  name: nameSchema,
  password: passwordSchema.optional(),
  role: roleSchema,
  image: avatarInputSchema,
  emailVerified: z.boolean().optional(),
  banned: z.boolean().optional(),
  banReason: z.string().trim().max(255).optional(),
  banExpires: z.date().optional()
})

export const userCreateSchema = userSchema
  .omit({ id: true })
  .required({ password: true })

export const userEditSchema = userSchema.extend({})

export const userBanSchema = z.object({
  id: userIdSchema,
  banReason: z.string().trim().max(255, '长度不能大于255个字符').optional()
})

export const profileEditSchema = z.object({
  name: nameSchema,
  image: avatarInputSchema
})

export const profilePasswordSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmPassword: z.string()
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: '两次密码输入不一致',
    path: ['confirmPassword']
  })
  .refine(data => data.currentPassword !== data.newPassword, {
    message: '新密码不能与当前密码相同',
    path: ['newPassword']
  })

export const userBulkActionSchema = z.object({
  userIds: z.array(z.string())
})

export type UserId = z.infer<typeof userIdSchema>

export type UserFormValues = z.infer<typeof userSchema>

export type UserCreateFormValues = z.infer<typeof userCreateSchema>

export type UserEditFormValues = z.infer<typeof userEditSchema>

export type EmailSignUpFormValues = z.infer<typeof emailSignUpSchema>

export type EmailSignInFormValues = z.infer<typeof emailSignInSchema>

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export type UserBanValues = z.infer<typeof userBanSchema>

export type UserBulkActionFormValues = z.infer<typeof userBulkActionSchema>

export type ProfileEditFormValues = z.infer<typeof profileEditSchema>

export type ProfilePasswordFormValues = z.infer<typeof profilePasswordSchema>
