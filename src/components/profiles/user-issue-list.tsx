'use client'

import { useState } from 'react'
import { DragDropProvider } from '@dnd-kit/react'
import { useSortable } from '@dnd-kit/react/sortable'
import { RestrictToVerticalAxis } from '@dnd-kit/abstract/modifiers'
import type { DragEndEvent } from '@dnd-kit/abstract'
import { Pencil, Plus, Trash2 } from 'lucide-react'

import ConfirmDialog from '@/components/confirm-dialog'
import { DragHandle } from '@/components/drag-handle'
import { Button } from '@/components/ui/button'
import { FieldLabel } from '@/components/ui/field'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle
} from '@/components/ui/item'
import { cn } from '@/lib/utils'
import { formatIssueTags } from '@/modules/profiles/labels'
import type { UserIssueDto } from '@/modules/profiles/dto'
import type { UserIssueValues } from '@/modules/profiles/schemas'
import { UserIssueDialog } from './user-issue-dialog'

export type ProfileIssueDraft = UserIssueValues & { key: string }

export function toIssueDrafts(issues: UserIssueDto[]): ProfileIssueDraft[] {
  return issues.map(issue => ({
    id: issue.id,
    key: issue.id,
    priority: issue.priority,
    tags: issue.tags,
    description: issue.description
  }))
}

export function toIssueValues(issues: ProfileIssueDraft[]): UserIssueValues[] {
  return issues.map((issue, index) => ({
    id: issue.id,
    priority: index + 1,
    tags: issue.tags,
    description: issue.description
  }))
}

function SortableIssueRow({
  issue,
  index,
  disabled,
  onEdit,
  onRemove
}: {
  issue: ProfileIssueDraft
  index: number
  disabled?: boolean
  onEdit: () => void
  onRemove: () => void
}) {
  const { ref, sourceRef, targetRef, handleRef, isDragging } = useSortable({
    id: issue.key,
    index,
    disabled,
    modifiers: [RestrictToVerticalAxis]
  })

  const itemRef = (element: HTMLDivElement | null) => {
    ref(element)
    sourceRef(element)
    targetRef(element)
  }

  return (
    <div ref={itemRef} className={cn(isDragging && 'opacity-50')}>
      <Item variant='outline'>
        <ItemMedia>
          <div className='flex items-center gap-2'>
            <DragHandle disabled={disabled} handleRef={handleRef} />
            <span className='text-muted-foreground w-8 text-xs font-medium'>
              P{index + 1}
            </span>
          </div>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{formatIssueTags(issue.tags)}</ItemTitle>
          <ItemDescription>{issue.description}</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Button
            type='button'
            variant='ghost'
            size='icon-sm'
            onClick={onEdit}
            disabled={disabled}
            aria-label='编辑问题'
          >
            <Pencil />
          </Button>
          <ConfirmDialog
            title='删除问题'
            description='确认删除这条主要问题吗？'
            actions={{
              label: '删除',
              onClick: onRemove
            }}
          >
            <Button
              type='button'
              variant='ghost'
              size='icon-sm'
              className='text-muted-foreground'
              disabled={disabled}
              aria-label='删除问题'
            >
              <Trash2 />
            </Button>
          </ConfirmDialog>
        </ItemActions>
      </Item>
    </div>
  )
}

export function UserIssueList({
  issues,
  onChange,
  disabled
}: {
  issues: ProfileIssueDraft[]
  onChange: (issues: ProfileIssueDraft[]) => void
  disabled?: boolean
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)

  const handleDragEnd = ({ operation, canceled }: DragEndEvent) => {
    if (canceled || disabled) {
      return
    }

    const sortableSource = operation.source as {
      initialIndex?: number
      index?: number
    } | null

    if (
      !sortableSource ||
      typeof sortableSource.initialIndex !== 'number' ||
      typeof sortableSource.index !== 'number'
    ) {
      return
    }

    const sourceIndex = sortableSource.initialIndex
    const targetIndex = sortableSource.index

    if (
      sourceIndex === targetIndex ||
      sourceIndex < 0 ||
      targetIndex < 0 ||
      sourceIndex >= issues.length ||
      targetIndex >= issues.length
    ) {
      return
    }

    const nextIssues = [...issues]
    const [moved] = nextIssues.splice(sourceIndex, 1)
    nextIssues.splice(targetIndex, 0, moved)
    onChange(nextIssues)
  }

  const editingIssue =
    editingIndex !== null ? issues[editingIndex] : null

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center justify-between gap-3'>
        <FieldLabel className='mb-0'>主要问题</FieldLabel>
        <Button
          type='button'
          variant='outline'
          size='sm'
          disabled={disabled}
          onClick={() => {
            setEditingIndex(null)
            setDialogOpen(true)
          }}
        >
          <Plus />
          添加问题
        </Button>
      </div>
      {issues.length ? (
        <DragDropProvider onDragEnd={handleDragEnd}>
          <ItemGroup>
            {issues.map((issue, index) => (
              <SortableIssueRow
                key={issue.key}
                issue={issue}
                index={index}
                disabled={disabled}
                onEdit={() => {
                  setEditingIndex(index)
                  setDialogOpen(true)
                }}
                onRemove={() =>
                  onChange(issues.filter((_, issueIndex) => issueIndex !== index))
                }
              />
            ))}
          </ItemGroup>
        </DragDropProvider>
      ) : (
        <p className='text-muted-foreground text-sm'>还没有填写主要问题</p>
      )}
      <UserIssueDialog
        open={dialogOpen}
        onOpenChange={open => {
          setDialogOpen(open)
          if (!open) {
            setEditingIndex(null)
          }
        }}
        issue={editingIssue}
        nextPriority={issues.length + 1}
        onSubmit={async values => {
          if (editingIndex === null) {
            onChange([
              ...issues,
              {
                ...values,
                id: undefined,
                key: crypto.randomUUID()
              }
            ])
            return
          }

          onChange(
            issues.map((issue, index) =>
              index === editingIndex
                ? { ...issue, ...values, id: issue.id, key: issue.key }
                : issue
            )
          )
        }}
      />
    </div>
  )
}
