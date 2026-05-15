export default function InfoItem({
  label,
  value
}: {
  label?: string
  value: React.ReactNode
}) {
  return (
    <div className='flex flex-col gap-1'>
      {label && <span className='text-muted-foreground text-sm'>{label}</span>}
      <span className='text-foreground text-sm font-medium'>{value}</span>
    </div>
  )
}
