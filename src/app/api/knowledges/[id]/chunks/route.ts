import { NextRequest } from 'next/server'
import { withRole } from '@/modules/auth/api'
import { toFetchKnowledgeChunksListDto } from '@/modules/knowledges/mapper'
import { fetchKnowledgeChunksParamsSchema } from '@/modules/knowledges/schemas'
import { fetchKnowledgeChunks } from '@/modules/knowledges/service'
import { ValidationError } from '@/lib/api/errors'
import { handleApiError, handleApiResult } from '@/lib/api/response'
import { formatZodError } from '../../../../../lib/zod'

export const GET = withRole(
  ['admin'],
  async (request: NextRequest, context) => {
    const params = Object.fromEntries(request.nextUrl.searchParams.entries())
    const routeParams = await context.params

    try {
      const validation = fetchKnowledgeChunksParamsSchema.safeParse({
        ...params,
        knowledgeId: routeParams.id
      })

      if (!validation.success) {
        throw new ValidationError(formatZodError(validation.error))
      }

      const result = await fetchKnowledgeChunks(validation.data)
      return handleApiResult(toFetchKnowledgeChunksListDto(result))
    } catch (error) {
      return handleApiError(error)
    }
  }
)
