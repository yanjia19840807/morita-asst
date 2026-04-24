'use client'
import { ForgotPasswordSchema } from '@/schemas/auth'
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
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useAuthState } from '@/hooks/use-auth-state'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  useForm,
  UseFormStateReturn
} from 'react-hook-form'
import z from 'zod'
import FormError from '../form-error'
import { authClient } from '@/lib/auth-client'
import FormSuccess from '../form-success'

type FormValues = z.infer<typeof ForgotPasswordSchema>

export default function ForgotPasswordForm() {
  const router = useRouter()

  const {
    error,
    success,
    loading,
    setSuccess,
    setError,
    setLoading,
    resetState
  } = useAuthState()

  const form = useForm({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  })

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
          id='email'
          aria-invalid={fieldState.invalid}
          placeholder='请输入邮箱地址'
          {...field}
        />
        {fieldState.invalid && fieldState.error && (
          <FieldError errors={[fieldState.error]} />
        )}
      </Field>
    )
  }

  async function onSubmit(data: FormValues) {
    const { email } = data

    try {
      await authClient.requestPasswordReset(
        {
          email,
          redirectTo: '/reset-password/email' // URL to redirect the user after resetting the password.
        },
        {
          onResponse: () => {
            setLoading(false)
          },
          onRequest: () => {
            resetState()
            setLoading(true)
          },
          onSuccess: () => {
            setSuccess('密码重置链接已发送至您的电子邮箱')
          },
          onError: (ctx: { error: { message: string } }) => {
            setError(ctx.error.message)
          }
        }
      )
    } catch (error) {
      // catch the error
      console.log(error)
      setError('Something went wrong')
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>忘记密码</CardTitle>
          <CardDescription>输入邮箱地址获取密码重置链接</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Controller
              name='email'
              control={form.control}
              render={renderEmailInput}
            />
          </FieldGroup>
        </CardContent>
        <CardFooter className='flex flex-col gap-3'>
          {success && <FormSuccess message={success} />}
          {error && <FormError message={error} />}
          <Field orientation='horizontal'>
            <Button variant='default' className='flex-1'>
              发送重置邮件
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
