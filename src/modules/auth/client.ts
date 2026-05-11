import { createAuthClient } from 'better-auth/react'
import { i18nClient } from '@better-auth/i18n/client'
import { adminClient } from 'better-auth/client/plugins'
import { clientEnv } from '@/lib/env/client'

export const authClient = createAuthClient({
  baseURL: clientEnv.appUrl,
  plugins: [i18nClient(), adminClient()]
})

export const useAuthenticatedUser = () => {
  const { data: userData } = authClient.useSession()
  return userData
}
