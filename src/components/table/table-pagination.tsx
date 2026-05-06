import React from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '../ui/pagination'
import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getActivePage, getMaximumPage, getPagesToShow } from '@/lib/pagination'

interface TablePaginationProps {
  pageSize: number
  total: number
  className?: string
  page: number
  setPage: (page: number) => void
}

export function TablePagination({
  pageSize,
  setPage,
  page,
  total,
  className
}: TablePaginationProps) {
  const activePage = getActivePage(page, pageSize, total)
  const maximumSize = getMaximumPage(pageSize, total)
  const totalPagesToShow = 5
  const pagesToShow = getPagesToShow(maximumSize, activePage, totalPagesToShow)

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            text='上页'
            isActive={activePage > 1}
            className={cn(
              activePage === 1 && 'text-foreground/45 pointer-events-none'
            )}
            onClick={() => activePage > 1 && setPage(activePage - 1)}
          >
            <ChevronLeft />
          </PaginationPrevious>
        </PaginationItem>
        {pagesToShow.map(value => (
          <PaginationItem key={value}>
            <PaginationLink
              isActive={activePage === value}
              aria-current={activePage === value ? 'page' : undefined}
              onClick={value <= maximumSize ? () => setPage(value) : undefined}
              className={cn(
                value > maximumSize && 'text-foreground/45 pointer-events-none'
              )}
            >
              {value}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            text='下页'
            isActive={activePage < maximumSize}
            className={cn(
              activePage === maximumSize &&
                'text-foreground/45 pointer-events-none'
            )}
            onClick={() => activePage < maximumSize && setPage(activePage + 1)}
          >
            <ChevronRight />
          </PaginationNext>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export default TablePagination
