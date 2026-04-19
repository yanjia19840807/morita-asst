import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { i18n } from "@better-auth/i18n";
import { sendEmail } from "./email";
import { resetPasswordTemplate } from "./email-templates";
import { admin } from "better-auth/plugins";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 30,
    sendResetPassword: async ({ user, url }) => {
      sendEmail({
        to: user.email,
        ...resetPasswordTemplate({
          name: user.name,
          url,
        }),
      });
    },
  },
  plugins: [
    i18n({
      defaultLocale: "zh",
      translations: {
        zh: {
          USER_NOT_FOUND: "用户不存在",
          FAILED_TO_CREATE_USER: "创建用户失败",
          FAILED_TO_CREATE_SESSION: "创建会话失败",
          FAILED_TO_UPDATE_USER: "更新用户失败",
          FAILED_TO_GET_SESSION: "获取会话失败",
          INVALID_PASSWORD: "密码不正确",
          INVALID_EMAIL: "邮箱格式不正确",
          INVALID_EMAIL_OR_PASSWORD: "邮箱或密码不正确",
          INVALID_USER: "用户无效",
          SOCIAL_ACCOUNT_ALREADY_LINKED: "该社交账号已被绑定",
          PROVIDER_NOT_FOUND: "未找到该登录方式",
          INVALID_TOKEN: "令牌无效",
          TOKEN_EXPIRED: "令牌已过期",
          ID_TOKEN_NOT_SUPPORTED: "不支持 id_token",
          FAILED_TO_GET_USER_INFO: "获取用户信息失败",
          USER_EMAIL_NOT_FOUND: "未找到用户邮箱",
          EMAIL_NOT_VERIFIED: "邮箱未验证",
          PASSWORD_TOO_SHORT: "密码太短",
          PASSWORD_TOO_LONG: "密码太长",
          USER_ALREADY_EXISTS: "用户已存在",
          USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
            "该邮箱已被注册，请使用其他邮箱",
          EMAIL_CAN_NOT_BE_UPDATED: "邮箱不可修改",
          CREDENTIAL_ACCOUNT_NOT_FOUND: "未找到密码账号",
          SESSION_EXPIRED: "会话已过期，请重新登录",
          FAILED_TO_UNLINK_LAST_ACCOUNT: "无法解绑最后一个账号",
          ACCOUNT_NOT_FOUND: "账号不存在",
        },
      },
    }),
    admin({
      adminUserIds: ["j3Z56FIMoCkkbtynPT25c1wHvCHjucjU"],
    }),
  ],
});
