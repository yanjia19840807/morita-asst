import { withRole } from '@/modules/auth/api'
import {
  DOC_ACCEPT_MINE_TYPES,
  DOC_MAX_SIZE,
  DOCX_MIME_TYPE
} from '@/modules/docs/constants'
import {
  convertDocToDocx,
  isLegacyWordFile,
  toDocxFilename
} from '@/modules/docs/convert-doc'
import { getStoredFileUrl, saveStoredBuffer } from '@/modules/storage/server'
import { ValidationError } from '@/lib/api/errors'
import { handleApiError, handleApiResult } from '@/lib/api/response'

export const runtime = 'nodejs'

export const POST = withRole(['admin'], async (request, context) => {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      throw new ValidationError('请选择要上传的文件')
    }

    if (file.size > DOC_MAX_SIZE * 1024 * 1024) {
      throw new ValidationError(`文件大小不能超过${DOC_MAX_SIZE}M`)
    }

    if (file.type && !DOC_ACCEPT_MINE_TYPES.includes(file.type)) {
      throw new ValidationError('不支持的文档类型')
    }

    let filename = file.name
    let mimeType = file.type || 'application/octet-stream'
    let data = Buffer.from(await file.arrayBuffer())
    let converted = false

    if (isLegacyWordFile(filename, file.type)) {
      data = await convertDocToDocx(data, filename)
      filename = toDocxFilename(filename)
      mimeType = DOCX_MIME_TYPE
      converted = true
    }

    const storageKey = await saveStoredBuffer(
      'documents',
      context.user.id,
      filename,
      data
    )

    return handleApiResult({
      storageKey,
      url: getStoredFileUrl(storageKey),
      filename,
      fileSize: data.length,
      mimeType,
      converted
    })
  } catch (error) {
    return handleApiError(error)
  }
})
