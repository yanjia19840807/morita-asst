import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import PageTitle from '@/components/layout/page-title'

type UserProfileEditPlaceholderProps = {
  title: string
  description: string
  backHref: string
}

export function UserProfileEditPlaceholder({
  title,
  description,
  backHref
}: UserProfileEditPlaceholderProps) {
  return (
    <div className='flex min-h-0 flex-1 flex-col gap-3'>
      <PageTitle
        actionButtons={
          <Link className={buttonVariants({ variant: 'ghost' })} href={backHref}>
            返回
          </Link>
        }
      >
        {title}
      </PageTitle>
      <Card>
        <CardContent className='py-6 text-sm text-muted-foreground'>
          {description}
        </CardContent>
      </Card>
    </div>
  )
}