'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  Resolver,
  useForm,
  UseFormStateReturn
} from 'react-hook-form'
import { useEffect, useTransition } from 'react'
import { toast } from 'sonner'
import type z from 'zod'
import AvatarInput from '@/components/avatar-input'
import PageTitle from '@/components/page-title'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
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
import { authClient } from '@/lib/auth-client'
import { ResponseResult } from '@/lib/api/shared/response'
import { uploadAvatar } from '@/lib/oss'
import { UserEditFormValues } from '@/schemas/auth'
import { ChevronLeft, LoaderCircle, Save } from 'lucide-react'

type UserFormInput = Omit<UserEditFormValues, 'id'> & {
  id?: string
}

type UserFormMode = 'Create' | 'Edit'

interface UserFormProps {
  mode: UserFormMode
  title: string
  formId: string
  defaultValues: UserFormInput
  schema: z.ZodType<UserFormInput>
  onSubmitAction: (values: UserFormInput) => Promise<ResponseResult>
}

export function UserForm({
  mode,
  title,
  formId,
  defaultValues,
  schema,
  onSubmitAction
}: UserFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { data: userData } = authClient.useSession()

  const form = useForm<UserFormInput>({
    resolver: zodResolver(schema as never) as Resolver<UserFormInput>,
    defaultValues
  })

  useEffect(() => {
    form.reset(defaultValues)
  }, [defaultValues, form])

  const renderAvatarInput = ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<UserFormInput, 'image'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<UserFormInput>
  }) => {
    return (
      <Field data-invalid={fieldState.invalid} className='flex-1'>
        <FieldLabel htmlFor={field.name}>头像</FieldLabel>
        <AvatarInput {...field} />
        {fieldState.invalid && fieldState.error && (
          <FieldError errors={[fieldState.error]} />
        )}
      </Field>
    )
  }

  const renderEmailInput = ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<UserFormInput, 'email'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<UserFormInput>
  }) => {
    return (
      <Field data-invalid={fieldState.invalid} className='flex-1'>
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

  const renderNameInput = ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<UserFormInput, 'name'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<UserFormInput>
  }) => {
    return (
      <Field data-invalid={fieldState.invalid} className='flex-1'>
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

  const renderPasswordInput = ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<UserFormInput, 'password'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<UserFormInput>
  }) => {
    return (
      <Field data-invalid={fieldState.invalid} className='flex-1'>
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
        {mode === 'Edit' && (
          <FieldDescription>留空则不修改密码</FieldDescription>
        )}
        {fieldState.invalid && fieldState.error && (
          <FieldError errors={[fieldState.error]} />
        )}
      </Field>
    )
  }

  const renderRoleInput = ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<UserFormInput, 'role'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<UserFormInput>
  }) => {
    return (
      <Field data-invalid={fieldState.invalid} className='flex-1'>
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

  const onSubmit = (values: UserFormInput) => {
    startTransition(async () => {
      try {
        const image = values.image
        const isNewImage = image instanceof File
        const storageKey = isNewImage
          ? await uploadAvatar(userData!.user.id, image)
          : (image as string | undefined)

        const result = await onSubmitAction({
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
    <div className='flex min-h-0 flex-1 flex-col gap-3'>
      <PageTitle
        actionButtons={
          <div className='flex flex-row items-center gap-2'>
            <Button type='submit' form={formId} disabled={isPending}>
              {isPending && <LoaderCircle className='animate-spin' />}
              <Save />
              保存
            </Button>
            <Link
              href='/users'
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
        {title}
      </PageTitle>
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
        {'id' in defaultValues && (
          <input type='hidden' {...form.register('id')} />
        )}
        <Card>
          <CardContent>
            <FieldGroup>
              <FieldSet>
                <div className='flex w-1/2 flex-col gap-6 md:flex-row'>
                  <Controller
                    name='image'
                    control={form.control}
                    render={renderAvatarInput}
                  />
                </div>
                <div className='flex flex-col gap-6 md:flex-row'>
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
                </div>
                <div className='flex flex-col gap-6 md:flex-row'>
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
                </div>
              </FieldSet>
            </FieldGroup>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
