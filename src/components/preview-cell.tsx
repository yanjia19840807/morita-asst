export default function PreviewCell({ value }: { value: string | null }) {
  if (!value) {
    return <span className='text-muted-foreground'>-</span>
  }

  return (
    <div
      className='w-full min-w-0 overflow-hidden wrap-break-word whitespace-pre-wrap'
      title={value}
    >
      <div className='line-clamp-4 wrap-break-word'>{value}</div>
    </div>
  )
}
