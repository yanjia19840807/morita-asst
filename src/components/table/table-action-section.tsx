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
    <div
      className={cn(
        'flex items-center justify-between gap-2 px-2 pb-2',
        className
      )}
    >
      {children}
    </div>
  )
}
