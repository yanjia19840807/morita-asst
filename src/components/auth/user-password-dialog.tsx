'use client'

import { useEffect, useState, useTransition } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { KeyRound, LoaderCircle, Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { setUserPasswordAction } from '@/modules/auth/actions'
import {
  adminSetPasswordSchema,
  type AdminSetPasswordFormValues
} from '@/modules/auth/schemas'

const formId = 'userPasswordForm'

export function UserPasswordDialog({
  userId,
  triggerVariant = 'outline'
}: {
  userId: string
  triggerVariant?: 'outline' | 'ghost'
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
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
    if (!open) {
      return
    }

    form.reset({
      id: userId,
      password: '',
      confirmPassword: ''
    })
  }, [form, open, userId])

  const onSubmit = (values: AdminSetPasswordFormValues) => {
    startTransition(async () => {
      try {
        const result = await setUserPasswordAction(values)

        if (result.success) {
          toast.success('密码已更新')
          setOpen(false)
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button type='button' variant={triggerVariant} />}
      >
        <KeyRound />
        修改密码
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>修改密码</DialogTitle>
          <DialogDescription>设置该账号的新登录密码</DialogDescription>
        </DialogHeader>
        <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
          <input type='hidden' {...form.register('id')} />
          <FieldGroup>
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
                    onChange={event => field.onChange(event.target.value)}
                  />
                  {fieldState.invalid && fieldState.error ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
        <DialogFooter>
          <DialogClose render={<Button type='button' variant='secondary' />}>
            取消
          </DialogClose>
          <Button type='submit' form={formId} disabled={isPending}>
            {isPending ? <LoaderCircle className='animate-spin' /> : null}
            <Save />
            保存
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
