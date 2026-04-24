import React from 'react'
import { cn } from '@/lib/utils'

interface TableActionSectionProps extends React.PropsWithChildren {
  className?: string
}

export default function TableActionSection({
  children,
  className
}: TableActionSectionProps) {
  return (
    <div className={cn('my-4 flex items-center gap-2', className)}>
      {children}
    </div>
  )
}
