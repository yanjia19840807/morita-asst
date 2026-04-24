import { cn } from '@/lib/utils'

export default function TableSelectionText({
  count,
  className
}: {
  count: number
  className?: string
}) {
  return (
    <div className={cn(className)}>
      <span className='text-muted-foreground text-sm'>已选 {count} 条</span>
    </div>
  )
}
