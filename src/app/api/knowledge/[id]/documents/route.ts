import { NextRequest } from 'next/server'
import z from 'zod'
import { withRole } from '@/lib/api/server/with-role'
import { handleApiError, handleApiResult } from '@/lib/api/server/response'
import { ValidationError } from '@/lib/api/server/errors'
import { fetchKnowledgeDocuments } from '@/dal/knowledges'
import { toFetchKnowledgeDocumentsListResult } from '@/lib/api/shared/knowledge'
import { fetchKnowledgeDocumentsParamsSchema } from '@/schemas/knowledge'

export const GET = withRole(
  ['admin'],
  async (request: NextRequest, context) => {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries())
    const routeParams = await context.params

    try {
      const validation = fetchKnowledgeDocumentsParamsSchema.safeParse({
        ...params,
        knowledgeId: routeParams.id
      })

      if (!validation.success) {
        throw new ValidationError(z.prettifyError(validation.error))
      }

      const result = await fetchKnowledgeDocuments(validation.data)
      return handleApiResult(toFetchKnowledgeDocumentsListResult(result))
    } catch (error) {
      return handleApiError(error)
    }
  }
)
