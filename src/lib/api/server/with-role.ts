import { AuthenticatedHandler, withAuth } from '@/lib/api/server/with-auth'
import { ForbiddenError } from '@/lib/api/server/errors'
import { handleApiError } from '@/lib/api/server/response'

export function withRole(roles: string[], handler: AuthenticatedHandler) {
  return withAuth(async (request, context) => {
    if (!roles.includes(context.user.role || '')) {
      return handleApiError(new ForbiddenError())
    }

    return handler(request, context)
  })
}
