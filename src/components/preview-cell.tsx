export default function PreviewCell({ value }: { value: string | null }) {
  if (!value) {
    return <span className='text-muted-foreground'>-</span>
  }

  return (
    <div
      className='max-w-[24rem] min-w-56 wrap-break-word whitespace-pre-wrap'
      title={value}
    >
      <div className='line-clamp-4'>{value}</div>
    </div>
  )
}
