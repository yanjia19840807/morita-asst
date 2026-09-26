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
import { useEffect, useTransition, type ReactNode } from 'react'
import { toast } from 'sonner'
import type z from 'zod'
import AvatarPicker from '@/components/avatar-picker'
import { PageStack } from '@/components/layout/page-stack'
import PageTitle from '@/components/layout/page-title'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
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
import { authClient } from '@/modules/auth/client'
import { UserEditFormValues } from '@/modules/auth/schemas'
import { uploadAvatar } from '@/modules/oss/client'
import { ChevronLeft, LoaderCircle, Save } from 'lucide-react'
import { ResponseResult } from '@/lib/api/response'

type UserFormInput = Omit<UserEditFormValues, 'id'> & {
  id?: string
}

type UserFormMode = 'Create' | 'Edit'

type UserFormExtraContext = {
  selectedRole: UserFormInput['role']
  isPending: boolean
}

interface UserFormProps {
  mode: UserFormMode
  title: string
  formId: string
  defaultValues: UserFormInput
  schema: z.ZodType<UserFormInput>
  onSubmitAction: (values: UserFormInput) => Promise<ResponseResult<unknown>>
  extraActions?: ReactNode
  getSuccessHref?: (data: unknown) => string
  afterFields?: (context: UserFormExtraContext) => ReactNode
  renderExtra?: (context: UserFormExtraContext) => ReactNode
  embedded?: boolean
  successMessage?: string
}

export function UserForm({
  mode,
  title,
  formId,
  defaultValues,
  schema,
  onSubmitAction,
  extraActions,
  getSuccessHref,
  afterFields,
  renderExtra,
  embedded = false,
  successMessage = '保存成功'
}: UserFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { data: userData } = authClient.useSession()

  const form = useForm<UserFormInput>({
    resolver: zodResolver(schema as never) as Resolver<UserFormInput>,
    defaultValues
  })
  const selectedRole = form.watch('role')
  const extraContext = { selectedRole, isPending }

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
      <Field data-invalid={fieldState.invalid}>
        <AvatarPicker {...field} />
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
          disabled={mode === 'Edit'}
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
          value={field.value || null}
          onValueChange={value => field.onChange(value ?? '')}
          items={[
            { value: 'user', label: '用户' },
            { value: 'admin', label: '管理员' }
          ]}
          disabled={isPending}
        >
          <SelectTrigger
            id={field.name}
            aria-invalid={fieldState.invalid}
            className='w-full'
          >
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
          toast.success(successMessage)
          router.push(
            getSuccessHref?.('data' in result ? result.data : undefined) ??
              '/users'
          )
        } else {
          toast.error(result.error.message)
        }
      } catch (error) {
        console.error(error)
        toast.error('操作失败，请稍后重试')
      }
    })
  }

  const fields = (
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
        {'id' in defaultValues && (
          <input type='hidden' {...form.register('id')} />
        )}
        <FieldGroup>
            <FieldSet>
              {embedded ? null : <FieldLegend>账号</FieldLegend>}
              <Controller
                name='image'
                control={form.control}
                render={renderAvatarInput}
              />
              <div className='grid gap-5 md:grid-cols-2'>
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
              <Controller
                name='role'
                control={form.control}
                render={renderRoleInput}
              />
            </FieldSet>
            {afterFields ? afterFields(extraContext) : null}
          </FieldGroup>
      </form>
  )

  if (embedded) {
    return (
      <>
        {fields}
        {renderExtra ? renderExtra(extraContext) : null}
      </>
    )
  }

  return (
    <PageStack>
      <PageTitle
        title={title}
        description={
          mode === 'Create' ? '创建账号并设置角色' : '更新账号资料'
        }
        actionButtons={
          <div className='flex flex-row items-center gap-2'>
            <Button type='submit' form={formId} disabled={isPending}>
              {isPending && <LoaderCircle className='animate-spin' />}
              <Save />
              保存
            </Button>
            {extraActions}
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
      />
      {fields}
      {renderExtra ? renderExtra(extraContext) : null}
    </PageStack>
  )
}
