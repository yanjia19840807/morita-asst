import { NextRequest } from 'next/server'
import { withRole } from '@/modules/auth/api'
import { toFetchSelectDocsResult } from '@/modules/docs/mapper'
import { fetchDocsParamsSchema } from '@/modules/docs/schemas'
import { fetchDocs } from '@/modules/docs/service'
import { ValidationError } from '@/lib/api/errors'
import { handleApiError, handleApiResult } from '@/lib/api/response'
import { formatZodError } from '../../../../lib/zod'

export const GET = withRole(['admin'], async (request: NextRequest) => {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries())

  try {
    const validation = fetchDocsParamsSchema.safeParse(params)
    if (!validation.success) {
      throw new ValidationError(formatZodError(validation.error))
    }

    const result = await fetchDocs(validation.data)

    return handleApiResult(toFetchSelectDocsResult(result))
  } catch (error) {
    return handleApiError(error)
  }
})
