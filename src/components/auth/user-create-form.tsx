'use client'

import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  useForm,
  UseFormStateReturn
} from 'react-hook-form'
import { toast } from 'sonner'
import AvatarInput from '@/components/avatar-input'
import { Card, CardContent } from '@/components/ui/card'
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
import { UserCreateFormValues, userCreateSchema } from '@/schemas/auth'
import { uploadAvatar } from '@/lib/oss'
import { authClient } from '@/lib/auth-client'
import { createUserAction } from '@/app/(auth)/actions'
import PageTitle from '@/components/page-title'
import { Button, buttonVariants } from '@/components/ui/button'
import { ChevronLeft, LoaderCircle, Save } from 'lucide-react'
import { useTransition } from 'react'
import Link from 'next/link'

export function UserCreateForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { data: userData } = authClient.useSession()

  const defaultValues: UserCreateFormValues = {
    email: '',
    name: '',
    password: '',
    role: 'user' as 'user' | 'admin',
    image: undefined
  }

  const form = useForm({
    resolver: zodResolver(userCreateSchema),
    defaultValues
  })

  const renderAvatarInput = function ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<UserCreateFormValues, 'image'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<UserCreateFormValues>
  }) {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>头像</FieldLabel>
        <AvatarInput {...field} />
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
    field: ControllerRenderProps<UserCreateFormValues, 'email'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<UserCreateFormValues>
  }) {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>邮箱地址</FieldLabel>
        <Input
          id={field.name}
          placeholder='填写邮箱地址'
          aria-invalid={fieldState.invalid}
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
    field: ControllerRenderProps<UserCreateFormValues, 'name'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<UserCreateFormValues>
  }) {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>用户名</FieldLabel>
        <Input
          id={field.name}
          type='text'
          placeholder='用户名: 3-30个字符'
          aria-invalid={fieldState.invalid}
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
    field: ControllerRenderProps<UserCreateFormValues, 'password'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<UserCreateFormValues>
  }) {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>密码</FieldLabel>
        <Input
          id={field.name}
          type='password'
          placeholder='密码: 8-30个字符'
          aria-invalid={fieldState.invalid}
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
    field: ControllerRenderProps<UserCreateFormValues, 'role'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<UserCreateFormValues>
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

  const onSubmit = (values: UserCreateFormValues) => {
    startTransition(async () => {
      try {
        const image = values.image
        const isNewImage = image instanceof File
        const storageKey = isNewImage
          ? await uploadAvatar(userData!.user.id, image)
          : (image as string | undefined)

        const result = await createUserAction({
          ...values,
          image: storageKey
        })

        if (result.success) {
          toast.success('保存成功')
          router.push('/users')
        } else {
          toast.error(result.error.message)
        }
      } catch (error) {
        console.error(error)
        toast.error('操作失败，请稍后重试')
      }
    })
  }

  return (
    <div>
      <PageTitle
        actionButtons={
          <div className='flex flex-row items-center gap-2'>
            <Button type='submit' form='userCreateForm' disabled={isPending}>
              {isPending && <LoaderCircle className='animate-spin' />}
              <Save />
              保存
            </Button>
            <Link
              href={`/users/`}
              className={buttonVariants({
                variant: 'ghost'
              })}
            >
              <ChevronLeft />
              返回
            </Link>
          </div>
        }
      >
        新增用户
      </PageTitle>
      <form id='userCreateForm' onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardContent>
            <FieldGroup>
              <FieldSet>
                <Controller
                  name='image'
                  control={form.control}
                  render={renderAvatarInput}
                />
                <FieldSeparator />
                <Controller
                  name='email'
                  control={form.control}
                  render={renderEmailInput}
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
    </div>
  )
}
