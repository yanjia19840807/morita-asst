import { getStoredFileUrl } from './urls'

type UploadResult = {
  storageKey: string
  url: string
  filename?: string
  fileSize?: number
  mimeType?: string
  converted?: boolean
}

export type DocUploadResult = {
  storageKey: string
  url: string
  filename: string
  fileSize: number
  mimeType: string
  converted: boolean
}

async function uploadWithProgress(
  url: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResult> {
  const form = new FormData()
  form.append('file', file)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.responseType = 'json'

    xhr.upload.onprogress = event => {
      if (!event.lengthComputable) return
      onProgress?.(Math.round((event.loaded / event.total) * 100))
    }

    xhr.onload = () => {
      const payload = xhr.response as {
        data?: UploadResult
        error?: string | { message?: string }
      } | null

      if (xhr.status >= 200 && xhr.status < 300 && payload?.data) {
        resolve(payload.data)
        return
      }

      const message =
        typeof payload?.error === 'string'
          ? payload.error
          : payload?.error?.message
      reject(new Error(message || '上传失败'))
    }

    xhr.onerror = () => reject(new Error('上传失败'))
    xhr.send(form)
  })
}

export async function uploadAvatar(_userId: string, file: File) {
  const result = await uploadWithProgress('/api/files/avatars', file)
  return result.url
}

export async function uploadDocs(
  _userId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<DocUploadResult> {
  const result = await uploadWithProgress(
    '/api/files/documents',
    file,
    onProgress
  )

  return {
    storageKey: result.storageKey,
    url: result.url,
    filename: result.filename || file.name,
    fileSize: result.fileSize ?? file.size,
    mimeType: result.mimeType || file.type,
    converted: Boolean(result.converted)
  }
}

export { getStoredFileUrl }
