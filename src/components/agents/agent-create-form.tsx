'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Controller,
  ControllerFieldState,
  ControllerRenderProps,
  useForm,
  UseFormStateReturn
} from 'react-hook-form'
import { use, useTransition } from 'react'
import { toast } from 'sonner'
import PageTitle from '@/components/layout/page-title'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createAgentAction } from '@/actions/agents/actions'
import { AgentCreateFormValues, agentCreateSchema } from '@/schemas/agent'
import { ChevronLeft, LoaderCircle, Save } from 'lucide-react'
import { PromptProfileOption } from '@/dal/prompt-profiles'
import { KnowledgeOption } from '@/dal/knowledges'
import { PromptProfileSelect } from './prompt-profile-select'
import { KnowledgeSelect } from './knowledge-select'

interface AgentCreateFormProps {
  promptPromise: Promise<Array<PromptProfileOption>>
  knowledgePromise: Promise<Array<KnowledgeOption>>
}

const statusOptions = [
  { value: 'DRAFT', label: '草稿' },
  { value: 'ACTIVE', label: '启用中' },
  { value: 'DISABLED', label: '已停用' }
] as const

export function AgentCreateForm({
  promptPromise,
  knowledgePromise
}: AgentCreateFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  use(promptPromise)
  use(knowledgePromise)

  const defaultValues: AgentCreateFormValues = {
    name: '',
    description: '',
    status: 'DRAFT',
    model: '',
    promptProfileId: undefined,
    knowledgeId: undefined
  }

  const form = useForm<AgentCreateFormValues>({
    resolver: zodResolver(agentCreateSchema),
    defaultValues
  })

  const renderNameInput = ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<AgentCreateFormValues, 'name'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<AgentCreateFormValues>
  }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>名称</FieldLabel>
      <Input
        id={field.name}
        placeholder='填写助手名称'
        aria-invalid={fieldState.invalid}
        {...field}
      />
      {fieldState.invalid && fieldState.error && (
        <FieldError errors={[fieldState.error]} />
      )}
    </Field>
  )

  const renderDescriptionInput = ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<AgentCreateFormValues, 'description'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<AgentCreateFormValues>
  }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>描述</FieldLabel>
      <Textarea
        id={field.name}
        placeholder='简要说明这个助手的用途和适用场景'
        aria-invalid={fieldState.invalid}
        value={field.value ?? ''}
        onBlur={field.onBlur}
        name={field.name}
        ref={field.ref}
        onChange={event => field.onChange(event.target.value)}
        rows={3}
      />
      {fieldState.invalid && fieldState.error && (
        <FieldError errors={[fieldState.error]} />
      )}
    </Field>
  )

  const renderStatusInput = ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<AgentCreateFormValues, 'status'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<AgentCreateFormValues>
  }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>状态</FieldLabel>
      <Select
        value={field.value}
        onValueChange={field.onChange}
        disabled={isPending}
      >
        <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
          <SelectValue placeholder='请选择状态' />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {fieldState.invalid && fieldState.error && (
        <FieldError errors={[fieldState.error]} />
      )}
    </Field>
  )

  const renderModelInput = ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<AgentCreateFormValues, 'model'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<AgentCreateFormValues>
  }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>模型</FieldLabel>
      <Input
        id={field.name}
        placeholder='例如：gpt-4.1-mini'
        aria-invalid={fieldState.invalid}
        value={field.value ?? ''}
        onBlur={field.onBlur}
        name={field.name}
        ref={field.ref}
        onChange={event => field.onChange(event.target.value)}
      />
      {fieldState.invalid && fieldState.error && (
        <FieldError errors={[fieldState.error]} />
      )}
    </Field>
  )

  const renderPromptProfileSelect = ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<AgentCreateFormValues, 'promptProfileId'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<AgentCreateFormValues>
  }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>提示词模板</FieldLabel>
      <PromptProfileSelect
        promptPromise={promptPromise}
        value={field.value}
        onChange={field.onChange}
        onBlur={field.onBlur}
        disabled={isPending}
        invalid={fieldState.invalid}
      />
      {fieldState.invalid && fieldState.error && (
        <FieldError errors={[fieldState.error]} />
      )}
    </Field>
  )

  const renderKnowledgeSelect = ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<AgentCreateFormValues, 'knowledgeId'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<AgentCreateFormValues>
  }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>关联知识库</FieldLabel>
      <KnowledgeSelect
        knowledgePromise={knowledgePromise}
        value={field.value}
        onChange={field.onChange}
        onBlur={field.onBlur}
        disabled={isPending}
        invalid={fieldState.invalid}
      />
      <FieldDescription>可选，每个助手仅可绑定一个知识库</FieldDescription>
      {fieldState.invalid && fieldState.error && (
        <FieldError errors={[fieldState.error]} />
      )}
    </Field>
  )

  const onSubmit = (values: AgentCreateFormValues) => {
    startTransition(async () => {
      try {
        const result = await createAgentAction(values)

        if (result.success) {
          toast.success('保存成功')
          router.push('/agents')
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
            <Button type='submit' form='agentCreateForm' disabled={isPending}>
              {isPending && <LoaderCircle className='animate-spin' />}
              <Save />
              保存
            </Button>
            <Link
              href='/agents'
              className={buttonVariants({ variant: 'ghost' })}
            >
              <ChevronLeft />
              返回
            </Link>
          </div>
        }
      >
        新建助手
      </PageTitle>
      <form id='agentCreateForm' onSubmit={form.handleSubmit(onSubmit)}>
        <Card className='w-full'>
          <CardHeader>
            <CardTitle>基础信息</CardTitle>
            <CardDescription>定义助手身份和运行状态</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <FieldSet>
                <div className='flex flex-col gap-6 md:flex-row'>
                  <div className='flex-1'>
                    <Controller
                      name='name'
                      control={form.control}
                      render={renderNameInput}
                    />
                  </div>
                  <div className='flex-1'>
                    <Controller
                      name='status'
                      control={form.control}
                      render={renderStatusInput}
                    />
                  </div>
                </div>
                <div>
                  <Controller
                    name='description'
                    control={form.control}
                    render={renderDescriptionInput}
                  />
                </div>
              </FieldSet>
            </FieldGroup>
          </CardContent>
        </Card>
        <Card className='mt-4 w-full'>
          <CardHeader>
            <CardTitle>能力配置</CardTitle>
            <CardDescription>
              绑定提示词模板和知识库，形成助手的初始工作上下文
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <FieldSet>
                <div className='flex flex-col gap-6 md:flex-row'>
                  <div className='flex-1'>
                    <Controller
                      name='model'
                      control={form.control}
                      render={renderModelInput}
                    />
                  </div>
                  <div className='flex-1'>
                    <Controller
                      name='promptProfileId'
                      control={form.control}
                      render={renderPromptProfileSelect}
                    />
                  </div>
                </div>
                <div>
                  <Controller
                    name='knowledgeId'
                    control={form.control}
                    render={renderKnowledgeSelect}
                  />
                </div>
              </FieldSet>
            </FieldGroup>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
