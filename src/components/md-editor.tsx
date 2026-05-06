'use client'

import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  Underline as UnderlineIcon,
  Undo2
} from 'lucide-react'
import { EditorContent, useEditor } from '@tiptap/react'
import { useState } from 'react'
import { CharacterCount } from '@tiptap/extensions'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { Markdown } from '@tiptap/markdown'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface Props {
  value: string
  fieldChange: (value: string) => void
  invalid?: boolean
}

type ToolbarButtonProps = {
  active?: boolean
  disabled?: boolean
  onClick: () => void
  title: string
  children: React.ReactNode
}

function ToolbarButton({
  active,
  disabled,
  onClick,
  title,
  children
}: ToolbarButtonProps) {
  return (
    <button
      type='button'
      title={title}
      disabled={disabled}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'text-muted-foreground inline-flex h-8 items-center justify-center rounded-lg border border-transparent px-2.5 transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        'disabled:pointer-events-none disabled:opacity-50',
        active && 'border-border bg-background text-foreground shadow-xs'
      )}
    >
      {children}
    </button>
  )
}

export default function MDEditor({
  value,
  fieldChange,
  invalid = false
}: Props) {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('https://')

  const editor = useEditor(
    {
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          codeBlock: false,
          strike: false
        }),
        Link.configure({
          openOnClick: false,
          autolink: true,
          defaultProtocol: 'https'
        }),
        Placeholder.configure({
          placeholder: ({ node }) => {
            if (node.type.name === 'heading') {
              return '输入标题'
            }

            if (node.type.name === 'blockquote') {
              return '输入引用'
            }

            if (node.type.name === 'bulletList') {
              return '输入列表'
            }

            if (node.type.name === 'orderedList') {
              return '输入列表'
            }

            if (node.type.name === 'listItem') {
              return '输入列表项'
            }

            return '输入内容'
          }
        }),
        CharacterCount.configure({
          limit: 20000,
          textCounter: text => [...text].length
        }),
        Underline,
        Markdown
      ],
      content: value,
      contentType: 'markdown',
      editorProps: {
        attributes: {
          class:
            'prose prose-sm dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-p:text-foreground prose-strong:text-foreground prose-code:rounded-md prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-[0.9em] prose-pre:rounded-xl prose-pre:border prose-pre:border-border prose-pre:bg-muted/80 prose-pre:shadow-inner prose-blockquote:rounded-r-lg prose-blockquote:border-l-[3px] prose-blockquote:border-border prose-blockquote:bg-muted/35 prose-blockquote:py-1 prose-blockquote:text-muted-foreground prose-a:text-primary prose-a:decoration-primary/60 prose-a:underline-offset-4 max-w-none min-h-80 px-5 py-4 text-foreground caret-foreground outline-none transition-colors selection:bg-primary/18 selection:text-foreground [&_.is-editor-empty:first-child::before]:pointer-events-none [&_.is-editor-empty:first-child::before]:float-left [&_.is-editor-empty:first-child::before]:h-0 [&_.is-editor-empty:first-child::before]:text-muted-foreground [&_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]'
        }
      },
      onUpdate({ editor: currentEditor }) {
        fieldChange(currentEditor.getMarkdown())
      }
    },
    [fieldChange]
  )

  if (!editor) {
    return null
  }

  if (value !== editor.getMarkdown()) {
    editor.commands.setContent(value, {
      contentType: 'markdown'
    })
  }

  const openLinkDialog = () => {
    const previousUrl = editor.getAttributes('link').href as string | undefined

    setLinkUrl(previousUrl || 'https://')
    setIsLinkDialogOpen(true)
  }

  const applyLink = () => {
    const nextUrl = linkUrl.trim()

    if (!nextUrl) {
      editor.chain().focus().unsetLink().run()
      setIsLinkDialogOpen(false)
      return
    }

    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: nextUrl })
      .run()

    setIsLinkDialogOpen(false)
  }

  const clearLink = () => {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run()
    }

    setLinkUrl('https://')
    setIsLinkDialogOpen(false)
  }

  const characterCount = editor.storage.characterCount.characters()
  const maxCharacterCount = 20000

  return (
    <div
      aria-invalid={invalid}
      className={cn(
        'border-input bg-card/95 supports-backdrop-filter:bg-card/90 focus-within:border-ring focus-within:ring-ring/25 overflow-hidden rounded-2xl border shadow-xs backdrop-blur transition-[box-shadow,border-color,background-color] focus-within:ring-4',
        'aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 aria-invalid:ring-4'
      )}
    >
      <div className='border-border/80 bg-muted/45 flex flex-wrap items-center gap-1 border-b px-2.5 py-2'>
        <ToolbarButton
          title='撤销'
          disabled={!editor.can().chain().focus().undo().run()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 className='size-4' />
        </ToolbarButton>
        <ToolbarButton
          title='重做'
          disabled={!editor.can().chain().focus().redo().run()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 className='size-4' />
        </ToolbarButton>
        <ToolbarButton
          title='一级标题'
          active={editor.isActive('heading', { level: 1 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <Heading1 className='size-4' />
        </ToolbarButton>
        <ToolbarButton
          title='二级标题'
          active={editor.isActive('heading', { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className='size-4' />
        </ToolbarButton>
        <ToolbarButton
          title='三级标题'
          active={editor.isActive('heading', { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 className='size-4' />
        </ToolbarButton>
        <ToolbarButton
          title='粗体'
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className='size-4' />
        </ToolbarButton>
        <ToolbarButton
          title='斜体'
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className='size-4' />
        </ToolbarButton>
        <ToolbarButton
          title='下划线'
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className='size-4' />
        </ToolbarButton>
        <ToolbarButton
          title='行内代码'
          active={editor.isActive('code')}
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className='size-4' />
        </ToolbarButton>
        <ToolbarButton
          title='引用'
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className='size-4' />
        </ToolbarButton>
        <ToolbarButton
          title='无序列表'
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className='size-4' />
        </ToolbarButton>
        <ToolbarButton
          title='有序列表'
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className='size-4' />
        </ToolbarButton>
        <ToolbarButton
          title='链接'
          active={editor.isActive('link')}
          onClick={openLinkDialog}
        >
          <Link2 className='size-4' />
        </ToolbarButton>
        <ToolbarButton
          title='分割线'
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className='size-4' />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} className='bg-background/70 min-h-80' />
      <div className='text-muted-foreground border-border/80 bg-muted/30 flex items-center justify-end border-t px-4 py-2 text-xs'>
        {characterCount}/{maxCharacterCount} 字
      </div>
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>设置链接</DialogTitle>
            <DialogDescription>
              输入链接地址，留空可移除当前链接。
            </DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            value={linkUrl}
            placeholder='https://example.com'
            onChange={event => setLinkUrl(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault()
                applyLink()
              }
            }}
          />
          <DialogFooter>
            <Button variant='outline' onClick={clearLink}>
              清除
            </Button>
            <Button
              variant='outline'
              onClick={() => setIsLinkDialogOpen(false)}
            >
              取消
            </Button>
            <Button onClick={applyLink}>确定</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
