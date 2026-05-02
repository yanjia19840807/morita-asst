import { createAuthClient } from 'better-auth/react'
import { i18nClient } from '@better-auth/i18n/client'
import { adminClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  plugins: [i18nClient(), adminClient()]
})

export const useAuthenticatedUser = () => {
  const { data: userData } = authClient.useSession()
  return userData
}
