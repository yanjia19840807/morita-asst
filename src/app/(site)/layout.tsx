import React from 'react'
import SiteHeader from '@/components/layout/site-header'
import SiteFooter from '@/components/layout/site-footer'

function SiteLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className='flex flex-1 flex-col px-4 md:px-6'>
      <SiteHeader />
      <main className='flex flex-1 flex-col'>{children}</main>
      <SiteFooter />
    </div>
  )
}

export default SiteLayout
