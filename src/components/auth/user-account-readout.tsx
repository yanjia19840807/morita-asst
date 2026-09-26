import { format } from 'date-fns'

import { UserFieldValue } from '@/components/auth/user-section'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Field, FieldLabel } from '@/components/ui/field'
import { getAvatarSrc } from '@/modules/auth/avatar'
import type { AuthUserDto } from '@/modules/auth/dto'

function getRoleLabel(role?: string | null) {
  if (role === 'admin') {
    return '管理员'
  }

  if (role === 'user') {
    return '用户'
  }

  return role ?? '-'
}

export function UserAccountReadout({ user }: { user: AuthUserDto }) {
  return (
    <>
      <Avatar className='size-20 shrink-0 after:hidden'>
        <AvatarImage src={getAvatarSrc(user.image)} />
        <AvatarFallback>
          {user.name.slice(0, 1).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className='grid gap-5 md:grid-cols-2'>
        <Field>
          <FieldLabel>邮箱</FieldLabel>
          <UserFieldValue>{user.email}</UserFieldValue>
        </Field>
        <Field>
          <FieldLabel>用户名</FieldLabel>
          <UserFieldValue>{user.name}</UserFieldValue>
        </Field>
        <Field>
          <FieldLabel>角色</FieldLabel>
          <UserFieldValue>{getRoleLabel(user.role)}</UserFieldValue>
        </Field>
        <Field>
          <FieldLabel>状态</FieldLabel>
          <UserFieldValue>
            <div className='flex flex-wrap gap-2'>
              <Badge variant={user.emailVerified ? 'secondary' : 'outline'}>
                {user.emailVerified ? '邮箱已验证' : '邮箱未验证'}
              </Badge>
              <Badge variant={user.banned ? 'destructive' : 'secondary'}>
                {user.banned ? '已禁用' : '正常'}
              </Badge>
            </div>
          </UserFieldValue>
        </Field>
        {user.banned ? (
          <>
            <Field>
              <FieldLabel>禁用原因</FieldLabel>
              <UserFieldValue>{user.banReason ?? '-'}</UserFieldValue>
            </Field>
            <Field>
              <FieldLabel>禁用截止</FieldLabel>
              <UserFieldValue>
                {user.banExpires
                  ? format(new Date(user.banExpires), 'yyyy/MM/dd HH:mm')
                  : '长期'}
              </UserFieldValue>
            </Field>
          </>
        ) : null}
      </div>
    </>
  )
}
