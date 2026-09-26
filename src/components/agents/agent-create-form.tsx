'use client'

import * as React from 'react'
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
import { use, useTransition } from 'react'
import { toast } from 'sonner'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ChevronLeft, LoaderCircle, Save } from 'lucide-react'
import { createAgentAction, editAgentAction } from '@/modules/agents/actions'
import {
  CHAT_MODEL_OPTIONS,
  DEFAULT_CHAT_MODEL,
  resolveChatModel
} from '@/modules/agents/models/chat-models'
import {
  AgentCreateFormValues,
  agentCreateSchema,
  DEFAULT_AGENT_HISTORY_LIMIT,
  DEFAULT_AGENT_RETRIEVE_TOP_K,
  DEFAULT_AGENT_TEMPERATURE
} from '@/modules/agents/schemas'
import type { KnowledgeOptionDto } from '@/modules/knowledges/dto'
import type { PromptProfileOptionDto } from '@/modules/prompt-profiles/dto'
import { PromptProfileSelect } from './prompt-profile-select'
import { KnowledgeSelect } from './knowledge-select'

export type AgentFormData = {
  id: string
  name: string
  description: string | null
  status: AgentCreateFormValues['status']
  model: string | null
  temperature: number
  historyLimit: number
  retrieveTopK: number
  promptProfileId: string | null
  knowledgeId: string | null
}

interface AgentCreateFormProps {
  promptPromise: Promise<Array<PromptProfileOptionDto>>
  knowledgePromise: Promise<Array<KnowledgeOptionDto>>
  agent?: AgentFormData
}

const statusOptions = [
  { value: 'DRAFT', label: '草稿' },
  { value: 'ACTIVE', label: '启用中' },
  { value: 'DISABLED', label: '已停用' }
] as const

function toFormValues(agent?: AgentFormData): AgentCreateFormValues {
  if (!agent) {
    return {
      name: '',
      description: '',
      status: 'DRAFT',
      model: DEFAULT_CHAT_MODEL,
      temperature: DEFAULT_AGENT_TEMPERATURE,
      historyLimit: DEFAULT_AGENT_HISTORY_LIMIT,
      retrieveTopK: DEFAULT_AGENT_RETRIEVE_TOP_K,
      promptProfileId: undefined,
      knowledgeId: undefined
    }
  }

  return {
    name: agent.name,
    description: agent.description ?? '',
    status: agent.status,
    model: resolveChatModel(agent.model),
    temperature: agent.temperature,
    historyLimit: agent.historyLimit,
    retrieveTopK: agent.retrieveTopK,
    promptProfileId: agent.promptProfileId || undefined,
    knowledgeId: agent.knowledgeId || undefined
  }
}

export function AgentCreateForm({
  promptPromise,
  knowledgePromise,
  agent
}: AgentCreateFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const isEdit = Boolean(agent)
  use(promptPromise)
  use(knowledgePromise)

  const defaultValues = toFormValues(agent)

  const form = useForm<AgentCreateFormValues>({
    resolver: zodResolver(agentCreateSchema) as Resolver<AgentCreateFormValues>,
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
        value={field.value || null}
        onValueChange={value => field.onChange(value ?? field.value)}
        items={[...statusOptions]}
        disabled={isPending}
      >
        <SelectTrigger
          id={field.name}
          aria-invalid={fieldState.invalid}
          className='w-full'
        >
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
      <Select
        value={resolveChatModel(field.value)}
        onValueChange={value => field.onChange(value ?? field.value)}
        items={[...CHAT_MODEL_OPTIONS]}
      >
        <SelectTrigger
          id={field.name}
          aria-invalid={fieldState.invalid}
          className='w-full'
        >
          <SelectValue placeholder='请选择模型' />
        </SelectTrigger>
        <SelectContent>
          {CHAT_MODEL_OPTIONS.map(option => (
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

  const renderTemperatureInput = ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<AgentCreateFormValues, 'temperature'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<AgentCreateFormValues>
  }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>温度</FieldLabel>
      <Input
        id={field.name}
        type='number'
        min={0}
        max={2}
        step={0.1}
        aria-invalid={fieldState.invalid}
        defaultValue={field.value}
        onBlur={field.onBlur}
        name={field.name}
        ref={field.ref}
        onChange={event => field.onChange(event.target.valueAsNumber)}
      />
      <FieldDescription>0 最稳定，越大回答越发散</FieldDescription>
      {fieldState.invalid && fieldState.error && (
        <FieldError errors={[fieldState.error]} />
      )}
    </Field>
  )

  const renderHistoryLimitInput = ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<AgentCreateFormValues, 'historyLimit'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<AgentCreateFormValues>
  }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>历史条数</FieldLabel>
      <Input
        id={field.name}
        type='number'
        min={1}
        max={50}
        step={1}
        aria-invalid={fieldState.invalid}
        defaultValue={field.value}
        onBlur={field.onBlur}
        name={field.name}
        ref={field.ref}
        onChange={event => field.onChange(event.target.valueAsNumber)}
      />
      <FieldDescription>带入模型的最近消息数，含本次问题</FieldDescription>
      {fieldState.invalid && fieldState.error && (
        <FieldError errors={[fieldState.error]} />
      )}
    </Field>
  )

  const renderRetrieveTopKInput = ({
    field,
    fieldState
  }: {
    field: ControllerRenderProps<AgentCreateFormValues, 'retrieveTopK'>
    fieldState: ControllerFieldState
    formState: UseFormStateReturn<AgentCreateFormValues>
  }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor={field.name}>检索条数</FieldLabel>
      <Input
        id={field.name}
        type='number'
        min={1}
        max={20}
        step={1}
        aria-invalid={fieldState.invalid}
        defaultValue={field.value}
        onBlur={field.onBlur}
        name={field.name}
        ref={field.ref}
        onChange={event => field.onChange(event.target.valueAsNumber)}
      />
      <FieldDescription>从已就绪切片中取最相关的条数</FieldDescription>
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
        const result = agent
          ? await editAgentAction({ ...values, id: agent.id })
          : await createAgentAction(values)

        if (result.success) {
          toast.success('保存成功')
          router.push(agent ? `/agents/${agent.id}` : '/agents')
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
        title={isEdit ? '编辑助手' : '新建助手'}
        description={
          isEdit
            ? '更新助手基础信息，以及绑定的提示词与知识库'
            : '填写基础信息，并绑定提示词与知识库'
        }
        actionButtons={
          <div className='flex flex-row items-center gap-2'>
            <Button type='submit' form='agentCreateForm' disabled={isPending}>
              {isPending && <LoaderCircle className='animate-spin' />}
              <Save />
              保存
            </Button>
            <Link
              href={agent ? `/agents/${agent.id}` : '/agents'}
              className={buttonVariants({ variant: 'ghost' })}
            >
              <ChevronLeft />
              返回
            </Link>
          </div>
        }
      />
      <form id='agentCreateForm' onSubmit={form.handleSubmit(onSubmit)}>
        <PageStack>
          <PagePanel title='基础信息' description='定义助手身份和运行状态'>
            <FieldGroup>
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
              <Controller
                name='description'
                control={form.control}
                render={renderDescriptionInput}
              />
            </FieldGroup>
          </PagePanel>
          <PagePanel
            title='能力配置'
            description='绑定提示词模板和知识库，形成助手的初始工作上下文'
          >
            <FieldGroup>
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
              <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
                <Controller
                  name='temperature'
                  control={form.control}
                  render={renderTemperatureInput}
                />
                <Controller
                  name='historyLimit'
                  control={form.control}
                  render={renderHistoryLimitInput}
                />
                <Controller
                  name='retrieveTopK'
                  control={form.control}
                  render={renderRetrieveTopKInput}
                />
              </div>
              <Controller
                name='knowledgeId'
                control={form.control}
                render={renderKnowledgeSelect}
              />
            </FieldGroup>
          </PagePanel>
        </PageStack>
      </form>
    </PageStack>
  )
}
