'use client'

import { ResetPasswordFormValues, resetPasswordSchema } from '@/schemas/auth'
import { Button, buttonVariants } from '@/components/ui/button'
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
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoaderCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  useForm,
  UseFormStateReturn
} from 'react-hook-form'
import { useTransition } from 'react'
import { resetPasswordAction } from '@/app/(auth)/actions'
import { toast } from 'sonner'

export default function ResetPasswordForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
      token: token || ''
    }
  })

  const renderPasswordInput = function ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<ResetPasswordFormValues, 'password'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<ResetPasswordFormValues>
  }) {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>密码</FieldLabel>
        <Input
          id='password'
          type='password'
          disabled={!token}
          aria-invalid={fieldState.invalid}
          placeholder='请输入密码'
          {...field}
        />
        <FieldDescription>长度为8-30个字符</FieldDescription>
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
    field: ControllerRenderProps<ResetPasswordFormValues, 'confirmPassword'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<ResetPasswordFormValues>
  }) {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>确认密码</FieldLabel>
        <Input
          id='confirmPassword'
          type='password'
          aria-invalid={fieldState.invalid}
          placeholder='请再次输入密码'
          disabled={!token}
          {...field}
        />
        {fieldState.invalid && fieldState.error && (
          <FieldError errors={[fieldState.error]} />
        )}
      </Field>
    )
  }

  const onSubmit = async (data: ResetPasswordFormValues) => {
    startTransition(async () => {
      const result = await resetPasswordAction(data)
      if (result.success) {
        toast.success('密码已设置')
        router.replace('/sign-in/email')
      } else {
        toast.error(result.error.message)
      }
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>设置密码</CardTitle>
          <CardDescription>设置一个新密码</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Controller
              name='password'
              control={form.control}
              render={renderPasswordInput}
            />
            <Controller
              name='confirmPassword'
              control={form.control}
              render={renderConfirmPasswordInput}
            />
          </FieldGroup>
        </CardContent>
        <CardFooter className='flex flex-col gap-3'>
          <Field orientation='horizontal'>
            <Button
              variant='default'
              className='flex-1'
              disabled={isPending || !token}
            >
              {isPending && <LoaderCircle className='animate-spin' />}
              提交
            </Button>
          </Field>
          <Field orientation='horizontal'>
            <Link
              href='/sign-in/email'
              className={`flex-1 ${buttonVariants({
                variant: 'secondary'
              })}`}
            >
              返回登录
            </Link>
          </Field>
        </CardFooter>
      </Card>
    </form>
  )
}
