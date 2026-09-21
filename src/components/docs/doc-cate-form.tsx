'use client'

import { useTransition } from 'react'
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
import { zodResolver } from '@hookform/resolvers/zod'
import {
  DocCateCreateFormValues,
  docCateCreateFormSchema
} from '@/modules/docs/schemas'
import { createDocCateAction } from '@/modules/docs/actions'
import { toast } from 'sonner'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { LoaderCircle, Save } from 'lucide-react'

export default function DocCateForm({
  onCancel,
  onCreated
}: {
  onCancel: () => void
  onCreated: () => void
}) {
  const [isPending, startTransition] = useTransition()

  const form = useForm({
    resolver: zodResolver(docCateCreateFormSchema),
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
        <FieldLabel htmlFor={field.name}>类目名称</FieldLabel>
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

  const onSubmit = (values: DocCateCreateFormValues) => {
    startTransition(async () => {
      try {
        const result = await createDocCateAction({
          name: values.name
        })

        if (result.success) {
          toast.success('类目已创建')
          form.reset({ name: '' })
          onCreated()
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
    <form onSubmit={form.handleSubmit(onSubmit)} className='flex flex-col gap-4'>
      <FieldGroup>
        <FieldSet>
          <Controller
            name='name'
            control={form.control}
            render={renderNameInput}
          />
        </FieldSet>
      </FieldGroup>
      <div className='flex items-center gap-2'>
        <Button type='submit' disabled={isPending}>
          {isPending && <LoaderCircle className='animate-spin' />}
          <Save />
          保存
        </Button>
        <Button
          type='button'
          variant='ghost'
          disabled={isPending}
          onClick={onCancel}
        >
          取消
        </Button>
      </div>
    </form>
  )
}
