'use client'

import { authClient } from '@/lib/auth-client'
import Link from 'next/link'
import React from 'react'
import { buttonVariants } from './ui/button'

export default function AuthBar() {
  const { data: userData } = authClient.useSession()

  if (!userData) {
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
