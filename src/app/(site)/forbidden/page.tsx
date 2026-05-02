import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ForbiddenPage() {
  return (
    <div className='mx-auto flex min-h-[60vh] w-full max-w-3xl items-center justify-center py-12'>
      <Card className='w-full'>
        <CardHeader className='gap-3'>
          <div className='flex items-center gap-3'>
            <div className='bg-destructive/10 text-destructive flex size-12 items-center justify-center rounded-full'>
              <ShieldAlert className='size-6' />
            </div>
            <CardTitle>没有访问权限</CardTitle>
          </div>
          <CardDescription>
            你已登录，但当前账号没有权限访问这个页面。请联系管理员开通权限，或返回其他可访问页面。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='border-border bg-muted/30 text-muted-foreground rounded-md border p-4 text-sm'>
            如果这是一个受角色控制的管理页面，通常需要管理员角色才能访问。
          </div>
        </CardContent>
        <CardFooter className='justify-end gap-2'>
          <Button variant='outline' asChild>
            <Link href='/'>返回首页</Link>
          </Button>
          <Button asChild>
            <Link href='/profile'>前往个人中心</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
