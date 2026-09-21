export type DocPreviewKind = 'pdf' | 'text' | 'docx' | 'doc' | 'unsupported'

const OPEN_XML_WORD_TYPES = [
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.template',
  'application/vnd.ms-word.document.macroenabled.12',
  'application/vnd.ms-word.template.macroenabled.12'
]

const LEGACY_WORD_TYPES = ['application/msword']

export function getDocExtension(filename: string) {
  return filename.split('.').pop()?.toLowerCase() ?? ''
}

export function getDocPreviewKind(
  filename: string,
  mimeType?: string | null
): DocPreviewKind {
  const extension = getDocExtension(filename)
  const mime = mimeType?.toLowerCase() ?? ''

  if (mime === 'application/pdf' || extension === 'pdf') {
    return 'pdf'
  }

  if (mime === 'text/plain' || mime.startsWith('text/') || extension === 'txt') {
    return 'text'
  }

  if (
    OPEN_XML_WORD_TYPES.includes(mime) ||
    extension === 'docx' ||
    extension === 'dotx' ||
    extension === 'docm'
  ) {
    return 'docx'
  }

  if (LEGACY_WORD_TYPES.includes(mime) || extension === 'doc' || extension === 'dot') {
    return 'doc'
  }

  return 'unsupported'
}

export function getDocTypeLabel(filename: string, mimeType?: string | null) {
  const kind = getDocPreviewKind(filename, mimeType)
  if (kind === 'pdf') return 'PDF'
  if (kind === 'text') return 'TXT'
  if (kind === 'docx' || kind === 'doc') return 'Word'
  return '文件'
}

export function getDocFileUrl(id: string, download = false) {
  const params = download ? '?download=1' : ''
  return `/api/docs/${id}/file${params}`
}

export function formatFileSize(bytes?: number | null) {
  if (!bytes || bytes <= 0) return '-'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    sizes.length - 1
  )
  return `${(bytes / 1024 ** index).toFixed(index ? 1 : 0)} ${sizes[index]}`
}

export function getDocContentType(
  filename: string,
  mimeType?: string | null
) {
  if (mimeType) return mimeType

  const kind = getDocPreviewKind(filename, mimeType)
  if (kind === 'pdf') return 'application/pdf'
  if (kind === 'text') return 'text/plain; charset=utf-8'
  return 'application/octet-stream'
}
