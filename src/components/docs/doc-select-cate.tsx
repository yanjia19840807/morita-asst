'use client'

import { useQuery } from '@tanstack/react-query'
import { docCatesQueryKey, fetchSelectDocCates } from '@/lib/api/client/doc'
import { getErrorMessage } from '@/lib/api/shared/response'
import { cn } from '@/lib/utils'
import { FieldContent, FieldLabel, FieldTitle } from '@/components/ui/field'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem
} from '../layout/sidebar'

interface DocCatePickerProps {
  selectedCategoryId?: string
  onSelectCategory: (id: string) => void
  disabled?: boolean
}

export function DocSelectCate({
  selectedCategoryId,
  onSelectCategory,
  disabled = false
}: DocCatePickerProps) {
  const catesQuery = useQuery({
    queryKey: docCatesQueryKey,
    queryFn: fetchSelectDocCates
  })

  const categories = catesQuery.data ?? []
  const error = catesQuery.error ? getErrorMessage(catesQuery.error) : null

  return (
    <Sidebar collapsible='none' className='flex w-56 border-r'>
      <SidebarHeader>
        <FieldLabel>
          <FieldTitle>类目</FieldTitle>
        </FieldLabel>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className='min-h-0 flex-1'>
          <SidebarGroupContent className='h-full'>
            <SidebarMenu>
              <FieldContent className='space-y-2'>
                {error ? (
                  <div className='text-destructive text-sm'>{error}</div>
                ) : null}
                {categories.map(category => (
                  <SidebarMenuItem key={category.id}>
                    <button
                      type='button'
                      className={cn(
                        'text-muted-foreground hover:text-foreground w-full text-left text-sm transition-colors disabled:pointer-events-none disabled:opacity-50',
                        selectedCategoryId === category.id &&
                          'text-foreground font-medium'
                      )}
                      onClick={() => onSelectCategory(category.id)}
                      disabled={disabled}
                    >
                      {category.name}
                    </button>
                  </SidebarMenuItem>
                ))}
              </FieldContent>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
