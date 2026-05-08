import Link from 'next/link'
import { buttonVariants } from '../ui/button'
import { ArrowLeft } from 'lucide-react'

export default function AuthHeader() {
  return (
    <div className='flex py-4'>
      <Link
        href='/'
        className={buttonVariants({
          variant: 'ghost'
        })}
      >
        <ArrowLeft size={4} />
        返回
      </Link>
    </div>
  )
}
