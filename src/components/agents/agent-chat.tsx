'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Eraser, LoaderCircle, Send } from 'lucide-react'
import { toast } from 'sonner'
import PageTitle from '@/components/layout/page-title'
import { Button, buttonVariants } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { clearAgentChatAction } from '@/modules/agents/chat/actions'
import type { ChatMessageDto, ChatThreadDto } from '@/modules/agents/chat/types'
import type { AgentStatusDto } from '@/modules/agents/dto'
import { cn } from '@/lib/utils'

type AgentChatProps = {
  agentId: string
  agentName: string
  status: AgentStatusDto
  knowledgeName: string | null
  promptName: string | null
}

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

export function AgentChat({
  agentId,
  agentName,
  status,
  knowledgeName,
  promptName
}: AgentChatProps) {
  const canChat = status === 'ACTIVE'
  const [messages, setMessages] = useState<ChatMessageDto[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [clearing, setClearing] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false

    async function loadThread() {
      try {
        const response = await fetch(`/api/agents/${agentId}/chat`)
        const payload = (await response.json()) as {
          success?: boolean
          data?: ChatThreadDto
          error?: string
        }

        if (!response.ok || !payload.success || !payload.data) {
          throw new Error(payload.error || '加载对话失败')
        }

        if (!cancelled) {
          setMessages(payload.data.messages)
        }
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

    void loadThread()

    return () => {
      cancelled = true
    }
  }, [agentId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  }, [messages, sending])

  async function handleClear() {
    setClearing(true)
    try {
      const result = await clearAgentChatAction(agentId)
      if (!result.success) {
        toast.error(result.error.message)
        return
      }

      setMessages([])
      toast.success('对话已清空')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '清空失败')
    } finally {
      setClearing(false)
    }
  }

  async function handleSend() {
    const content = input.trim()
    if (!canChat || sending || !content) {
      return
    }

    const userMessage: ChatMessageDto = {
      id: `local-user-${Date.now()}`,
      role: 'USER',
      content,
      citations: null,
      knowledgeMissed: false,
      retrieveError: null,
      createdAt: new Date().toISOString()
    }
    const streamId = `local-assistant-${Date.now()}`

    setInput('')
    setSending(true)
    setMessages(current => [
      ...current,
      userMessage,
      {
        id: streamId,
        role: 'ASSISTANT',
        content: '',
        citations: null,
        knowledgeMissed: false,
        retrieveError: null,
        createdAt: new Date().toISOString()
      }
    ])

    try {
      const response = await fetch(`/api/agents/${agentId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
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
      setMessages(current => current.filter(message => message.id !== streamId))
      toast.error(error instanceof Error ? error.message : '发送失败')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-6'>
      <PageTitle
        title={agentName}
        description='试聊，验证提示词、模型和知识库'
        actionButtons={
          <div className='flex flex-row items-center gap-2'>
            <Button
              type='button'
              variant='outline'
              disabled={!canChat || clearing || sending || messages.length === 0}
              onClick={() => void handleClear()}
            >
              {clearing ? <LoaderCircle className='animate-spin' /> : <Eraser />}
              清空对话
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
        提示词 {promptName || '未绑定'} · 知识库 {knowledgeName || '未绑定'}
      </div>

      {!canChat ? (
        <p className='text-muted-foreground text-sm'>
          仅启用中的助手可以试聊，请先将状态改为启用中。
        </p>
      ) : null}

      <div className='flex min-h-0 flex-1 flex-col gap-4'>
        <div className='min-h-0 flex-1 overflow-y-auto'>
          {loading ? (
            <p className='text-muted-foreground text-sm'>正在加载对话…</p>
          ) : messages.length === 0 ? (
            <p className='text-muted-foreground text-sm'>
              还没有消息，输入问题开始试聊。
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
                  {message.role === 'ASSISTANT' && message.retrieveError ? (
                    <p className='text-muted-foreground text-xs'>
                      {message.retrieveError}
                    </p>
                  ) : null}
                  {message.role === 'ASSISTANT' && message.knowledgeMissed ? (
                    <p className='text-muted-foreground text-xs'>
                      未检索到知识库内容
                    </p>
                  ) : null}
                  {message.role === 'ASSISTANT' && message.citations?.length ? (
                    <div className='text-muted-foreground flex max-w-[80%] flex-col gap-1 text-xs'>
                      {message.citations.map(citation => (
                        <div key={citation.chunkId}>
                          {citation.filename}：{citation.excerpt}
                        </div>
                      ))}
                    </div>
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
                void handleSend()
              }
            }}
          />
          <Button type='submit' disabled={!canChat || sending || !input.trim()}>
            {sending ? <LoaderCircle className='animate-spin' /> : <Send />}
            发送
          </Button>
        </form>
      </div>
    </div>
  )
}
