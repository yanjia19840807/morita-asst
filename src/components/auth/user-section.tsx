import type { ReactNode } from 'react'

import {
  FieldGroup,
  FieldLegend,
  FieldSet
} from '@/components/ui/field'
import { cn } from '@/lib/utils'

export function UserSection({
  id,
  title,
  action,
  children,
  className
}: {
  id?: string
  title?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <FieldSet id={id} className={cn(id ? 'scroll-mt-24' : undefined, className)}>
      {title || action ? (
        <div className='flex items-center justify-between gap-3'>
          {title ? <FieldLegend className='mb-0'>{title}</FieldLegend> : null}
          {action}
        </div>
      ) : null}
      <FieldGroup>{children}</FieldGroup>
    </FieldSet>
  )
}

export function UserFieldValue({ children }: { children: ReactNode }) {
  return <div className='text-sm leading-snug'>{children}</div>
}
