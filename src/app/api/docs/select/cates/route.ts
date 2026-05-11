import { handleApiError, handleApiResult } from '@/lib/api/response'
import { withRole } from '@/modules/auth/api'
import { toSelectDocCateItems } from '@/modules/docs/mapper'
import { fetchDocCates } from '@/modules/docs/service'

export const GET = withRole(['admin'], async () => {
  try {
    const result = await fetchDocCates()
    return handleApiResult(toSelectDocCateItems(result))
  } catch (error) {
    return handleApiError(error)
  }
})
