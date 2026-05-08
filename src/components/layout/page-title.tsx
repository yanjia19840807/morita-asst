import React from 'react'

interface PageTitleProps {
  title?: string
  children: React.ReactNode
  actionButtons?: React.ReactNode
}

export default function PageTitle({ children, actionButtons }: PageTitleProps) {
  return (
    <div className='flex w-full items-center justify-between border-b p-2'>
      <div className='text-foreground text-lg font-medium'>{children}</div>
      <div>{actionButtons}</div>
    </div>
  )
}
