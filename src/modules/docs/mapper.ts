import type { DocCate } from '@/generated/prisma/client'
import type { FetchDocsResult } from './service'
import type { DocCateDto, DocListItemDto, FetchDocsResponseDto } from './dto'

export function toDocCateDto(docCate: DocCate): DocCateDto {
  return {
    id: docCate.id,
    name: docCate.name
  }
}

export function toSelectDocCateItem(docCate: DocCate): DocCateDto {
  return toDocCateDto(docCate)
}

export function toSelectDocCateItems(docCates: DocCate[]): DocCateDto[] {
  return docCates.map(toDocCateDto)
}

export function toDocListItemDto(
  result: FetchDocsResult['docs'][number]
): DocListItemDto {
  return {
    id: result.id,
    filename: result.filename,
    fileSize: result.fileSize,
    mimeType: result.mimeType,
    createdAt: result.createdAt.toISOString()
  }
}

export function toFetchDocsResponseDto(
  result: FetchDocsResult
): FetchDocsResponseDto {
  return {
    docs: result.docs.map(toDocListItemDto),
    total: result.total
  }
}

export function toFetchSelectDocsResult(
  result: FetchDocsResult
): FetchDocsResponseDto {
  return toFetchDocsResponseDto(result)
}
