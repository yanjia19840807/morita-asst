import { format } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import Link from 'next/link'
import { FetchSessionResult } from '@/dal/auth'
import PageTitle from '../layout/page-title'
import DetailItem from '../data-item'

export default async function ProfileDetail({
  session
}: {
  session: FetchSessionResult
}) {
  const user = session?.user
  if (!user) return null

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-3'>
      <PageTitle
        actionButtons={
          <Link
            className={buttonVariants({ variant: 'default' })}
            href='/profile/edit'
          >
            <Pencil />
            编辑
          </Link>
        }
      >
        我的资料
      </PageTitle>
      <Card>
        <CardContent>
          <div className='flex flex-col gap-6'>
            <div className='flex flex-row justify-between gap-3'>
              <DetailItem label='头像'>
                <Avatar>
                  <AvatarImage src={user.image || '/avatar-default.svg'} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </DetailItem>
              <DetailItem label='状态'>
                <div className='flex flex-wrap gap-2'>
                  <Badge variant={user.emailVerified ? 'secondary' : 'outline'}>
                    {user.emailVerified ? '邮箱已验证' : '邮箱未验证'}
                  </Badge>
                  <Badge variant={user.banned ? 'destructive' : 'secondary'}>
                    {user.banned ? '已禁用' : '正常'}
                  </Badge>
                </div>
              </DetailItem>
            </div>
            <DetailItem label='邮件地址'>{user.email}</DetailItem>
            <DetailItem label='用户名'>{user.name}</DetailItem>
            <DetailItem label='角色'>{user.role}</DetailItem>
            <DetailItem label='禁用原因'>{user.banReason ?? '-'}</DetailItem>
            <DetailItem label='禁用截止'>
              {user.banExpires
                ? format(new Date(user.banExpires), 'yyyy/MM/dd HH:mm')
                : '-'}
            </DetailItem>
          </div>
        </CardContent>
        <CardFooter className='flex flex-wrap items-center gap-2'></CardFooter>
      </Card>
    </div>
  )
}
