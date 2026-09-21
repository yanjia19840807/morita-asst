'use client'

import * as React from 'react'
import { FileText, LoaderCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { getDocFileUrl, type DocPreviewKind } from '@/modules/docs/preview'

type PreviewProps = {
  fileUrl: string
  downloadUrl: string
  filename: string
}

const previewRenderers: Record<
  DocPreviewKind,
  (props: PreviewProps) => React.ReactNode
> = {
  pdf: ({ fileUrl, filename }) => (
    <iframe
      src={fileUrl}
      title={filename}
      className='bg-muted h-[min(80vh,840px)] w-full rounded-[10px] border-0'
    />
  ),
  text: ({ fileUrl, filename }) => (
    <TextPreview fileUrl={fileUrl} filename={filename} />
  ),
  docx: ({ fileUrl, filename }) => (
    <WordPreview fileUrl={fileUrl} filename={filename} />
  ),
  doc: ({ downloadUrl }) => (
    <UnsupportedPreview
      title='旧版 Word 无法在浏览器中排版'
      description='社区通用预览只覆盖 .docx。请另存为 .docx 后重新导入，或先下载查看。'
      downloadUrl={downloadUrl}
    />
  ),
  unsupported: ({ downloadUrl }) => (
    <UnsupportedPreview
      title='暂不支持在线预览'
      description='当前格式没有通用的浏览器预览方式，请下载后查看。'
      downloadUrl={downloadUrl}
    />
  )
}

export function DocPreview({
  docId,
  filename,
  kind
}: {
  docId: string
  filename: string
  kind: DocPreviewKind
}) {
  const render = previewRenderers[kind]

  return (
    <>
      {render({
        fileUrl: getDocFileUrl(docId),
        downloadUrl: getDocFileUrl(docId, true),
        filename
      })}
    </>
  )
}

function WordPreview({
  fileUrl,
  filename
}: {
  fileUrl: string
  filename: string
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const controller = new AbortController()
    const container = containerRef.current

    async function renderWord() {
      if (!container) return

      try {
        setLoading(true)
        setError(null)
        container.replaceChildren()

        const response = await fetch(fileUrl, {
          signal: controller.signal,
          cache: 'no-store'
        })

        if (!response.ok) {
          throw new Error('文档内容加载失败')
        }

        const buffer = await response.arrayBuffer()
        const { renderAsync } = await import('docx-preview')

        if (controller.signal.aborted) return

        await renderAsync(buffer, container, undefined, {
          className: 'docx-office',
          inWrapper: true,
          breakPages: true,
          renderHeaders: true,
          renderFooters: true,
          renderFootnotes: true,
          renderEndnotes: true,
          ignoreLastRenderedPageBreak: false
        })
      } catch (loadError) {
        if (controller.signal.aborted) return
        setError(
          loadError instanceof Error ? loadError.message : 'Word 文档预览失败'
        )
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void renderWord()

    return () => {
      controller.abort()
      container?.replaceChildren()
    }
  }, [fileUrl])

  return (
    <div className='relative'>
      {loading ? (
        <div className='text-muted-foreground absolute inset-0 z-10 flex items-center justify-center gap-2 text-sm'>
          <LoaderCircle className='size-4 animate-spin' />
          正在打开 Word 文档
        </div>
      ) : null}
      {error ? (
        <div className='text-destructive flex min-h-72 items-center justify-center text-sm'>
          {error}
        </div>
      ) : null}
      <div
        ref={containerRef}
        aria-label={filename}
        className='doc-office-preview h-[min(80vh,840px)] overflow-auto rounded-[10px]'
      />
    </div>
  )
}

function TextPreview({
  fileUrl,
  filename
}: {
  fileUrl: string
  filename: string
}) {
  const [content, setContent] = React.useState('')
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const controller = new AbortController()

    async function loadText() {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(fileUrl, {
          signal: controller.signal,
          cache: 'no-store'
        })

        if (!response.ok) {
          throw new Error('文档内容加载失败')
        }

        setContent(await response.text())
      } catch (loadError) {
        if (controller.signal.aborted) return
        setError(
          loadError instanceof Error ? loadError.message : '文档内容加载失败'
        )
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void loadText()

    return () => controller.abort()
  }, [fileUrl])

  if (loading) {
    return (
      <div className='text-muted-foreground flex min-h-72 items-center justify-center gap-2 text-sm'>
        <LoaderCircle className='size-4 animate-spin' />
        正在加载文档
      </div>
    )
  }

  if (error) {
    return (
      <div className='text-destructive flex min-h-72 items-center justify-center text-sm'>
        {error}
      </div>
    )
  }

  return (
    <pre
      aria-label={filename}
      className='bg-muted/40 h-[min(80vh,840px)] overflow-auto rounded-[10px] p-4 text-sm leading-7 whitespace-pre-wrap'
    >
      {content || '（空文档）'}
    </pre>
  )
}

function UnsupportedPreview({
  title,
  description,
  downloadUrl
}: {
  title: string
  description: string
  downloadUrl: string
}) {
  return (
    <div className='flex min-h-72 flex-col items-center justify-center px-6 py-16 text-center'>
      <FileText className='text-muted-foreground mb-4 size-10' />
      <h2 className='text-base font-semibold'>{title}</h2>
      <p className='text-muted-foreground mt-2 max-w-md text-sm'>{description}</p>
      <Button className='mt-6' asChild>
        <a href={downloadUrl}>下载文档</a>
      </Button>
    </div>
  )
}
