'use client'

import { EmailSignUpFormValues, emailSignUpSchema } from '@/schemas/auth'
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
import { LoaderCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  useForm,
  UseFormStateReturn
} from 'react-hook-form'
import { toast } from 'sonner'
import { signUpEmailAction } from '@/app/(auth)/actions'
import { authClient } from '@/lib/auth-client'

export default function EmailSignUpForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { refetch: refetchSession } = authClient.useSession()

  const form = useForm({
    resolver: zodResolver(emailSignUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  })

  const renderNameInput = function ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<EmailSignUpFormValues, 'name'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<EmailSignUpFormValues>
  }) {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>用户名</FieldLabel>
        <Input
          id='name'
          aria-invalid={fieldState.invalid}
          placeholder='用户名: 3-30个字符'
          {...field}
        />
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
    field: ControllerRenderProps<EmailSignUpFormValues, 'email'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<EmailSignUpFormValues>
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
    field: ControllerRenderProps<EmailSignUpFormValues, 'password'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<EmailSignUpFormValues>
  }) {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>密码</FieldLabel>
        <Input
          id='password'
          type='password'
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

  const renderConfirmPasswordInput = function ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<EmailSignUpFormValues, 'confirmPassword'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<EmailSignUpFormValues>
  }) {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>确认密码</FieldLabel>
        <Input
          id='confirmPassword'
          type='password'
          aria-invalid={fieldState.invalid}
          placeholder='请再次输入密码'
          {...field}
        />
        {fieldState.invalid && fieldState.error && (
          <FieldError errors={[fieldState.error]} />
        )}
      </Field>
    )
  }

  const onSubmit = async (data: EmailSignUpFormValues) => {
    startTransition(async () => {
      const result = await signUpEmailAction(data)
      if (result.success) {
        await refetchSession()
        toast.success('注册成功')
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
          <CardTitle>用户注册</CardTitle>
          <CardDescription>创建一个新账号</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Controller
              name='name'
              control={form.control}
              render={renderNameInput}
            />
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
            <Controller
              name='confirmPassword'
              control={form.control}
              render={renderConfirmPasswordInput}
            />
          </FieldGroup>
        </CardContent>
        <CardFooter className='flex flex-col gap-3'>
          <Field orientation='horizontal'>
            <Button variant='default' className='flex-1' disabled={isPending}>
              {isPending && <LoaderCircle className='animate-spin' />}
              注册
            </Button>
          </Field>
          <Field orientation='horizontal'>
            <Link
              href='/sign-in/email'
              className={`flex-1 ${buttonVariants({
                variant: 'secondary'
              })}`}
            >
              已有账号，去登录
            </Link>
          </Field>
        </CardFooter>
      </Card>
    </form>
  )
}
