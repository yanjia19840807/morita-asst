import z from 'zod'

function emptyStringToUndefined(value: unknown) {
  if (typeof value !== 'string') {
    return value
  }

  const trimmedValue = value.trim()
  return trimmedValue === '' ? undefined : trimmedValue
}

export const EmailSignUpSchema = z
  .object({
    name: z
      .string()
      .min(3, '长度不能小于3个字符')
      .max(30, '长度不能大于30个字符')
      .trim(),
    email: z.email('邮箱地址不正确').trim(),
    password: z
      .string()
      .min(8, '长度不能小于8个字符')
      .max(30, '长度不能大于30个字符')
      .trim(),
    confirmPassword: z.string()
  })
  .refine(data => data.password === data.confirmPassword, {
    message: '两次密码输入不一致',
    path: ['confirmPassword']
  })

export const EmailSignInSchema = z.object({
  email: z.email('邮箱地址不正确').trim(),
  password: z
    .string()
    .min(8, '长度不能小于8个字符')
    .max(30, '长度不能大于30个字符')
    .trim()
})

export const ForgotPasswordSchema = z.object({
  email: z.email('邮箱格式不正确').trim()
})

export const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, '长度不能小于8个字符')
      .max(30, '长度不能大于30个字符')
      .trim(),
    confirmPassword: z.string()
  })
  .refine(data => data.password === data.confirmPassword, {
    message: '两次密码输入不一致',
    path: ['confirmPassword']
  })

export const ProfileEditSchema = z.object({
  name: z
    .string()
    .min(3, '长度不能小于3个字符')
    .max(30, '长度不能大于30个字符')
    .trim(),
  image: z.union([
    z
      .instanceof(File)
      .refine(file => file.size <= 5000000, {
        message: '大小不能超过5MB'
      })
      .refine(
        file =>
          ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(
            file.type
          ),
        {
          message: '仅支持 JPG、PNG、WebP、GIF 格式'
        }
      ),
    z.string().optional().nullable()
  ])
})

export const UserIdSchema = z.object({
  userId: z.string().trim().min(1, '用户 ID 不能为空')
})

export const UserCreateFormSchema = z.object({
  email: z.email('邮箱格式不正确').trim(),
  name: z
    .string()
    .trim()
    .min(1, '用户名不能为空')
    .max(100, '长度不能大于100个字符'),
  password: z
    .string()
    .trim()
    .min(8, '密码至少 8 位')
    .max(30, '长度不能大于30个字符'),
  role: z
    .string()
    .trim()
    .transform(value => value || undefined),
  image: z.union([
    z
      .instanceof(File)
      .refine(file => file.size <= 5000000, { message: '大小不能超过5MB' })
      .refine(
        file =>
          ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(
            file.type
          ),
        { message: '仅支持 JPG、PNG、WebP、GIF 格式' }
      ),
    z.string().optional().nullable()
  ])
})

export const UserCreateSchema = z.object({
  email: z.email('邮箱格式不正确').trim(),
  name: z
    .string()
    .trim()
    .min(1, '用户名不能为空')
    .max(100, '长度不能大于100个字符'),
  password: z.preprocess(
    emptyStringToUndefined,
    z
      .string()
      .trim()
      .min(8, '密码至少 8 位')
      .max(30, '长度不能大于30个字符')
      .optional()
  ),
  role: z.preprocess(emptyStringToUndefined, z.string().trim().optional()),
  image: z.string().optional().nullable()
})

export const UserToggleBanSchema = UserIdSchema.extend({
  banned: z.boolean(),
  banReason: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().max(255, '长度不能大于255个字符').optional()
  )
})

export const UserUpdateSchema = UserIdSchema.extend({
  name: z
    .string()
    .trim()
    .min(1, '用户名不能为空')
    .max(100, '长度不能大于100个字符')
    .optional(),
  role: z.preprocess(
    emptyStringToUndefined,
    z
      .union([
        z.string().trim().min(1),
        z.array(z.string().trim().min(1)).min(1)
      ])
      .optional()
  ),
  image: z.string().optional().nullable()
}).refine(
  ({ name, role, image }) =>
    name !== undefined || role !== undefined || image !== undefined,
  { message: '至少提供一个可更新字段' }
)

export const UserEditSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, '用户名不能为空')
    .max(100, '长度不能大于100个字符'),
  role: z
    .string()
    .trim()
    .transform(value => value || undefined),
  image: z.union([
    z
      .instanceof(File)
      .refine(file => file.size <= 5000000, { message: '大小不能超过5MB' })
      .refine(
        file =>
          ['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(
            file.type
          ),
        { message: '仅支持 JPG、PNG、WebP、GIF 格式' }
      ),
    z.string().optional().nullable()
  ])
})

export const UserSetPasswordSchema = z.object({
  userId: z.string().trim().min(1, '用户 ID 不能为空'),
  newPassword: z
    .string()
    .trim()
    .min(8, '密码至少 8 位')
    .max(30, '长度不能大于30个字符')
})
