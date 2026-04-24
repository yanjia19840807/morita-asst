import React from 'react'
import MainFooter from '@/components/copyright'
import AuthHeader from '@/components/auth-header'

export default function AuthLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className='flex min-h-screen flex-col justify-between px-4'>
      <AuthHeader />
      <main className='flex flex-1 items-center justify-center'>
        {children}
      </main>
      <MainFooter />
    </div>
  )
}
