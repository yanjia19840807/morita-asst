import { NextRequest } from 'next/server'
import { withRole } from '@/modules/auth/api'
import {
  clearAgentChatThread,
  fetchAgentChatThread,
  streamAgentChat
} from '@/modules/agents/chat/service'
import { ValidationError } from '@/lib/api/errors'
import { handleApiError, handleApiResult } from '@/lib/api/response'

function encodeSse(event: object) {
  return `data: ${JSON.stringify(event)}\n\n`
}

export const GET = withRole(['admin'], async (_request, context) => {
  try {
    const { id } = await context.params
    const result = await fetchAgentChatThread(id)
    return handleApiResult(result)
  } catch (error) {
    return handleApiError(error)
  }
})

export const DELETE = withRole(['admin'], async (_request, context) => {
  try {
    const { id } = await context.params
    const result = await clearAgentChatThread(id)
    return handleApiResult(result)
  } catch (error) {
    return handleApiError(error)
  }
})

export const POST = withRole(['admin'], async (request: NextRequest, context) => {
  const { id } = await context.params
  let content: unknown

  try {
    const body = (await request.json()) as { content?: unknown }
    content = body.content
  } catch {
    return handleApiError(new ValidationError('请求体无效'))
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: object) => {
        controller.enqueue(encoder.encode(encodeSse(event)))
      }

      try {
        for await (const event of streamAgentChat(id, content)) {
          send(event)
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : '生成回复失败'
        send({ type: 'error', message })
      } finally {
        controller.close()
      }
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive'
    }
  })
})
