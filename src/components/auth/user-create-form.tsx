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

import { createUserAction } from '@/app/(dashboard)/users/actions'
import AvatarInput from '@/components/avatar-input'
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
import { UserCreateFormSchema } from '@/schemas/auth'
import { uploadAvatar } from '@/lib/oss'
import { Button } from '../ui/button'
import { Save } from 'lucide-react'
import PageActionBar from '../page-action-bar'
import { authClient } from '@/lib/auth-client'

type FormValues = z.input<typeof UserCreateFormSchema>
type SubmitValues = z.output<typeof UserCreateFormSchema>

export function UserCreateForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { data: userData } = authClient.useSession()

  const form = useForm<FormValues, undefined, SubmitValues>({
    resolver: zodResolver(UserCreateFormSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
      role: 'user',
      image: null
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

  const renderEmailInput = function ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<FormValues, 'email'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<FormValues>
  }) {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>邮箱地址</FieldLabel>
        <Input
          id={field.name}
          placeholder='user@example.com'
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
          type='text'
          placeholder='username'
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

  const renderPasswordInput = function ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<FormValues, 'password'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<FormValues>
  }) {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>密码</FieldLabel>
        <Input
          id={field.name}
          type='password'
          placeholder='长度8-30个字符'
          aria-invalid={fieldState.invalid}
          disabled={isPending}
          value={field.value ?? ''}
          onBlur={field.onBlur}
          name={field.name}
          ref={field.ref}
          onChange={event => field.onChange(event.target.value)}
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

  const handleSubmit = (values: SubmitValues) => {
    startTransition(async () => {
      try {
        const image = values.image
        const isNewImage = image instanceof File
        const imageUrl = isNewImage
          ? (await uploadAvatar(userData!.user.id, image)).url
          : (image as string | null | undefined)

        const result = await createUserAction({
          ...values,
          image: imageUrl
        })
        toast.success(result.message)
        router.push('/users')
      } catch (error) {
        console.error(error)
        const message =
          error instanceof Error && error.name === 'APIError'
            ? error.message
            : '操作失败，请稍后重试'
        toast.error(message)
      }
    })
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <PageActionBar>
        <Button type='submit'>
          <Save />
          保存
        </Button>
        <Button type='button' variant='ghost' onClick={() => router.back()}>
          返回
        </Button>
      </PageActionBar>
      <Card>
        <CardHeader>
          <CardTitle>新增用户</CardTitle>
          <CardDescription>填写以下信息创建新用户账号。</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <FieldSet>
              <Controller
                name='email'
                control={form.control}
                render={renderEmailInput}
              />
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
                name='password'
                control={form.control}
                render={renderPasswordInput}
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
