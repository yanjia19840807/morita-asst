import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import InfoItem from '@/components/info-item'
import PageTitle from '@/components/layout/page-title'
import type { UserProfileDetailDto } from '@/modules/profiles/dto'
import DescriptionItem from '../description-item'
import { Separator } from '../ui/separator'

type UserProfileDetailProps = {
  data: UserProfileDetailDto
  title?: string
  editHref?: string
  backHref?: string
  embedded?: boolean
  showUserFields?: boolean
  description?: string
}

export function UserProfileDetail({
  data,
  title = '用户画像',
  editHref,
  backHref,
  embedded = false,
  showUserFields = true,
  description
}: UserProfileDetailProps) {
  const card = (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <div className='flex flex-col gap-6'>
          <div className='grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2'>
            {showUserFields ? (
              <>
                <InfoItem label='用户名' value={data.user.name} />
                <InfoItem label='邮箱' value={data.user.email} />
              </>
            ) : null}
            <InfoItem label='性别' value={data.gender ?? '-'} />
            <InfoItem label='年龄段' value={data.ageRange ?? '-'} />
            <InfoItem label='职业' value={data.occupation ?? '-'} />
            <InfoItem label='问题数量' value={data.issues.length} />
          </div>
          <Separator />
          <div className='flex flex-col gap-3'>
            <div className='text-muted-foreground text-sm'>主要问题</div>
            {data.issues.length ? (
              <div className='flex flex-col gap-3'>
                {data.issues.map(issue => (
                  <div key={issue.id} className='flex flex-col gap-3'>
                    <div className='grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2'>
                      <InfoItem label='优先级' value={`P${issue.priority}`} />
                      <InfoItem
                        label='标签'
                        value={issue.tags.length ? issue.tags.join('、') : '-'}
                      />
                    </div>
                    <DescriptionItem label='描述' value={issue.description} />
                    <Separator />
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-muted-foreground rounded-md border border-dashed p-4 text-sm'>
                暂未填写
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (embedded) {
    return card
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-3'>
      <PageTitle
        actionButtons={
          <div className='flex flex-row items-center gap-2'>
            {editHref ? (
              <Link
                className={buttonVariants({ variant: 'default' })}
                href={editHref}
              >
                编辑画像
              </Link>
            ) : null}
            {backHref ? (
              <Link
                className={buttonVariants({ variant: 'ghost' })}
                href={backHref}
              >
                返回
              </Link>
            ) : null}
          </div>
        }
      >
        {title}
      </PageTitle>
      {card}
    </div>
  )
}
