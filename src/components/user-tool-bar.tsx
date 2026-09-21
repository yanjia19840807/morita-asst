'use client'

import { useAuthenticatedUser } from '@/modules/auth/client'
import { DEFAULT_AUTH_REDIRECT } from '@/modules/auth/redirect'
import { useMounted } from '@/hooks/use-mounted'
import Link from 'next/link'
import { buttonVariants } from './ui/button'

export default function UserToolbar() {
  const mounted = useMounted()
  const user = useAuthenticatedUser()

  if (!mounted) {
    return <div className='h-9 w-14' />
  }

  if (user) {
    return (
      <Link className={buttonVariants()} href={DEFAULT_AUTH_REDIRECT}>
        进入工作台
      </Link>
    )
  }

  return (
    <Link
      className={buttonVariants({ variant: 'outline' })}
      href='/sign-in/email'
    >
      登录
    </Link>
  )
}
