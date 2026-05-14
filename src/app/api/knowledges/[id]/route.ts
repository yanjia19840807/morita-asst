import { withRole } from '@/modules/auth/api'
import { toKnowledgeDto } from '@/modules/knowledges/mapper'
import { fetchKnowledgeById } from '@/modules/knowledges/service'
import { handleApiError, handleApiResult } from '@/lib/api/response'

export const GET = withRole(['admin'], async (_request, context) => {
  const routeParams = await context.params

  try {
    const result = await fetchKnowledgeById(routeParams.id)
    return handleApiResult(toKnowledgeDto(result))
  } catch (error) {
    return handleApiError(error)
  }
})
