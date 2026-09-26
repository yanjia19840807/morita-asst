import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { PageStack } from '@/components/layout/page-stack'
import PageTitle from '@/components/layout/page-title'
import { PageEmpty } from '@/components/layout/page-empty'

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
    <PageStack>
      <PageTitle
        title={title}
        description='维护用户画像，帮助助手更好地理解来访者'
        actionButtons={
          <Link className={buttonVariants({ variant: 'ghost' })} href={backHref}>
            返回
          </Link>
        }
      />
      <PageEmpty title='暂时无法编辑' description={description} />
    </PageStack>
  )
}
