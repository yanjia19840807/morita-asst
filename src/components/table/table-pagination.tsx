import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '../ui/pagination'
import { getActivePage, getMaximumPage, getPaginationItems } from '@/lib/pagination'

interface TablePaginationProps {
  pageSize: number
  total: number
  className?: string
  page?: number
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
  const maximumPage = getMaximumPage(pageSize, total)
  const items = getPaginationItems(activePage, maximumPage)
  const canPrevious = activePage > 1
  const canNext = activePage < maximumPage

  const goToPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > maximumPage || nextPage === activePage) {
      return
    }

    setPage(nextPage)
  }

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href='#'
            text='上一页'
            aria-disabled={!canPrevious}
            className={canPrevious ? undefined : 'pointer-events-none opacity-50'}
            onClick={event => {
              event.preventDefault()
              if (canPrevious) {
                goToPage(activePage - 1)
              }
            }}
          />
        </PaginationItem>
        {items.map((item, index) =>
          item === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                href='#'
                isActive={activePage === item}
                onClick={event => {
                  event.preventDefault()
                  goToPage(item)
                }}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        <PaginationItem>
          <PaginationNext
            href='#'
            text='下一页'
            aria-disabled={!canNext}
            className={canNext ? undefined : 'pointer-events-none opacity-50'}
            onClick={event => {
              event.preventDefault()
              if (canNext) {
                goToPage(activePage + 1)
              }
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

export default TablePagination
