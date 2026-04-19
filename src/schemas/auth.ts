import z from "zod";

export const SignUpFormSchema = z
  .object({
    name: z
      .string()
      .min(3, "长度不能小于3个字符")
      .max(30, "长度不能大于30个字符")
      .trim(),
    email: z.email("邮箱地址不正确").trim(),
    password: z
      .string()
      .min(8, "长度不能小于8个字符")
      .max(30, "长度不能大于30个字符")
      .trim(),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次密码输入不一致",
    path: ["confirmPassword"],
  });

export const SignInFormSchema = z.object({
  email: z.email("邮箱地址不正确").trim(),
  password: z
    .string()
    .min(8, "长度不能小于8个字符")
    .max(30, "长度不能大于30个字符")
    .trim(),
});

export const ForgotPasswordFormSchema = z.object({
  email: z.email("邮箱格式不正确").trim(),
});

export const ResetPasswordFormSchema = z
  .object({
    password: z
      .string()
      .min(8, "长度不能小于8个字符")
      .max(30, "长度不能大于30个字符")
      .trim(),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "两次密码输入不一致",
    path: ["confirmPassword"],
  });

export const ProfileEditSchema = z.object({
  name: z
    .string()
    .min(3, "长度不能小于3个字符")
    .max(30, "长度不能大于30个字符")
    .trim(),
  image: z.union([
    z
      .instanceof(File)
      .refine((file) => file.size <= 5000000, {
        message: "大小不能超过5MB",
      })
      .refine(
        (file) =>
          ["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
            file.type,
          ),
        {
          message: "仅支持 JPG、PNG、WebP、GIF 格式",
        },
      ),
    z.string().optional().nullable(),
  ]),
});
