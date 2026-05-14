import type { ZodError } from 'zod'

export function formatZodError(error: ZodError): string {
  const messages = error.issues
    .map(issue => {
      const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : ''
      return `${path}${issue.message}`
    })
    .filter((message, index, items) => items.indexOf(message) === index)

  return messages.join('\n') || '参数校验失败'
}