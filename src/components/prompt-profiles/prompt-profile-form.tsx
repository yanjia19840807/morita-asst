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
import { PagePanel } from '@/components/layout/page-panel'
import { PageStack } from '@/components/layout/page-stack'
import PageTitle from '@/components/layout/page-title'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ChevronLeft, LoaderCircle, Save } from 'lucide-react'
import type { ResponseResult } from '@/lib/api/response'
import MDEditor from '@/components/md-editor'
import { PromptProfileFormValues } from '@/modules/prompt-profiles/schemas'

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
    <PageStack>
      <PageTitle
        title={title}
        description='编写助手使用的系统提示词'
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
      />
      <form id={formId} onSubmit={form.handleSubmit(onSubmit)}>
        {'id' in defaultValues && (
          <input type='hidden' {...form.register('id')} />
        )}
        <PagePanel>
          <FieldGroup>
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
          </FieldGroup>
        </PagePanel>
      </form>
    </PageStack>
  )
}
