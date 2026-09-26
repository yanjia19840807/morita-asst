'use client'

import { useEffect, useTransition } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, type Resolver, useForm } from 'react-hook-form'
import { LoaderCircle, Save } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field'
import { Textarea } from '@/components/ui/textarea'
import { userIssueSchema, type UserIssueValues } from '@/modules/profiles/schemas'
import { ProfileIssueTagsCombobox } from './profile-issue-tags-combobox'

const formId = 'userIssueForm'

export function UserIssueDialog({
  open,
  onOpenChange,
  issue,
  nextPriority,
  onSubmit
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  issue?: UserIssueValues | null
  nextPriority: number
  onSubmit: (values: UserIssueValues) => Promise<void>
}) {
  const [isPending, startTransition] = useTransition()
  const isEditing = Boolean(issue?.id || issue?.description)
  const form = useForm<UserIssueValues>({
    resolver: zodResolver(userIssueSchema) as Resolver<UserIssueValues>,
    defaultValues: {
      id: issue?.id,
      priority: issue?.priority ?? nextPriority,
      tags: issue?.tags ?? [],
      description: issue?.description ?? ''
    }
  })

  useEffect(() => {
    if (!open) {
      return
    }

    form.reset({
      id: issue?.id,
      priority: issue?.priority ?? nextPriority,
      tags: issue?.tags ?? [],
      description: issue?.description ?? ''
    })
  }, [form, issue, nextPriority, open])

  const handleSubmit = (values: UserIssueValues) => {
    startTransition(async () => {
      try {
        await onSubmit(values)
        onOpenChange(false)
      } catch (error) {
        console.error(error)
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? '编辑问题' : '添加问题'}</DialogTitle>
          <DialogDescription>
            填写当前主要困扰的标签和具体情境
          </DialogDescription>
        </DialogHeader>
        <form id={formId} onSubmit={form.handleSubmit(handleSubmit)}>
          <input type='hidden' {...form.register('priority')} />
          <FieldGroup>
            <Controller
              name='tags'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>标签</FieldLabel>
                  <ProfileIssueTagsCombobox
                    value={Array.isArray(field.value) ? field.value : []}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    disabled={isPending}
                    invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && fieldState.error ? (
                    <FieldError errors={[fieldState.error]} />
                  ) : null}
                </Field>
              )}
            />
            <Controller
              name='description'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>问题描述</FieldLabel>
                  <Textarea
                    id={field.name}
                    placeholder='描述当前主要困扰、出现方式和具体情境'
                    aria-invalid={fieldState.invalid}
                    rows={4}
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
