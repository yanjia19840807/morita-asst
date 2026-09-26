import type { ReactNode } from 'react'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

export function PagePanel({
  title,
  description,
  action,
  footer,
  children,
  size = 'default',
  id,
  className
}: {
  title?: ReactNode
  description?: ReactNode
  action?: ReactNode
  footer?: ReactNode
  children: ReactNode
  size?: 'default' | 'sm'
  id?: string
  className?: string
}) {
  return (
    <Card id={id} size={size} className={className}>
      {title || description || action ? (
        <CardHeader>
          {title ? <CardTitle>{title}</CardTitle> : null}
          {description ? (
            <CardDescription>{description}</CardDescription>
          ) : null}
          {action ? <CardAction>{action}</CardAction> : null}
        </CardHeader>
      ) : null}
      <CardContent>{children}</CardContent>
      {footer ? <CardFooter>{footer}</CardFooter> : null}
    </Card>
  )
}

export default PagePanel
