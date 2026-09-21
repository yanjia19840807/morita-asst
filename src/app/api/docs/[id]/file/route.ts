import { Readable } from 'node:stream'
import { withRole } from '@/modules/auth/api'
import { fetchDocById } from '@/modules/docs/service'
import {
  getDocContentType,
  getDocPreviewKind
} from '@/modules/docs/preview'
import { getStoredObjectStream } from '@/modules/oss/server'
import { handleApiError } from '@/lib/api/response'

export const GET = withRole(['admin'], async (request, context) => {
  try {
    const { id } = await context.params
    const doc = await fetchDocById(id)
    const download = request.nextUrl.searchParams.get('download') === '1'
    const result = await getStoredObjectStream(doc.storageKey)
    const contentType = getDocContentType(doc.filename, doc.mimeType)
    const previewKind = getDocPreviewKind(doc.filename, doc.mimeType)
    const encodedName = encodeURIComponent(doc.filename)
    const dispositionType = download ? 'attachment' : 'inline'

    return new Response(Readable.toWeb(result.stream) as ReadableStream, {
      headers: {
        'Content-Type':
          previewKind === 'text' && !doc.mimeType
            ? 'text/plain; charset=utf-8'
            : contentType,
        'Content-Disposition': `${dispositionType}; filename*=UTF-8''${encodedName}`,
        'Content-Length': String(result.size),
        'Cache-Control': 'private, max-age=60'
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
})
