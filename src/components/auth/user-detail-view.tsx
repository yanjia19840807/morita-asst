import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet
} from '@/components/ui/field'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { FetchUserByIdResult } from '@/server/auth'
import { Edit } from 'lucide-react'
import PageActionBar from '../page-action-bar'

interface UserDetailViewProps {
  user: FetchUserByIdResult
}

export function UserDetailView({ user }: UserDetailViewProps) {
  return (
    <>
      <PageActionBar>
        <Button asChild>
          <Link href={`/users/${user.id}/edit`}>
            <Edit />
            编辑
          </Link>
        </Button>
        <Button variant='ghost' asChild>
          <Link href='/users'>返回</Link>
        </Button>
      </PageActionBar>
      <Card>
        <CardHeader>
          <CardTitle>用户详情</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <FieldSet>
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
              <FieldSeparator />
              <Field orientation='horizontal'>
                <FieldLabel>头像</FieldLabel>
                <Avatar>
                  <AvatarImage src={user.image ?? '/avatar-default.svg'} />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </Field>
              <FieldSeparator />
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
    </>
  )
}
