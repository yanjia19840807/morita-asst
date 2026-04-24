import React from 'react'
import { cn } from '@/lib/utils'

interface TableFooterSectionProps extends React.PropsWithChildren {
  className?: string
}

export default function TableFooterSection({
  children,
  className
}: TableFooterSectionProps) {
  return (
    <div className={cn('my-4 flex items-center gap-2', className)}>
      {children}
    </div>
  )
}
