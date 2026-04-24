'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  useForm,
  UseFormStateReturn
} from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'

import {
  removeUserAction,
  resetUserPasswordAction,
  toggleUserBanAction,
  updateUserAction
} from '@/app/(dashboard)/users/actions'
import AvatarInput from '@/components/avatar-input'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { uploadAvatar } from '@/lib/oss'
import { UserEditSchema } from '@/schemas/auth'
import type { FetchUserByIdResult } from '@/server/auth'
import { Button } from '../ui/button'
import { Ban, KeyRound, Save, ShieldCheck, Trash2 } from 'lucide-react'
import Link from 'next/link'
import PageActionBar from '../page-action-bar'
import { authClient } from '@/lib/auth-client'

type FormValues = z.input<typeof UserEditSchema>
type SubmitValues = z.output<typeof UserEditSchema>

export function UserEditForm({ user }: { user: FetchUserByIdResult }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { data: userData } = authClient.useSession()

  const form = useForm<FormValues, undefined, SubmitValues>({
    resolver: zodResolver(UserEditSchema),
    defaultValues: {
      name: user.name,
      role: user.role ?? '',
      image: user.image ?? null
    }
  })

  const renderAvatarInput = function ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<FormValues, 'image'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<FormValues>
  }) {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>头像</FieldLabel>
        <AvatarInput {...field} disabled={isPending} />
        {fieldState.invalid && fieldState.error && (
          <FieldError errors={[fieldState.error]} />
        )}
      </Field>
    )
  }

  const renderNameInput = function ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<FormValues, 'name'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<FormValues>
  }) {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>用户名</FieldLabel>
        <Input
          id={field.name}
          aria-invalid={fieldState.invalid}
          disabled={isPending}
          {...field}
        />
        {fieldState.invalid && fieldState.error && (
          <FieldError errors={[fieldState.error]} />
        )}
      </Field>
    )
  }

  const renderRoleInput = function ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<FormValues, 'role'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<FormValues>
  }) {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>角色</FieldLabel>
        <Select
          value={field.value ?? ''}
          onValueChange={field.onChange}
          disabled={isPending}
        >
          <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
            <SelectValue placeholder='请选择角色' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='user'>用户</SelectItem>
            <SelectItem value='admin'>管理员</SelectItem>
          </SelectContent>
        </Select>
        {fieldState.invalid && fieldState.error && (
          <FieldError errors={[fieldState.error]} />
        )}
      </Field>
    )
  }

  const handleSave = (values: SubmitValues) => {
    startTransition(async () => {
      try {
        const image = values.image
        const isNewImage = image instanceof File
        const imageUrl = isNewImage
          ? (await uploadAvatar(userData!.user.id, image)).url
          : (image as string | null | undefined)

        const result = await updateUserAction({
          userId: user.id,
          name: values.name,
          role: values.role,
          image: imageUrl
        })

        toast.success(result.message)
        router.refresh()
      } catch (error) {
        console.error(error)
        toast.error('操作失败，请稍后重试')
      }
    })
  }

  const handleResetPassword = () => {
    startTransition(async () => {
      try {
        const result = await resetUserPasswordAction({ userId: user.id })
        toast.success(result.message)
      } catch (error) {
        console.error(error)
        toast.error('操作失败，请稍后重试')
      }
    })
  }

  const handleToggleBan = () => {
    startTransition(async () => {
      try {
        const result = await toggleUserBanAction({
          userId: user.id,
          banned: Boolean(user.banned)
        })
        toast.success(result.message)
        router.refresh()
      } catch (error) {
        console.error(error)
        toast.error('操作失败，请稍后重试')
      }
    })
  }

  const handleRemove = () => {
    startTransition(async () => {
      try {
        const result = await removeUserAction({ userId: user.id })
        toast.success(result.message)
        router.replace('/users')
      } catch (error) {
        console.error(error)
        toast.error('操作失败，请稍后重试')
      }
    })
  }

  return (
    <form onSubmit={form.handleSubmit(handleSave)}>
      <PageActionBar>
        <Button type='submit' disabled={isPending}>
          <Save />
          保存
        </Button>
        <Button
          type='button'
          variant='secondary'
          onClick={handleResetPassword}
          disabled={isPending}
        >
          <KeyRound />
          重置密码
        </Button>
        <Button
          type='button'
          variant='secondary'
          onClick={handleToggleBan}
          disabled={isPending}
        >
          {user.banned ? <ShieldCheck /> : <Ban />}
          {user.banned ? '启用' : '禁用'}
        </Button>
        <Button
          type='button'
          variant='destructive'
          onClick={handleRemove}
          disabled={isPending}
        >
          <Trash2 />
          删除
        </Button>
        <Button variant='ghost' asChild>
          <Link href='/users'>返回</Link>
        </Button>
      </PageActionBar>
      <Card>
        <CardHeader>
          <CardTitle>编辑用户</CardTitle>
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
              <Controller
                name='image'
                control={form.control}
                render={renderAvatarInput}
              />
              <Controller
                name='name'
                control={form.control}
                render={renderNameInput}
              />
              <Controller
                name='role'
                control={form.control}
                render={renderRoleInput}
              />
            </FieldSet>
          </FieldGroup>
        </CardContent>
      </Card>
    </form>
  )
}
