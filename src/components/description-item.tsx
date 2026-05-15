export default function DescriptionItem({
  label,
  value
}: {
  label?: string
  value: React.ReactNode
}) {
  return (
    <div className='flex flex-col gap-1'>
      {label && <span className='text-muted-foreground text-sm'>{label}</span>}
      <span className='text-foreground text-sm whitespace-pre-wrap'>
        {value}
      </span>
    </div>
  )
}
