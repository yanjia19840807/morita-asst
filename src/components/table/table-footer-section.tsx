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
    <div className={cn('w-full py-4', className)}>
      {children}
    </div>
  )
}
