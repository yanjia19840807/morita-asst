import { fetchDocCates } from '@/data-access/doc'
import { handleApiError, handleApiResult } from '@/lib/api/server/response'
import { withRole } from '@/lib/api/server/with-role'

export const GET = withRole(['admin'], async () => {
  try {
    const result = await fetchDocCates()
    return handleApiResult(result)
  } catch (error) {
    return handleApiError(error)
  }
})
