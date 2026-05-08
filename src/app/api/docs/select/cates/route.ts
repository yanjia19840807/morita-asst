import { fetchDocCates } from '@/dal/docs'
import { toSelectDocCateItems } from '@/lib/api/shared/doc'
import { handleApiError, handleApiResult } from '@/lib/api/server/response'
import { withRole } from '@/lib/api/server/with-role'

export const GET = withRole(['admin'], async () => {
  try {
    const result = await fetchDocCates()
    return handleApiResult(toSelectDocCateItems(result))
  } catch (error) {
    return handleApiError(error)
  }
})
