import Link from 'next/link'
import { BookOpen, Bot, Database } from 'lucide-react'
import { LandingCta } from '@/components/layout/landing-cta'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const workspaceEntries = [
  {
    title: '助手',
    description: '创建和管理对话助手',
    href: '/agents',
    icon: Bot
  },
  {
    title: '知识库',
    description: '整理案例与资料',
    href: '/knowledges',
    icon: Database
  },
  {
    title: '文档',
    description: '上传并检索文档',
    href: '/docs',
    icon: BookOpen
  }
]

export default function Home() {
  return (
    <div className='mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center gap-12 py-16'>
      <section className='flex flex-col gap-6'>
        <div className='space-y-3'>
          <p className='text-muted-foreground text-sm'>云天助手</p>
          <h1 className='text-4xl tracking-tight'>
            真实案例，加上森田疗法的智慧
          </h1>
          <p className='text-muted-foreground max-w-2xl text-base leading-7'>
            让你知道：你并不孤单。顺其自然，为所当为。
          </p>
        </div>
        <LandingCta />
      </section>

      <section className='grid gap-4 md:grid-cols-3'>
        {workspaceEntries.map(item => {
          const Icon = item.icon

          return (
            <Link key={item.href} href={item.href} className='block'>
              <Card>
                <CardHeader>
                  <div className='bg-accent text-primary flex size-10 items-center justify-center rounded-xl'>
                    <Icon className='size-5' />
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </section>
    </div>
  )
}
