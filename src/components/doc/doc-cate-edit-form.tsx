import React, { useEffect, useImperativeHandle } from 'react'
import { DocCateEditFormValues, docCateEditSchema } from '@/schemas/doc'
import type { DocumentCategory } from '@/generated/prisma/client'
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
import { editDocCateAction } from '@/app/(dashboard)/documents/actions'
import { toast } from 'sonner'
import { Input } from '../ui/input'

export interface DocCateEditFormRef {
  submit: () => void
}

interface DocCateEditFormProps {
  data?: DocCateEditFormValues
  onClose: () => void
  startTransition: (callback: () => void) => void
  onCreated?: (cate: DocumentCategory) => void
  ref: React.Ref<DocCateEditFormRef>
}

function DocCateForm({
  data,
  onClose,
  startTransition,
  ref
}: DocCateEditFormProps) {
  const form = useForm({
    resolver: zodResolver(docCateEditSchema),
    defaultValues: {
      id: '',
      name: ''
    }
  })

  const renderNameInput = function ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<DocCateEditFormValues, 'name'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<DocCateEditFormValues>
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

  const onSubmit = async (values: DocCateEditFormValues) => {
    startTransition(async () => {
      try {
        const { id, name } = values
        const result = await editDocCateAction({
          id,
          name
        })
        if (result.success) {
          toast.success('保存成功')
          onClose?.()
        } else {
          toast.error(result.error.message)
        }
      } catch (error) {
        console.error(error)
        toast.error('编辑文档类目失败')
      }
    })
  }

  useEffect(() => {
    if (data) {
      form.reset(data)
    }
  }, [form, data])

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

export default DocCateForm
