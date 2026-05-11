import { cleanEnv, url } from 'envalid'

const env = cleanEnv(process.env, {
  NEXT_PUBLIC_APP_URL: url({ default: 'http://localhost:3000' })
})

export const clientEnv = {
  appUrl: env.NEXT_PUBLIC_APP_URL
} as const
