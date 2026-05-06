import { headers } from 'next/headers'
import { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { UnauthorizedError } from '@/lib/api/server/errors'
import { handleApiError } from '@/lib/api/server/response'

type SessionData = Awaited<ReturnType<typeof auth.api.getSession>>
type SessionUser = NonNullable<SessionData>['user']

export type AuthenticatedHandler = (
  request: NextRequest,
  context: { params: Promise<Record<string, string>>; user: SessionUser }
) => Promise<Response>

export function withAuth(handler: AuthenticatedHandler) {
  return async (
    request: NextRequest,
    context: { params: Promise<Record<string, string>> }
  ) => {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session?.user) {
      return handleApiError(new UnauthorizedError())
    }

    return handler(request, { ...context, user: session.user })
  }
}
