import { NextRequest } from 'next/server'
import z from 'zod'
import { fetchDocs } from '@/dal/docs'
import { toFetchSelectDocsResult } from '@/lib/api/shared/doc'
import { handleApiError, handleApiResult } from '@/lib/api/server/response'
import { fetchDocsParamsSchema } from '@/schemas/doc'
import { ValidationError } from '@/lib/api/server/errors'
import { withRole } from '@/lib/api/server/with-role'

export const GET = withRole(['admin'], async (request: NextRequest) => {
  const params = Object.fromEntries(request.nextUrl.searchParams.entries())

  try {
    const validation = fetchDocsParamsSchema.safeParse(params)
    if (!validation.success) {
      throw new ValidationError(z.prettifyError(validation.error))
    }

    const result = await fetchDocs(validation.data)

    return handleApiResult(toFetchSelectDocsResult(result))
  } catch (error) {
    return handleApiError(error)
  }
})
