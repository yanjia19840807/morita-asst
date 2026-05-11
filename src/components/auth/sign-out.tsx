import React from 'react'
import { Button, buttonVariants } from '../ui/button'
import { authClient } from '@/modules/auth/client'
import { useRouter } from 'next/navigation'

export default function SignOut() {
  const router = useRouter()
  const { data: userData } = authClient.useSession()

  async function handleSignOut() {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.replace('/')
        }
      }
    })
  }

  if (!userData) {
    return null
  }

  return (
    <Button className={buttonVariants()} onClick={handleSignOut}>
      退出
    </Button>
  )
}
