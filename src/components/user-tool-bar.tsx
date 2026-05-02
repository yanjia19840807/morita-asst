'use client'

import { useAuthenticatedUser } from '@/lib/auth-client'
import Link from 'next/link'
import { buttonVariants } from './ui/button'

export default function UserToolbar() {
  const user = useAuthenticatedUser()
  if (!!user) {
    return null
  }

  return (
    <>
      <Link className={buttonVariants()} href='/sign-up/email'>
        注册
      </Link>
      <Link
        className={buttonVariants({ variant: 'outline' })}
        href='/sign-in/email'
      >
        登录
      </Link>
    </>
  )
}
