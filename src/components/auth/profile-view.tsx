import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet
} from '@/components/ui/field'
import { Pencil } from 'lucide-react'
import Link from 'next/link'
import { FetchSessionResult } from '@/data-access/auth'
import PageTitle from '../page-title'

export default async function ProfileView({
  session
}: {
  session: FetchSessionResult
}) {
  const user = session?.user
  if (!user) return null

  return (
    <div>
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
          <FieldGroup>
            <FieldSet>
              <Field orientation='horizontal'>
                <FieldLabel>头像</FieldLabel>
                <Avatar>
                  <AvatarImage src={user.image || '/avatar-default.svg'} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Field>
              <FieldSeparator />
              <Field orientation='horizontal'>
                <FieldLabel>状态</FieldLabel>
                <div className='flex flex-wrap gap-2'>
                  <Badge variant={user.emailVerified ? 'secondary' : 'outline'}>
                    {user.emailVerified ? '邮箱已验证' : '邮箱未验证'}
                  </Badge>
                  <Badge variant={user.banned ? 'destructive' : 'secondary'}>
                    {user.banned ? '已禁用' : '正常'}
                  </Badge>
                </div>
              </Field>
              <Field orientation='horizontal'>
                <FieldLabel>邮件地址</FieldLabel>
                <FieldDescription>{user.email}</FieldDescription>
              </Field>
              <Field orientation='horizontal'>
                <FieldLabel>用户名</FieldLabel>
                <FieldDescription>{user.name}</FieldDescription>
              </Field>
              <Field orientation='horizontal'>
                <FieldLabel>角色</FieldLabel>
                <FieldDescription>{user.role ?? '-'}</FieldDescription>
              </Field>
              <Field orientation='horizontal'>
                <FieldLabel>禁用原因</FieldLabel>
                <FieldDescription>{user.banReason ?? '-'}</FieldDescription>
              </Field>
              <Field orientation='horizontal'>
                <FieldLabel>禁用截止</FieldLabel>
                <FieldDescription>
                  {user.banExpires
                    ? new Date(user.banExpires).toLocaleString()
                    : '-'}
                </FieldDescription>
              </Field>
            </FieldSet>
          </FieldGroup>
        </CardContent>
        <CardFooter className='flex flex-wrap items-center gap-2'></CardFooter>
      </Card>
    </div>
  )
}
