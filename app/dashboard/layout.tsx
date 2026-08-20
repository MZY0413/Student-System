'use client'

import { useEffect, useState, type ComponentType } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Brain,
  User,
  GraduationCap,
  BarChart3,
  FileText,
  ChevronDown,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

type NavItem = { href: string; label: string; icon: ComponentType<{ className?: string }> }
type NavGroup = { title: string; items: NavItem[] }

const studentNavGroups: NavGroup[] = [
  {
    title: '个人',
    items: [{ href: '/dashboard/profile', label: '个人基本资料', icon: User }],
  },
  {
    title: '学业',
    items: [
      { href: '/dashboard/grades', label: '成绩绩点', icon: GraduationCap },
      { href: '/dashboard/indicators', label: '考核指标', icon: FileText },
    ],
  },
]

const teacherNavGroups: NavGroup[] = [
  {
    title: '总览',
    items: [{ href: '/dashboard', label: '班级概览', icon: BarChart3 }],
  },
  {
    title: '管理',
    items: [
      { href: '/dashboard/students', label: '学生管理', icon: User },
      { href: '/dashboard/gpa', label: '学生绩点', icon: GraduationCap },
    ],
  },
]

function isItemActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard'
  return pathname === href || pathname.startsWith(`${href}/`)
}

// ── 移动端导航目录 ──────────────────────────────────────────────
function MobileNav({
  groups,
  pathname,
  onNavigate,
}: {
  groups: NavGroup[]
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <div className="space-y-6">
      {groups.map(group => (
        <div key={group.title} className="space-y-2">
          <div className="px-3 text-xs font-semibold tracking-wide text-muted-foreground">
            {group.title}
          </div>
          <div className="space-y-1">
            {group.items.map(item => {
              const Icon = item.icon
              const active = isItemActive(pathname, item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── 桌面端顶部导航 ──────────────────────────────────────────────
function DesktopNav({ groups, pathname }: { groups: NavGroup[]; pathname: string }) {
  return (
    <nav className="hidden lg:flex items-center gap-0.5 ml-6">
      {groups.map(group => {
        const activeInGroup = group.items.some(item => isItemActive(pathname, item.href))

        // 单个菜单项：直接跳转链接
        if (group.items.length === 1) {
          const item = group.items[0]
          const Icon = item.icon
          const active = isItemActive(pathname, item.href)
          return (
            <Link
              key={group.title}
              href={item.href}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/15 text-primary shadow-[0_0_12px_rgb(103_213_255_/_0.2)]'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          )
        }

        // 多个菜单项：下拉菜单
        return (
          <DropdownMenu key={group.title}>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  activeInGroup
                    ? 'bg-primary/15 text-primary shadow-[0_0_12px_rgb(103_213_255_/_0.2)]'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                {group.title}
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              {group.items.map(item => {
                const Icon = item.icon
                const active = isItemActive(pathname, item.href)
                return (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center gap-2.5 py-2 w-full',
                        active && 'text-primary font-medium'
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      })}
    </nav>
  )
}

// ── 仪表盘布局 ──────────────────────────────────────────────────
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // 路由守卫
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/')
    }
  }, [user, isLoading, router])

  // 移动端菜单打开时禁止 body 滚动
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const navGroups = user.role === 'teacher' ? teacherNavGroups : studentNavGroups

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* ═══ 顶部导航栏 ═══ */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/60 shadow-[0_12px_40px_rgb(0_0_0_/_0.24)] backdrop-blur-xl supports-[backdrop-filter]:bg-card/45">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          {/* 左侧：Logo + 桌面导航 */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
              <div className="p-1.5 bg-primary rounded-lg">
                <Brain className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground hidden sm:inline">AI 实验班</span>
            </Link>

            <DesktopNav groups={navGroups} pathname={pathname} />
          </div>

          {/* 右侧：通知 + 用户菜单 + 移动端汉堡按钮 */}
          <div className="flex items-center gap-1.5">
            {/* 移动端菜单按钮 */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              aria-label={mobileMenuOpen ? '关闭菜单' : '打开菜单'}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            {/* 用户菜单 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {user.name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm font-medium">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.role === 'teacher' ? '教师' : '学生'}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* 移动端导航面板 */}
        {mobileMenuOpen && (
          <nav className="lg:hidden border-t border-border bg-card/95 backdrop-blur-xl px-4 py-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <MobileNav groups={navGroups} pathname={pathname} onNavigate={() => setMobileMenuOpen(false)} />
          </nav>
        )}
      </header>

      {/* ═══ 主内容区 ═══ */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        {children}
      </main>
    </div>
  )
}
