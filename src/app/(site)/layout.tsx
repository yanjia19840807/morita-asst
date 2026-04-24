import React from 'react'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'

function SiteLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className='flex flex-1 flex-col px-4'>
      <SiteHeader />
      <main className='flex-1'>{children}</main>
      <SiteFooter />
    </div>
  )
}

export default SiteLayout
