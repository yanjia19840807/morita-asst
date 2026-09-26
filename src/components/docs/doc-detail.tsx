import Link from 'next/link'
import { format } from 'date-fns'
import { ChevronLeft, Download } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { PagePanel } from '@/components/layout/page-panel'
import { PageStack } from '@/components/layout/page-stack'
import InfoItem from '@/components/info-item'
import PageTitle from '@/components/layout/page-title'
import { DocPreview } from '@/components/docs/doc-preview'
import type { DocDetail as DocDetailRecord } from '@/modules/docs/service'
import {
  formatFileSize,
  getDocFileUrl,
  getDocPreviewKind,
  getDocTypeLabel
} from '@/modules/docs/preview'

export function DocDetail({ doc }: { doc: DocDetailRecord }) {
  const kind = getDocPreviewKind(doc.filename, doc.mimeType)

  return (
    <PageStack>
      <PageTitle
        title={doc.filename}
        description='在线浏览文档内容，并查看基础信息'
        actionButtons={
          <div className='flex flex-row items-center gap-2'>
            <a
              href={getDocFileUrl(doc.id, true)}
              className={buttonVariants()}
            >
              <Download />
              下载
            </a>
            <Link
              href='/docs'
              className={buttonVariants({ variant: 'ghost' })}
            >
              <ChevronLeft />
              返回
            </Link>
          </div>
        }
      />
      <div className='grid min-h-0 flex-1 gap-4 md:gap-6 xl:grid-cols-[minmax(0,1fr)_280px]'>
        <PagePanel
          title='在线预览'
          description={
            kind === 'pdf'
              ? '使用浏览器打开 PDF'
              : kind === 'text'
                ? '直接阅读文本内容'
                : kind === 'docx'
                  ? '按 Word 版式在页面中阅读'
                  : kind === 'doc'
                    ? '旧版 .doc 无法内嵌，请下载或另存为 .docx'
                    : '当前格式暂不支持嵌入预览'
          }
        >
          <DocPreview
            docId={doc.id}
            filename={doc.filename}
            kind={kind}
          />
        </PagePanel>
        <PagePanel title='文档信息' description='文件属性和关联情况'>
          <div className='grid grid-cols-1 gap-4'>
            <InfoItem
              label='类型'
              value={
                <Badge variant='secondary'>
                  {getDocTypeLabel(doc.filename, doc.mimeType)}
                </Badge>
              }
            />
            <InfoItem label='大小' value={formatFileSize(doc.fileSize)} />
            <InfoItem label='类目' value={doc.docCate?.name || '未分类'} />
            <InfoItem
              label='关联知识库'
              value={`${doc._count.knowledgeDocs} 个`}
            />
            <InfoItem
              label='创建时间'
              value={format(new Date(doc.createdAt), 'yyyy-MM-dd HH:mm')}
            />
            <InfoItem
              label='更新时间'
              value={format(new Date(doc.updatedAt), 'yyyy-MM-dd HH:mm')}
            />
          </div>
        </PagePanel>
      </div>
    </PageStack>
  )
}
