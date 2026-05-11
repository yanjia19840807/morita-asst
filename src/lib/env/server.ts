import 'server-only'

import { cleanEnv, port, str, url } from 'envalid'

const env = cleanEnv(process.env, {
  DATABASE_URL: url(),
  ALI_TONGYI_EMBEDDINGS_API_KEY: str(),
  DB_USER: str({ default: '' }),
  DB_PWD: str({ default: '' }),
  DB_HOST: str({ default: 'localhost' }),
  DB_PORT: port({ default: 5432 }),
  DB_DATABASE: str({ default: '' }),
  APP_NAME: str({ default: 'app' }),
  ALI_ACCESS_KEY_ID: str(),
  ALI_ACCESS_KEY_SECRET: str(),
  ALI_ROLE_ARN: str(),
  ALI_OSS_REGION: str(),
  ALI_PRIVATE_BUCKET: str(),
  ALI_PUBLIC_BUCKET: str(),
  ALI_SMTP_HOST: str({ default: 'smtpdm.aliyun.com' }),
  ALI_SMTP_PORT: port({ default: 25 }),
  ALI_SMTP_USER: str(),
  ALI_SMTP_PASS: str(),
  ALI_SMTP_NICKNAME: str({ default: 'noreply' })
})

export const serverEnv = {
  databaseUrl: env.DATABASE_URL,
  tongyiEmbeddingsApiKey: env.ALI_TONGYI_EMBEDDINGS_API_KEY,
  dbUser: env.DB_USER || undefined,
  dbPassword: env.DB_PWD || undefined,
  dbHost: env.DB_HOST,
  dbPort: env.DB_PORT,
  dbName: env.DB_DATABASE || undefined,
  appName: env.APP_NAME,
  aliAccessKeyId: env.ALI_ACCESS_KEY_ID,
  aliAccessKeySecret: env.ALI_ACCESS_KEY_SECRET,
  aliRoleArn: env.ALI_ROLE_ARN,
  aliOssRegion: env.ALI_OSS_REGION,
  aliPrivateBucket: env.ALI_PRIVATE_BUCKET,
  aliPublicBucket: env.ALI_PUBLIC_BUCKET,
  aliSmtpHost: env.ALI_SMTP_HOST,
  aliSmtpPort: env.ALI_SMTP_PORT,
  aliSmtpUser: env.ALI_SMTP_USER,
  aliSmtpPass: env.ALI_SMTP_PASS,
  aliSmtpNickname: env.ALI_SMTP_NICKNAME
} as const
