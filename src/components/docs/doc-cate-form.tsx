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
import { cn } from '@/lib/utils'

function DocCateForm({ className }: { className: string }) {
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
      <Field data-invalid={fieldState.invalid} className='w-1/2'>
        <div className='flex flex-1 flex-row gap-3'>
          <FieldLabel htmlFor={field.name} className='whitespace-nowrap'>
            名称
          </FieldLabel>
          <Input
            id={field.name}
            type='text'
            placeholder='填写类目名称'
            aria-invalid={fieldState.invalid}
            {...field}
          />
          <Button type='submit' disabled={isPending}>
            {isPending && <LoaderCircle className='animate-spin' />}
            <Save />
            保存
          </Button>
        </div>
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
    <div className={cn(className)}>
      <form id='docCateForm' onSubmit={form.handleSubmit(onSubmit)}>
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
    </div>
  )
}

export default DocCateForm
