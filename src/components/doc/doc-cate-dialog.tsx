'use client'

import { LoaderCircle, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
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
  FieldLabel,
  FieldSet
} from '@/components/ui/field'
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  useForm,
  UseFormStateReturn
} from 'react-hook-form'
import { toast } from 'sonner'
import { Input } from '../ui/input'
import React, { useState, useTransition } from 'react'
import { DocCateCreateFormValues, docCateCreateSchema } from '@/schemas/doc'
import { zodResolver } from '@hookform/resolvers/zod'
import { createDocCateAction } from '@/app/(dashboard)/documents/actions'

export default function DocCateDialog({
  children
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const onSuccess = () => {
    setOpen(false)
    router.refresh()
  }

  const form = useForm({
    resolver: zodResolver(docCateCreateSchema),
    defaultValues: {
      name: ''
    }
  })

  const renderNameInput = function ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<DocCateCreateFormValues, 'name'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<DocCateCreateFormValues>
  }) {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>名称</FieldLabel>
        <Input
          id={field.name}
          type='text'
          placeholder='填写类目名称'
          aria-invalid={fieldState.invalid}
          {...field}
        />
        {fieldState.invalid && fieldState.error && (
          <FieldError errors={[fieldState.error]} />
        )}
      </Field>
    )
  }

  const onSubmit = async (values: DocCateCreateFormValues) => {
    startTransition(async () => {
      try {
        const { name } = values
        const result = await createDocCateAction({
          name
        })

        if (result.success) {
          toast.success('保存成功')
          onSuccess()
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
    <form id='docCateForm'>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增类目</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <FieldSet>
              <Controller
                name='name'
                control={form.control}
                render={renderNameInput}
              />
            </FieldSet>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button type='button' variant='secondary'>
                取消
              </Button>
            </DialogClose>
            <Button
              type='button'
              form='docCateForm'
              disabled={isPending}
              onClick={form.handleSubmit(onSubmit)}
            >
              {isPending && <LoaderCircle className='animate-spin' />}
              <Save />
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  )
}
