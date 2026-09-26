'use client'

import { useEffect, useTransition } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { UserSection } from '@/components/auth/user-section'
import {
  Field,
  FieldError,
  FieldLabel
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { setUserPasswordAction } from '@/modules/auth/actions'
import {
  adminSetPasswordSchema,
  type AdminSetPasswordFormValues
} from '@/modules/auth/schemas'

const formId = 'userSecurityForm'

export function UserSecurityForm({ userId }: { userId: string }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const form = useForm<AdminSetPasswordFormValues>({
    resolver: zodResolver(adminSetPasswordSchema),
    defaultValues: {
      id: userId,
      password: '',
      confirmPassword: ''
    }
  })

  useEffect(() => {
    form.reset({
      id: userId,
      password: '',
      confirmPassword: ''
    })
  }, [form, userId])

  const onSubmit = (values: AdminSetPasswordFormValues) => {
    startTransition(async () => {
      try {
        const result = await setUserPasswordAction(values)

        if (result.success) {
          toast.success('密码已更新')
          form.reset({
            id: userId,
            password: '',
            confirmPassword: ''
          })
          router.refresh()
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
    <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
      <input type='hidden' {...form.register('id')} />
      <UserSection>
        <Controller
          name='password'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>新密码</FieldLabel>
              <Input
                id={field.name}
                type='password'
                placeholder='密码: 8-30个字符'
                aria-invalid={fieldState.invalid}
                value={field.value}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
                disabled={isPending}
                onChange={event => field.onChange(event.target.value)}
              />
              {fieldState.invalid && fieldState.error ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />
        <Controller
          name='confirmPassword'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>确认密码</FieldLabel>
              <Input
                id={field.name}
                type='password'
                placeholder='再次输入新密码'
                aria-invalid={fieldState.invalid}
                value={field.value}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
                disabled={isPending}
                onChange={event => field.onChange(event.target.value)}
              />
              {fieldState.invalid && fieldState.error ? (
                <FieldError errors={[fieldState.error]} />
              ) : null}
            </Field>
          )}
        />
      </UserSection>
    </form>
  )
}
