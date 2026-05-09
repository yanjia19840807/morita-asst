import { NextRequest } from 'next/server'
import z from 'zod'
import { withRole } from '@/lib/api/server/with-role'
import { handleApiError, handleApiResult } from '@/lib/api/server/response'
import { ValidationError } from '@/lib/api/server/errors'
import { fetchKnowledgeDocs } from '@/dal/knowledges'
import { toFetchKnowledgeDocsListResult } from '@/lib/api/shared/knowledge'
import { fetchKnowledgeDocsParamsSchema } from '@/schemas/knowledge'

export const GET = withRole(
  ['admin'],
  async (request: NextRequest, context) => {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries())
    const routeParams = await context.params

    try {
      const validation = fetchKnowledgeDocsParamsSchema.safeParse({
        ...params,
        knowledgeId: routeParams.id
      })

      if (!validation.success) {
        throw new ValidationError(z.prettifyError(validation.error))
      }

      const result = await fetchKnowledgeDocs(validation.data)
      return handleApiResult(toFetchKnowledgeDocsListResult(result))
    } catch (error) {
      return handleApiError(error)
    }
  }
)
