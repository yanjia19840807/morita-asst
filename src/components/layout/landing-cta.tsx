'use client'

import Link from 'next/link'
import { useAuthenticatedUser } from '@/modules/auth/client'
import { useMounted } from '@/hooks/use-mounted'
import { Button } from '@/components/ui/button'

export function LandingCta() {
  const mounted = useMounted()
  const user = useAuthenticatedUser()

  if (mounted && user) {
    return null
  }

  return (
    <div>
      <Button asChild>
        <Link href='/sign-up/email'>开始使用</Link>
      </Button>
    </div>
  )
}
