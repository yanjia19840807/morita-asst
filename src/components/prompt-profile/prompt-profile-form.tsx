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
import PageTitle from '@/components/page-title'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PromptProfileFormValues } from '@/schemas/prompt-profile'
import { ChevronLeft, LoaderCircle, Save } from 'lucide-react'
import { ResponseResult } from '@/lib/api/response'

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
        <FieldDescription>
          用于在助手配置里识别这套提示词模板。
        </FieldDescription>
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
        <FieldLabel htmlFor={field.name}>提示词正文</FieldLabel>
        <Textarea
          id={field.name}
          placeholder='填写要直接传给模型的提示词内容，下一步可替换为所见即所得 Markdown 编辑器'
          aria-invalid={fieldState.invalid}
          value={field.value}
          onBlur={field.onBlur}
          name={field.name}
          ref={field.ref}
          onChange={event => field.onChange(event.target.value)}
          rows={12}
          className='min-h-48'
        />
        <FieldDescription>
          直接保存最终提示词原文，后续模型调用将直接使用这段内容。
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
    <div>
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
          <CardHeader>
            <CardTitle>提示词内容</CardTitle>
            <CardDescription>
              填写提示词模板名称和最终提示词原文，后续会切换成所见即所得
              Markdown 编辑器。
            </CardDescription>
          </CardHeader>
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
