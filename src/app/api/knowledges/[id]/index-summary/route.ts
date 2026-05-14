import { withRole } from '@/modules/auth/api'
import { fetchKnowledgeIndexSummary } from '@/modules/knowledges/indexing/service'
import { handleApiError, handleApiResult } from '@/lib/api/response'

export const GET = withRole(['admin'], async (_request, context) => {
  const routeParams = await context.params

  try {
    const result = await fetchKnowledgeIndexSummary(routeParams.id)
    return handleApiResult(result)
  } catch (error) {
    return handleApiError(error)
  }
})
