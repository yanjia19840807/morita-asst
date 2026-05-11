'use client'

import { changePasswordAction, editProfileAction } from '@/modules/auth/actions'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet
} from '@/components/ui/field'
import { ChevronLeft, LoaderCircle, Save } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  useForm,
  UseFormStateReturn
} from 'react-hook-form'
import {
  ProfileEditFormValues,
  ProfilePasswordFormValues,
  profileEditSchema,
  profilePasswordSchema
} from '@/modules/auth/schemas'
import { uploadAvatar } from '@/modules/oss/client'
import AvatarPicker from '../avatar-picker'
import { useEffect, useTransition } from 'react'
import PageTitle from '../layout/page-title'
import { toast } from 'sonner'

export default function ProfileEditForm({
  data
}: {
  data: ProfileEditFormValues & { id: string }
}) {
  const router = useRouter()
  const [isProfilePending, startProfileTransition] = useTransition()
  const [isPasswordPending, startPasswordTransition] = useTransition()

  const form = useForm({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      name: '',
      image: undefined
    }
  })

  const passwordForm = useForm<ProfilePasswordFormValues>({
    resolver: zodResolver(profilePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  const renderNameInput = function ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<ProfileEditFormValues, 'name'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<ProfileEditFormValues>
  }) {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>用户名</FieldLabel>
        <Input
          id='name'
          aria-invalid={fieldState.invalid}
          placeholder='请输入用户名'
          {...field}
        />
        {fieldState.invalid && fieldState.error && (
          <FieldError errors={[fieldState.error]} />
        )}
      </Field>
    )
  }

  const renderAvatarInput = function ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<ProfileEditFormValues, 'image'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<ProfileEditFormValues>
  }) {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>头像</FieldLabel>
        <AvatarPicker {...field} />
        {fieldState.invalid && fieldState.error && (
          <FieldError errors={[fieldState.error]} />
        )}
      </Field>
    )
  }

  const renderCurrentPasswordInput = function ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<ProfilePasswordFormValues, 'currentPassword'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<ProfilePasswordFormValues>
  }) {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>当前密码</FieldLabel>
        <Input
          id={field.name}
          type='password'
          placeholder='当前密码: 8-30个字符'
          aria-invalid={fieldState.invalid}
          {...field}
        />
        {fieldState.invalid && fieldState.error && (
          <FieldError errors={[fieldState.error]} />
        )}
      </Field>
    )
  }

  const renderNewPasswordInput = function ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<ProfilePasswordFormValues, 'newPassword'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<ProfilePasswordFormValues>
  }) {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>新密码</FieldLabel>
        <Input
          id={field.name}
          type='password'
          placeholder='新密码: 8-30个字符'
          aria-invalid={fieldState.invalid}
          {...field}
        />
        {fieldState.invalid && fieldState.error && (
          <FieldError errors={[fieldState.error]} />
        )}
      </Field>
    )
  }

  const renderConfirmPasswordInput = function ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<ProfilePasswordFormValues, 'confirmPassword'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<ProfilePasswordFormValues>
  }) {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>确认新密码</FieldLabel>
        <Input
          id={field.name}
          type='password'
          placeholder='请再次输入新密码'
          aria-invalid={fieldState.invalid}
          {...field}
        />
        {fieldState.invalid && fieldState.error && (
          <FieldError errors={[fieldState.error]} />
        )}
      </Field>
    )
  }

  async function onSubmit(values: ProfileEditFormValues) {
    startProfileTransition(async () => {
      try {
        const name = values.name
        const image = values.image
        const isNewImage = image instanceof File
        const imageUrl = isNewImage
          ? await uploadAvatar(data!.id, image)
          : image

        const result = await editProfileAction({
          name,
          image: imageUrl
        })

        if (result.success) {
          toast.success('资料更新成功')
          router.replace('/profile')
        } else {
          toast.error(result.error.message)
        }
      } catch (error) {
        console.error('Profile update failed:', error)
        toast.error(
          error instanceof Error ? error.message : '网络错误，请稍后重试。'
        )
      }
    })
  }

  async function onPasswordSubmit(values: ProfilePasswordFormValues) {
    startPasswordTransition(async () => {
      try {
        const result = await changePasswordAction(values)
        if (result.success) {
          toast.success('密码修改成功')
          passwordForm.reset()
        } else {
          toast.error(result.error.message)
        }
      } catch (error) {
        console.error('Password update failed:', error)
        toast.error(
          error instanceof Error ? error.message : '网络错误，请稍后重试。'
        )
      }
    })
  }

  useEffect(() => {
    if (data) {
      form.reset({
        name: data.name || '',
        image: data.image || undefined
      })
    }
  }, [data, form])

  if (!data) {
    return null
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-3'>
      <PageTitle
        actionButtons={
          <div className='flex flex-row items-center gap-2'>
            <Link
              href='/profile'
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
        编辑资料
      </PageTitle>
      <div className='flex flex-col gap-4'>
        <form id='profileEditForm' onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>基本资料</CardTitle>
              <CardDescription>编辑基本资料</CardDescription>
            </CardHeader>
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
                    name='name'
                    control={form.control}
                    render={renderNameInput}
                  />
                  <Field orientation='horizontal' className='justify-end'>
                    <Button type='submit' disabled={isProfilePending}>
                      {isProfilePending && (
                        <LoaderCircle className='animate-spin' />
                      )}
                      <Save />
                      保存
                    </Button>
                  </Field>
                </FieldSet>
              </FieldGroup>
            </CardContent>
            <CardFooter className='flex flex-wrap items-center gap-2'></CardFooter>
          </Card>
        </form>
        <form
          id='profilePasswordForm'
          onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
        >
          <Card>
            <CardHeader>
              <CardTitle>修改密码</CardTitle>
              <CardDescription>请输入当前密码后设置新密码</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <FieldSet>
                  <Controller
                    name='currentPassword'
                    control={passwordForm.control}
                    render={renderCurrentPasswordInput}
                  />
                  <Controller
                    name='newPassword'
                    control={passwordForm.control}
                    render={renderNewPasswordInput}
                  />
                  <Controller
                    name='confirmPassword'
                    control={passwordForm.control}
                    render={renderConfirmPasswordInput}
                  />
                  <Field orientation='horizontal' className='justify-end'>
                    <Button type='submit' disabled={isPasswordPending}>
                      {isPasswordPending && (
                        <LoaderCircle className='animate-spin' />
                      )}
                      <Save />
                      修改密码
                    </Button>
                  </Field>
                </FieldSet>
              </FieldGroup>
            </CardContent>
            <CardFooter className='flex flex-wrap items-center gap-2'></CardFooter>
          </Card>
        </form>
      </div>
    </div>
  )
}
