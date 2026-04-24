'use client'

import { DocumentCreateSchema } from '@/schemas/document'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useTransition } from 'react'
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  useForm,
  UseFormStateReturn
} from 'react-hook-form'
import { toast } from 'sonner'
import z from 'zod'
import PageActionBar from '../page-action-bar'
import { Button } from '../ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '../ui/card'
import {
  FieldGroup,
  FieldSet,
  FieldSeparator,
  Field,
  FieldError,
  FieldLabel
} from '../ui/field'
import AvatarInput from '../avatar-input'
import FileInput from '../file-input'

export default function DocumentCreateForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  type FormValues = z.input<typeof DocumentCreateSchema>
  type SubmitValues = z.output<typeof DocumentCreateSchema>

  const form = useForm<FormValues, undefined, SubmitValues>({
    resolver: zodResolver(DocumentCreateSchema),
    defaultValues: {
      categoryId: undefined,
      files: []
    }
  })

  const renderFileInput = ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<FormValues, 'files'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<FormValues>
  }) => {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>本地上传</FieldLabel>
        <FileInput {...field} {...fieldState} disabled={isPending} />
        {fieldState.invalid && fieldState.error && (
          <FieldError
            errors={
              fieldState.error instanceof Array
                ? fieldState.error
                : [fieldState.error]
            }
          />
        )}
      </Field>
    )
  }

  const handleSubmit = (values: SubmitValues) => {}

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <PageActionBar>
        <Button type='submit'>
          <Save />
          保存
        </Button>
        <Button type='button' variant='ghost' onClick={() => router.back()}>
          返回
        </Button>
      </PageActionBar>
      <Card>
        <CardHeader>
          <CardTitle>导入文件</CardTitle>
          <CardDescription>导入类目 森田疗法</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <FieldSet>
              <Controller
                name='files'
                control={form.control}
                render={renderFileInput}
              />
            </FieldSet>
          </FieldGroup>
        </CardContent>
      </Card>
    </form>
  )
}
