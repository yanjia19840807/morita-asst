'use client'

import { EmailSignInFormValues, emailSignInSchema } from '@/schemas/auth'
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
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  useForm,
  UseFormStateReturn
} from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { LoaderCircle } from 'lucide-react'
import { useTransition } from 'react'
import { toast } from 'sonner'
import { signInEmailAction } from '@/actions/auth/actions'
import { authClient } from '@/lib/auth-client'

export default function EmailSignInForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { refetch: refetchSession } = authClient.useSession()

  const form = useForm({
    resolver: zodResolver(emailSignInSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })

  const renderEmailInput = function ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<EmailSignInFormValues, 'email'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<EmailSignInFormValues>
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

  const renderPasswordInput = function ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<EmailSignInFormValues, 'password'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<EmailSignInFormValues>
  }) {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>密码</FieldLabel>
        <Input
          id='password'
          aria-invalid={fieldState.invalid}
          placeholder='密码: 8-30个字符'
          {...field}
        />
        {fieldState.invalid && fieldState.error && (
          <FieldError errors={[fieldState.error]} />
        )}
      </Field>
    )
  }

  async function onSubmit(data: EmailSignInFormValues) {
    startTransition(async () => {
      const result = await signInEmailAction(data)
      if (result.success) {
        await refetchSession()
        toast.success('登录成功')
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
          <CardTitle>用户登录</CardTitle>
          <CardDescription>输入邮箱地址和密码访问你的账户</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Controller
              name='email'
              control={form.control}
              render={renderEmailInput}
            />
            <Controller
              name='password'
              control={form.control}
              render={renderPasswordInput}
            />
          </FieldGroup>
        </CardContent>
        <CardFooter className='flex flex-col gap-3'>
          <Field orientation='horizontal'>
            <Button variant='default' className='flex-1' disabled={isPending}>
              {isPending && <LoaderCircle className='animate-spin' />}
              登录
            </Button>
          </Field>
          <Field orientation='horizontal'>
            <Link
              href='/forgot-password/email'
              className={`flex-1 ${buttonVariants({
                variant: 'secondary'
              })}`}
            >
              忘记密码
            </Link>
          </Field>
          <Field orientation='horizontal'>
            <Link
              href='/sign-up/email'
              className={`flex-1 ${buttonVariants({
                variant: 'secondary'
              })}`}
            >
              没有账号，去注册
            </Link>
          </Field>
        </CardFooter>
      </Card>
    </form>
  )
}
