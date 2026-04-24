import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
  CardDescription
} from '@/components/ui/card'
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
import { FetchProfileResult } from '@/server/auth'

export default async function ProfileView({
  session
}: {
  session: FetchProfileResult
}) {
  const user = session?.user
  if (!user) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>我的资料</CardTitle>
        <CardDescription>{user.email}</CardDescription>
        <CardAction>
          <Link
            className={buttonVariants({ variant: 'default' })}
            href='/profile/edit'
          >
            <Pencil />
            编辑
          </Link>
        </CardAction>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <FieldSet>
            <Field orientation='horizontal'>
              <FieldLabel>头像</FieldLabel>
              <Avatar size='lg'>
                <AvatarImage src={user.image || '/avatar-default.svg'} />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </Field>
            <FieldSeparator />
            <Field orientation='horizontal'>
              <FieldLabel>名称</FieldLabel>
              <FieldDescription>{user.name}</FieldDescription>
            </Field>
          </FieldSet>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
