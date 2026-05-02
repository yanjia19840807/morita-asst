'use client'
import { ForgotPasswordFormValues, forgotPasswordSchema } from '@/schemas/auth'
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
import React, { useTransition } from 'react'
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  useForm,
  UseFormStateReturn
} from 'react-hook-form'
import { forgotPasswordAction } from '@/app/(auth)/actions'
import { toast } from 'sonner'
import { LoaderCircle } from 'lucide-react'

export default function ForgotPasswordForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: ''
    }
  })

  const renderEmailInput = function ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<ForgotPasswordFormValues, 'email'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<ForgotPasswordFormValues>
  }) {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>邮箱地址</FieldLabel>
        <Input
          id='email'
          aria-invalid={fieldState.invalid}
          placeholder='输入邮箱地址'
          {...field}
        />
        {fieldState.invalid && fieldState.error && (
          <FieldError errors={[fieldState.error]} />
        )}
      </Field>
    )
  }

  async function onSubmit(data: ForgotPasswordFormValues) {
    startTransition(async () => {
      const result = await forgotPasswordAction(data)
      if (result.success) {
        toast.success('密码重置链接已发送至您的电子邮箱')
        router.replace('/')
      } else {
        toast.error(result.error.message)
      }
    })
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
          <Field orientation='horizontal'>
            <Button variant='default' className='flex-1' disabled={isPending}>
              {isPending && <LoaderCircle className='animate-spin' />}
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
