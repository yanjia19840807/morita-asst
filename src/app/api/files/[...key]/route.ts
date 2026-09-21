import { createReadStream } from 'node:fs'
import { Readable } from 'node:stream'
import { withAuth } from '@/modules/auth/api'
import { getStoredFileStat } from '@/modules/storage/server'
import { APIError } from '@/lib/api/errors'
import { handleApiError } from '@/lib/api/response'

export const runtime = 'nodejs'

export const GET = withAuth(async (_request, context) => {
  try {
    const params = (await context.params) as { key?: string | string[] }
    const storageKey = Array.isArray(params.key)
      ? params.key.join('/')
      : params.key

    if (!storageKey?.startsWith('avatars/')) {
      throw new APIError('无权访问该文件', 403)
    }

    const { filePath, stat } = await getStoredFileStat(storageKey)
    const filename = storageKey.split('/').pop() || 'file'
    const extension = filename.split('.').pop()?.toLowerCase()
    const contentType =
      extension === 'png'
        ? 'image/png'
        : extension === 'webp'
          ? 'image/webp'
          : extension === 'gif'
            ? 'image/gif'
            : extension === 'jpg' || extension === 'jpeg'
              ? 'image/jpeg'
              : 'application/octet-stream'

    return new Response(Readable.toWeb(createReadStream(filePath)) as ReadableStream, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(stat.size),
        'Content-Disposition': `inline; filename*=UTF-8''${encodeURIComponent(filename)}`,
        'Cache-Control': 'private, max-age=300'
      }
    })
  } catch (error) {
    return handleApiError(error)
  }
})
