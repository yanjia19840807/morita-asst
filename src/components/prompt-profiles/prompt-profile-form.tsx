'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  Resolver,
  useForm,
  UseFormStateReturn
} from 'react-hook-form'
import { useEffect, useTransition } from 'react'
import { toast } from 'sonner'
import type z from 'zod'
import PageTitle from '@/components/layout/page-title'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { PromptProfileFormValues } from '@/schemas/prompt-profile'
import { ChevronLeft, LoaderCircle, Save } from 'lucide-react'
import { ResponseResult } from '@/lib/api/shared/response'
import MDEditor from '@/components/md-editor'

type PromptProfileFormInput = PromptProfileFormValues & {
  id?: string
}

interface PromptProfileFormProps {
  title: string
  formId: string
  defaultValues: PromptProfileFormInput
  schema: z.ZodType<PromptProfileFormInput>
  onSubmitAction: (values: PromptProfileFormInput) => Promise<ResponseResult>
}

export function PromptProfileForm({
  title,
  formId,
  defaultValues,
  schema,
  onSubmitAction
}: PromptProfileFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const form = useForm<PromptProfileFormInput>({
    resolver: zodResolver(schema as never) as Resolver<PromptProfileFormInput>,
    defaultValues
  })

  useEffect(() => {
    form.reset(defaultValues)
  }, [defaultValues, form])

  const renderNameInput = ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<PromptProfileFormInput, 'name'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<PromptProfileFormInput>
  }) => {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>名称</FieldLabel>
        <Input
          id={field.name}
          placeholder='填写提示词名称'
          aria-invalid={fieldState.invalid}
          {...field}
        />
        <FieldDescription>用于在助手配置里识别这套提示词模板</FieldDescription>
        {fieldState.invalid && fieldState.error && (
          <FieldError errors={[fieldState.error]} />
        )}
      </Field>
    )
  }

  const renderSystemPromptInput = ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<PromptProfileFormInput, 'systemPrompt'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<PromptProfileFormInput>
  }) => {
    return (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor={field.name}>提示词</FieldLabel>
        <MDEditor
          value={field.value}
          fieldChange={field.onChange}
          invalid={fieldState.invalid}
        />
        <FieldDescription>
          后续模型调用将使用这段内容作为系统提示词
        </FieldDescription>
        {fieldState.invalid && fieldState.error && (
          <FieldError errors={[fieldState.error]} />
        )}
      </Field>
    )
  }

  const onSubmit = (values: PromptProfileFormInput) => {
    startTransition(async () => {
      try {
        const result = await onSubmitAction(values)

        if (result.success) {
          toast.success('保存成功')
          router.push('/prompt-profiles')
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
    <div className='flex min-h-0 flex-1 flex-col gap-3'>
      <PageTitle
        actionButtons={
          <div className='flex flex-row items-center gap-2'>
            <Button type='submit' form={formId} disabled={isPending}>
              {isPending && <LoaderCircle className='animate-spin' />}
              <Save />
              保存
            </Button>
            <Link
              href='/prompt-profiles'
              className={buttonVariants({
                variant: 'ghost'
              })}
            >
              <ChevronLeft />
              返回
            </Link>
          </div>
        }
      >
        {title}
      </PageTitle>
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
        {'id' in defaultValues && (
          <input type='hidden' {...form.register('id')} />
        )}
        <Card className='w-full'>
          <CardContent>
            <FieldGroup>
              <FieldSet>
                <Controller
                  name='name'
                  control={form.control}
                  render={renderNameInput}
                />
                <Controller
                  name='systemPrompt'
                  control={form.control}
                  render={renderSystemPromptInput}
                />
              </FieldSet>
            </FieldGroup>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
