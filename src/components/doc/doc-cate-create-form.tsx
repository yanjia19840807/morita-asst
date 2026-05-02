import React, { useImperativeHandle } from 'react'
import { DocCateCreateFormValues, docCateCreateSchema } from '@/schemas/doc'
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
import { createDocCateAction } from '@/app/(dashboard)/documents/actions'
import { toast } from 'sonner'
import { Input } from '../ui/input'

export interface DocCateCreateFormRef {
  submit: () => void
}

interface DocCateCreateFormProps {
  onClose: () => void
  onSuccess?: () => void
  startTransition: (callback: () => void) => void
  ref: React.Ref<DocCateCreateFormRef>
}

function DocCateCreateForm({
  onClose,
  onSuccess,
  startTransition,
  ref
}: DocCateCreateFormProps) {
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
          placeholder='请填写类目名称'
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
          onSuccess?.()
          onClose?.()
        } else {
          toast.error(result.error.message)
        }
      } catch (error) {
        console.error(error)
        toast.error('创建文档类目失败')
      }
    })
  }

  useImperativeHandle(ref, () => ({
    submit: () => {
      void form.handleSubmit(onSubmit)()
    }
  }))

  return (
    <form id='docCateForm'>
      <FieldGroup>
        <FieldSet>
          <Controller
            name='name'
            control={form.control}
            render={renderNameInput}
          />
        </FieldSet>
      </FieldGroup>
    </form>
  )
}

export default DocCateCreateForm
