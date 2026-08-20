'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Brain, GraduationCap, Users } from 'lucide-react'

const CUC_EMBLEM = '/中国传媒大学校徽-放大版.png'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!/^\d{6}$/.test(password)) {
      setError('密码为 6 位数字')
      return
    }
    setIsLoading(true)

    try {
      const user = await login(username, password)
      if (user) {
        router.push('/dashboard')
      } else {
        setError('用户名或密码错误')
      }
    } catch {
      setError('登录失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 py-12">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-warning/12 rounded-full blur-3xl" />
      </div>

      {/* 校徽与标题 */}
      <div className="relative z-10 text-center mb-8">
        <div className="flex flex-col items-center justify-center gap-4 mb-4 sm:flex-row sm:gap-6">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-white/25 bg-white/95 shadow-lg shadow-accent/20">
            <Image
              src={CUC_EMBLEM}
              alt="中国传媒大学校徽"
              fill
              priority
              sizes="80px"
              className="object-contain p-1"
            />
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium text-accent">中国传媒大学</p>
            <h1 className="text-3xl font-bold text-foreground">AI 实验班</h1>
          </div>
        </div>
        <p className="text-muted-foreground text-lg">学生个人画像与学业管理系统</p>
      </div>

      {/* 登录卡片 */}
      <Card className="relative z-10 w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="mb-4 flex justify-center">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border border-white/25 bg-white/95 p-1 shadow-md shadow-accent/15 ring-1 ring-border/60">
              <Image
                src={CUC_EMBLEM}
                alt="中国传媒大学校徽"
                fill
                sizes="112px"
                className="object-contain p-1"
              />
            </div>
          </div>
          <CardTitle className="text-xl">欢迎登录</CardTitle>
          <CardDescription>请输入您的账号信息</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username">学号 / 工号</FieldLabel>
                <Input
                  id="username"
                  type="text"
                  placeholder="请输入学号或工号"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">密码</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="请输入 6 位数字密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value.replace(/\D/g, ''))}
                  required
                  autoComplete="current-password"
                />
              </Field>
            </FieldGroup>

            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg text-center">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Spinner className="mr-2" /> : null}
              {isLoading ? '登录中...' : '登录'}
            </Button>
          </form>

          {/* 测试账号提示 */}
          <div className="mt-6 p-4 bg-muted/45 rounded-lg border border-border/70">
            <p className="text-sm font-medium text-muted-foreground mb-2">测试账号：</p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                <span>学生：学号 / 学号后六位（如 202511173001 → 173001）</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>教师：工号 / 工号后六位</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 功能特性 */}
      <div className="relative z-10 mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full px-4">
        <FeatureCard
          icon={<Brain className="w-6 h-6" />}
          title="个人画像"
          description="展示学生技能、兴趣和项目经历"
        />
        <FeatureCard
          icon={<GraduationCap className="w-6 h-6" />}
          title="学业管理"
          description="考核任务跟踪与绩点计算"
        />
        <FeatureCard
          icon={<Users className="w-6 h-6" />}
          title="权限管理"
          description="学生与教师分角色管理"
        />
      </div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="text-center p-4">
      <div className="inline-flex items-center justify-center p-2 bg-accent/10 rounded-lg text-accent mb-3 ring-1 ring-accent/20">
        {icon}
      </div>
      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
