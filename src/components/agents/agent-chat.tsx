'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import {
  ChevronLeft,
  LoaderCircle,
  Plus,
  RotateCcw,
  Send,
  Square
} from 'lucide-react'
import { toast } from 'sonner'
import { PagePanel } from '@/components/layout/page-panel'
import { PageStack } from '@/components/layout/page-stack'
import PageTitle from '@/components/layout/page-title'
import { Button, buttonVariants } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { startAgentChatRoundAction } from '@/modules/agents/chat/actions'
import type {
  ChatConversationSummary,
  ChatMessageDto,
  ChatRun,
  ChatThreadDto
} from '@/modules/agents/chat/types'
import { chatModelLabel } from '@/modules/agents/models/chat-models'
import type { AgentStatusDto } from '@/modules/agents/dto'
import { cn } from '@/lib/utils'

type AgentChatProps = {
  agentId: string
  agentName: string
  status: AgentStatusDto
  model: string | null
  temperature: number
  historyLimit: number
  retrieveTopK: number
  knowledgeName: string | null
  promptName: string | null
}

const retrieveLabels = {
  skipped: '未检索',
  hit: '已命中',
  miss: '未命中',
  error: '检索失败'
} as const

function parseSseBuffer(buffer: string) {
  const parts = buffer.split('\n\n')
  return {
    rest: parts.pop() ?? '',
    events: parts
      .map(part =>
        part
          .split('\n')
          .find(line => line.startsWith('data: '))
          ?.slice(6)
      )
      .filter((line): line is string => Boolean(line))
      .flatMap(line => {
        try {
          return [JSON.parse(line) as Record<string, unknown>]
        } catch {
          return []
        }
      })
  }
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === 'AbortError'
}

function RunRecord({ run }: { run: ChatRun }) {
  const hitCount = run.retrieve.items.length
  const retrieveLabel =
    run.retrieve.status === 'hit'
      ? `命中 ${hitCount} 条`
      : retrieveLabels[run.retrieve.status]

  return (
    <div className='text-muted-foreground flex max-w-[80%] flex-col gap-2 text-xs'>
      {run.recorded ? (
        <>
          <p>
            {chatModelLabel(run.model)} · 温度 {run.temperature} · 历史{' '}
            {run.historyLimit} · 检索 {run.retrieveTopK} · {retrieveLabel}
          </p>
          <p>
            提示词 {run.promptName || '未绑定'} · 知识库{' '}
            {run.knowledgeName || '未绑定'}
          </p>
        </>
      ) : (
        <p>这条回复没有留下当时的配置 · {retrieveLabel}</p>
      )}
      {run.retrieve.reason ? <p>{run.retrieve.reason}</p> : null}
      {hitCount > 0 ? (
        <details className='flex flex-col gap-2'>
          <summary className='cursor-pointer'>查看命中切片</summary>
          <div className='mt-2 flex flex-col gap-3'>
            {run.retrieve.items.map(item => (
              <div key={item.chunkId} className='flex flex-col gap-1'>
                {run.knowledgeId ? (
                  <Link
                    href={`/knowledges/${run.knowledgeId}/chunks?searchValue=${encodeURIComponent(item.chunkId)}`}
                    className='text-foreground underline-offset-2 hover:underline'
                  >
                    {item.filename}
                  </Link>
                ) : (
                  <span className='text-foreground'>{item.filename}</span>
                )}
                <p className='whitespace-pre-wrap'>
                  {item.content || item.excerpt}
                </p>
              </div>
            ))}
          </div>
        </details>
      ) : null}
      {run.recorded ? (
        <details>
          <summary className='cursor-pointer'>当时的系统提示</summary>
          <p className='mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap'>
            {run.systemPrompt}
          </p>
        </details>
      ) : null}
    </div>
  )
}

export function AgentChat({
  agentId,
  agentName,
  status,
  model,
  temperature,
  historyLimit,
  retrieveTopK,
  knowledgeName,
  promptName
}: AgentChatProps) {
  const canChat = status === 'ACTIVE'
  const [conversations, setConversations] = useState<ChatConversationSummary[]>([])
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessageDto[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [starting, setStarting] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const loadRef = useRef(0)
  const localIdRef = useRef(0)

  function nextLocalId(prefix: string) {
    localIdRef.current += 1
    return `${prefix}-${localIdRef.current}`
  }

  async function loadThread(nextConversationId?: string) {
    const requestId = ++loadRef.current
    const query = nextConversationId
      ? `?conversationId=${encodeURIComponent(nextConversationId)}`
      : ''
    const response = await fetch(`/api/agents/${agentId}/chat${query}`)
    const payload = (await response.json()) as {
      success?: boolean
      data?: ChatThreadDto
      error?: string
    }

    if (!response.ok || !payload.success || !payload.data) {
      throw new Error(payload.error || '加载对话失败')
    }

    if (requestId !== loadRef.current) {
      return
    }

    setConversations(payload.data.conversations)
    setConversationId(payload.data.conversationId)
    setMessages(payload.data.messages)
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        await loadThread()
      } catch (error) {
        if (!cancelled) {
          toast.error(error instanceof Error ? error.message : '加载对话失败')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()

    return () => {
      cancelled = true
      abortRef.current?.abort()
    }
    // loadThread closes over agentId only; switching rounds calls it directly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages, sending])

  async function selectConversation(nextConversationId: string) {
    if (sending || nextConversationId === conversationId) {
      return
    }

    setLoading(true)
    try {
      await loadThread(nextConversationId)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '加载对话失败')
    } finally {
      setLoading(false)
    }
  }

  async function handleStartRound() {
    if (!canChat || sending || starting) {
      return
    }

    if (conversationId && messages.length === 0) {
      return
    }

    setStarting(true)
    try {
      const result = await startAgentChatRoundAction(agentId)
      if (!result.success) {
        toast.error(result.error.message)
        return
      }

      setConversations(current => [
        result.data,
        ...current.filter(item => item.id !== result.data.id)
      ])
      setConversationId(result.data.id)
      setMessages([])
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '新开一轮失败')
    } finally {
      setStarting(false)
    }
  }

  async function streamReply(
    activeId: string,
    body: { content?: string; retryOfMessageId?: string },
    streamId: string,
    localUserId: string
  ) {
    const controller = new AbortController()
    abortRef.current = controller
    setSending(true)

    try {
      const response = await fetch(`/api/agents/${agentId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: activeId, ...body }),
        signal: controller.signal
      })

      if (!response.ok || !response.body) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string
        } | null
        throw new Error(payload?.error || '发送失败')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const parsed = parseSseBuffer(buffer)
        buffer = parsed.rest

        for (const event of parsed.events) {
          if (event.type === 'start') {
            const savedUser = event.userMessage as ChatMessageDto | undefined
            const title = typeof event.title === 'string' ? event.title : null
            const nextId =
              typeof event.conversationId === 'string'
                ? event.conversationId
                : activeId

            if (savedUser) {
              setMessages(current =>
                current.map(message =>
                  message.id === localUserId ? savedUser : message
                )
              )
            }

            if (title) {
              setConversations(current =>
                current.map(item =>
                  item.id === nextId ? { ...item, title } : item
                )
              )
            }
          }

          if (event.type === 'delta' && typeof event.text === 'string') {
            const text = event.text
            setMessages(current =>
              current.map(message =>
                message.id === streamId
                  ? { ...message, content: `${message.content}${text}` }
                  : message
              )
            )
          }

          if (event.type === 'done' && event.message) {
            const saved = event.message as ChatMessageDto
            setMessages(current =>
              current.map(message => (message.id === streamId ? saved : message))
            )
          }

          if (event.type === 'error' && typeof event.message === 'string') {
            throw new Error(event.message)
          }
        }
      }
    } catch (error) {
      if (isAbortError(error)) {
        try {
          await loadThread(activeId)
        } catch (reloadError) {
          toast.error(
            reloadError instanceof Error ? reloadError.message : '加载对话失败'
          )
        }
        return
      }

      setMessages(current => current.filter(message => message.id !== streamId))
      toast.error(error instanceof Error ? error.message : '发送失败')
      try {
        await loadThread(activeId)
      } catch {
        // 失败提示已经给出，刷新失败时保留当前气泡。
      }
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null
      }
      setSending(false)
    }
  }

  async function handleSend() {
    const content = input.trim()
    if (!canChat || sending || !content) {
      return
    }

    let activeId = conversationId
    if (!activeId) {
      setStarting(true)
      try {
        const result = await startAgentChatRoundAction(agentId)
        if (!result.success) {
          toast.error(result.error.message)
          return
        }

        activeId = result.data.id
        setConversations(current => [
          result.data,
          ...current.filter(item => item.id !== result.data.id)
        ])
        setConversationId(result.data.id)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : '新开一轮失败')
        return
      } finally {
        setStarting(false)
      }
    }

    const localUserId = nextLocalId('local-user')
    const streamId = nextLocalId('local-assistant')
    const userMessage: ChatMessageDto = {
      id: localUserId,
      role: 'USER',
      content,
      run: null,
      createdAt: new Date().toISOString()
    }

    setInput('')
    setMessages(current => [
      ...current,
      userMessage,
      {
        id: streamId,
        role: 'ASSISTANT',
        content: '',
        run: null,
        createdAt: new Date().toISOString()
      }
    ])
    await streamReply(activeId, { content }, streamId, localUserId)
  }

  async function handleRetry(message: ChatMessageDto) {
    if (!canChat || sending || !conversationId) {
      return
    }

    const streamId = nextLocalId('local-assistant')
    setMessages(current => {
      const index = current.findIndex(item => item.id === message.id)
      const kept = index >= 0 ? current.slice(0, index + 1) : current
      return [
        ...kept,
        {
          id: streamId,
          role: 'ASSISTANT',
          content: '',
          run: null,
          createdAt: new Date().toISOString()
        }
      ]
    })
    await streamReply(
      conversationId,
      { retryOfMessageId: message.id },
      streamId,
      message.id
    )
  }

  function handleStop() {
    abortRef.current?.abort()
  }

  const lastUserMessageId = [...messages]
    .reverse()
    .find(message => message.role === 'USER')?.id
  const currentRoundIsEmpty = Boolean(conversationId) && messages.length === 0

  return (
    <PageStack>
      <PageTitle
        title={agentName}
        description='试聊，验证提示词、模型和知识库'
        actionButtons={
          <div className='flex flex-row items-center gap-2'>
            <Button
              type='button'
              variant='outline'
              disabled={!canChat || sending || starting || currentRoundIsEmpty}
              onClick={() => void handleStartRound()}
            >
              {starting ? <LoaderCircle className='animate-spin' /> : <Plus />}
              新开一轮
            </Button>
            <Link
              href={`/agents/${agentId}`}
              className={buttonVariants({ variant: 'ghost' })}
            >
              <ChevronLeft />
              返回
            </Link>
          </div>
        }
      />

      <div className='text-muted-foreground text-sm'>
        下一轮使用 {chatModelLabel(model)} · 温度 {temperature} · 历史{' '}
        {historyLimit} · 检索 {retrieveTopK} · 提示词 {promptName || '未绑定'} ·
        知识库 {knowledgeName || '未绑定'}
      </div>

      {!canChat ? (
        <p className='text-muted-foreground text-sm'>
          仅启用中的助手可以试聊，请先将状态改为启用中。
        </p>
      ) : null}

      {conversations.length > 0 ? (
        <div className='flex gap-2 overflow-x-auto'>
          {conversations.map(item => (
            <Button
              key={item.id}
              type='button'
              size='sm'
              variant={item.id === conversationId ? 'secondary' : 'ghost'}
              disabled={sending || loading}
              onClick={() => void selectConversation(item.id)}
            >
              <span className='max-w-40 truncate'>{item.title}</span>
              <span className='text-muted-foreground'>
                {format(new Date(item.updatedAt), 'MM-dd HH:mm')}
              </span>
            </Button>
          ))}
        </div>
      ) : null}

      <PagePanel>
        <div className='flex min-h-0 flex-1 flex-col gap-4'>
        <div className='min-h-0 flex-1 overflow-y-auto'>
          {loading ? (
            <p className='text-muted-foreground text-sm'>正在加载对话…</p>
          ) : messages.length === 0 ? (
            <p className='text-muted-foreground text-sm'>
              {conversationId
                ? '这一轮还没有消息，输入问题开始试聊。'
                : '还没有试聊，输入问题会新开一轮。'}
            </p>
          ) : (
            <div className='flex flex-col gap-4'>
              {messages.map(message => (
                <div
                  key={message.id}
                  className={cn(
                    'flex flex-col gap-2',
                    message.role === 'USER' ? 'items-end' : 'items-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[80%] rounded-md px-3 py-2 text-sm whitespace-pre-wrap',
                      message.role === 'USER'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    {message.content || (sending ? '正在生成…' : '')}
                  </div>
                  {message.role === 'ASSISTANT' && message.run ? (
                    <RunRecord run={message.run} />
                  ) : null}
                  {message.role === 'USER' &&
                  message.id === lastUserMessageId &&
                  !sending &&
                  canChat ? (
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => void handleRetry(message)}
                    >
                      <RotateCcw />
                      再试一次
                    </Button>
                  ) : null}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <form
          className='flex items-end gap-2'
          onSubmit={event => {
            event.preventDefault()
            if (sending) {
              handleStop()
              return
            }
            void handleSend()
          }}
        >
          <Textarea
            value={input}
            disabled={!canChat || sending}
            placeholder={canChat ? '输入试聊问题' : '助手未启用，无法发送'}
            rows={2}
            onChange={event => setInput(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                if (!sending) {
                  void handleSend()
                }
              }
            }}
          />
          {sending ? (
            <Button type='button' variant='outline' onClick={handleStop}>
              <Square />
              停止
            </Button>
          ) : (
            <Button type='submit' disabled={!canChat || !input.trim() || starting}>
              {starting ? <LoaderCircle className='animate-spin' /> : <Send />}
              发送
            </Button>
          )}
        </form>
        </div>
      </PagePanel>
    </PageStack>
  )
}
