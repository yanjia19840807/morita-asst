import { format } from 'date-fns'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import Link from 'next/link'
import type { AuthUserDto } from '@/modules/auth/dto'
import PageTitle from '../layout/page-title'
import FieldDetail from '../field-detail'

export default async function ProfileDetail({ user }: { user: AuthUserDto }) {
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
              <FieldDetail label='头像'>
                <Avatar>
                  <AvatarImage src={user.image || '/avatar-default.svg'} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </FieldDetail>
              <FieldDetail label='状态'>
                <div className='flex flex-wrap gap-2'>
                  <Badge variant={user.emailVerified ? 'secondary' : 'outline'}>
                    {user.emailVerified ? '邮箱已验证' : '邮箱未验证'}
                  </Badge>
                  <Badge variant={user.banned ? 'destructive' : 'secondary'}>
                    {user.banned ? '已禁用' : '正常'}
                  </Badge>
                </div>
              </FieldDetail>
            </div>
            <FieldDetail label='邮件地址'>{user.email}</FieldDetail>
            <FieldDetail label='用户名'>{user.name}</FieldDetail>
            <FieldDetail label='角色'>{user.role}</FieldDetail>
            <FieldDetail label='禁用原因'>{user.banReason ?? '-'}</FieldDetail>
            <FieldDetail label='禁用截止'>
              {user.banExpires
                ? format(new Date(user.banExpires), 'yyyy/MM/dd HH:mm')
                : '-'}
            </FieldDetail>
          </div>
        </CardContent>
        <CardFooter className='flex flex-wrap items-center gap-2'></CardFooter>
      </Card>
    </div>
  )
}
