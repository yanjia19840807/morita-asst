import { z } from 'zod'

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  searchField: z.string().optional(),
  searchValue: z.string().optional()
})

export type PaginationParams = z.infer<typeof paginationSchema>
