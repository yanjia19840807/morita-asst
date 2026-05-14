export default function FieldDetail({
  label,
  children
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className='flex flex-1 items-center gap-3'>
      <div className='w-32 shrink-0 text-sm leading-6 font-medium'>{label}</div>
      <div className='text-muted-foreground min-w-0 flex-1 text-sm leading-6'>
        {children}
      </div>
    </div>
  )
}
