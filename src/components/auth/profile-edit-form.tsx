'use client'

import { authClient } from '@/lib/auth-client'
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
import { LoaderCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthState } from '@/hooks/use-auth-state'
import FormError from '@/components/form-error'
import FormSuccess from '@/components/form-success'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  useForm,
  UseFormStateReturn
} from 'react-hook-form'
import z from 'zod'
import { ProfileEditSchema } from '@/schemas/auth'
import { uploadAvatar } from '@/lib/oss'
import AvatarInput from '../avatar-input'
import { useEffect } from 'react'

type FormValues = z.infer<typeof ProfileEditSchema>

export default function ProfileEditForm() {
  const router = useRouter()
  const { data: userData } = authClient.useSession()

  const {
    error,
    success,
    loading,
    setSuccess,
    setError,
    setLoading,
    resetState
  } = useAuthState()

  const form = useForm<FormValues>({
    resolver: zodResolver(ProfileEditSchema),
    defaultValues: {
      name: '',
      image: null
    }
  })

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
    field: ControllerRenderProps<FormValues, 'image'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<FormValues>
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

  async function onSubmit(values: FormValues) {
    try {
      const name = values.name.trim()
      const image = values.image
      const isNewImage = image instanceof File
      const imageUrl = isNewImage
        ? (await uploadAvatar(userData!.user.id, image)).url
        : image

      await authClient.updateUser(
        {
          name,
          image: imageUrl
        },
        {
          onResponse: () => {
            setLoading(false)
          },
          onRequest: () => {
            resetState()
            setLoading(true)
          },
          onSuccess: async () => {
            setSuccess('资料更新成功')
            router.replace('/profile')
          },
          onError: ctx => {
            setError(ctx.error.message || '资料更新失败')
          }
        }
      )
    } catch (error) {
      console.error('Profile update failed:', error)
      setError(
        error instanceof Error ? error.message : '网络错误，请稍后重试。'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userData?.user) {
      form.reset({
        name: userData?.user.name || '',
        image: userData?.user.image || null // 假设 user.image 是字符串 URL 或 null
      })
    }
  }, [userData?.user, form])

  if (!userData?.user) {
    return null
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>编辑资料</CardTitle>
          <CardDescription>{userData?.user.email}</CardDescription>
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
            </FieldSet>
          </FieldGroup>
        </CardContent>
        <CardFooter className='flex flex-col gap-3'>
          {success && <FormSuccess message={success} />}
          {error && <FormError message={error} />}
          <Field orientation='horizontal'>
            <Button
              type='submit'
              variant='default'
              className='flex-1'
              disabled={loading}
            >
              {loading && <LoaderCircle className='animate-spin' />}
              提交
            </Button>
          </Field>
          <Field orientation='horizontal'>
            <Link
              href='/profile'
              className={`flex-1 ${buttonVariants({
                variant: 'secondary'
              })}`}
            >
              返回
            </Link>
          </Field>
        </CardFooter>
      </Card>
    </form>
  )
}
