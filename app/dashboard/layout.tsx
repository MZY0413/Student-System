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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { getUnreadNotifications, markAllHelpNotificationsRead, markNotificationRead } from '@/lib/store'
import {
  Brain,
  User,
  ClipboardList,
  GraduationCap,
  GitBranch,
  BarChart3,
  MessageSquare,
  Handshake,
  BookOpen,
  Calendar,
  Bell,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
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
      { href: '/dashboard/tasks', label: '考核任务', icon: ClipboardList },
      { href: '/dashboard/grades', label: '成绩绩点', icon: GraduationCap },
      { href: '/dashboard/courses', label: '课程培养方案进度一览', icon: GitBranch },
      { href: '/dashboard/help', label: '学业互助', icon: Handshake },
      { href: '/dashboard/todo', label: '学业待办', icon: Calendar },
    ],
  },
  {
    title: '服务',
    items: [
      { href: '/dashboard/feedback', label: '问题反馈', icon: MessageSquare },
      { href: '/dashboard/resources', label: '资源库', icon: BookOpen },
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
      { href: '/dashboard/tasks', label: '考核管理', icon: ClipboardList },
      { href: '/dashboard/feedback', label: '反馈处理', icon: MessageSquare },
    ],
  },
]

function isItemActive(pathname: string, href: string) {
  if (href === '/dashboard') return pathname === '/dashboard'
  return pathname === href || pathname.startsWith(`${href}/`)
}

function NavDirectory({
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

function CollapsibleSidebar({
  groups,
  pathname,
}: {
  groups: NavGroup[]
  pathname: string
}) {
  const [isPinnedOpen, setIsPinnedOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.map(group => [group.title, true]))
  )
  const expanded = isPinnedOpen || isHovered
  const isFloatingOpen = expanded && !isPinnedOpen

  useEffect(() => {
    setOpenGroups(prev => {
      const next = { ...prev }
      groups.forEach(group => {
        const activeInGroup = group.items.some(item => isItemActive(pathname, item.href))
        if (next[group.title] === undefined || activeInGroup) next[group.title] = true
      })
      return next
    })
  }, [groups, pathname])

  return (
    <aside
      className={cn(
        'relative hidden shrink-0 transition-[width] duration-200 ease-out lg:block',
        isPinnedOpen ? 'w-64' : 'w-18'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          'sticky top-16 z-40 h-[calc(100vh-4rem)] overflow-hidden border-r border-border bg-card/70 p-3 shadow-[inset_-1px_0_0_rgb(255_255_255_/_0.04)] backdrop-blur-xl transition-[width,box-shadow] duration-200 ease-out',
          expanded ? 'w-64' : 'w-18',
          isFloatingOpen && 'shadow-xl'
        )}
      >
        <div className="mb-3 flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setIsPinnedOpen(open => !open)}
            aria-label={isPinnedOpen ? '收起侧边栏' : '展开侧边栏'}
          >
            {expanded ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </Button>
        </div>

        <nav className="space-y-2">
          {groups.map(group => {
            const isOpen = openGroups[group.title] ?? true
            const activeInGroup = group.items.some(item => isItemActive(pathname, item.href))
            const FirstIcon = group.items[0]?.icon

            return (
              <Collapsible
                key={group.title}
                open={expanded ? isOpen : true}
                onOpenChange={open => setOpenGroups(prev => ({ ...prev, [group.title]: open }))}
              >
                {expanded && (
                  <CollapsibleTrigger asChild>
                    <button
                      className={cn(
                        'flex h-10 w-full items-center justify-between rounded-lg px-3 text-sm font-medium transition-colors',
                        activeInGroup
                          ? 'text-foreground'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        {FirstIcon && <FirstIcon className="h-4 w-4 shrink-0" />}
                        <span className="truncate text-left">{group.title}</span>
                      </span>
                      <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform', isOpen ? 'rotate-0' : '-rotate-90')} />
                    </button>
                  </CollapsibleTrigger>
                )}
                <CollapsibleContent>
                  <div className={cn('mt-1 space-y-1', expanded ? 'pl-2' : 'pl-0')}>
                    {group.items.map(item => {
                      const Icon = item.icon
                      const active = isItemActive(pathname, item.href)
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          title={!expanded ? item.label : undefined}
                          className={cn(
                            'flex h-10 items-center rounded-lg text-sm font-medium transition-colors',
                            expanded ? 'gap-2 px-3' : 'justify-center px-0',
                            active
                              ? 'bg-primary text-primary-foreground shadow-sm'
                              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          {expanded && <span className="truncate">{item.label}</span>}
                        </Link>
                      )
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/')
    }
  }, [user, isLoading, router])

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

  const unreadNotifications = getUnreadNotifications(user.id)
    .filter(n => n.type === 'help_post_answered' || n.type === 'help_mentioned')

  return (
    <div className="min-h-screen bg-transparent">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/60 shadow-[0_12px_40px_rgb(0_0_0_/_0.24)] backdrop-blur-xl supports-[backdrop-filter]:bg-card/45">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="p-1.5 bg-primary rounded-lg">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground hidden sm:inline">AI 实验班</span>
          </Link>

          <div className="hidden lg:block" />

          {/* 用户菜单 */}
          <div className="flex items-center gap-2">
            {/* 移动端菜单按钮 */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            {/* 通知 */}
            <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadNotifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                      {unreadNotifications.length > 99 ? '99+' : unreadNotifications.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="px-2 py-1.5 flex items-center justify-between">
                  <p className="text-sm font-medium">通知</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    disabled={unreadNotifications.length === 0}
                    onClick={() => markAllHelpNotificationsRead(user.id)}
                  >
                    全部已读
                  </Button>
                </div>
                <DropdownMenuSeparator />
                {unreadNotifications.length === 0 ? (
                  <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                    暂无未读通知
                  </div>
                ) : (
                  unreadNotifications.slice(0, 8).map(n => (
                    <DropdownMenuItem
                      key={n.id}
                      className="flex flex-col items-start gap-1 py-2"
                      onClick={() => {
                        markNotificationRead(n.id, user.id)
                        setNotifOpen(false)
                        router.push(n.targetPath ?? '/dashboard/help')
                      }}
                    >
                      <div className="w-full flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">{n.title}</span>
                        <span className="text-xs text-muted-foreground">{n.createdAt}</span>
                      </div>
                      <span className="text-xs text-muted-foreground line-clamp-2">{n.content}</span>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

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

        {/* 移动端导航菜单 */}
        {mobileMenuOpen && (
          <nav className="lg:hidden border-t border-border bg-card px-4 py-4">
            <NavDirectory groups={navGroups} pathname={pathname} onNavigate={() => setMobileMenuOpen(false)} />
          </nav>
        )}
      </header>

      <div className="mx-auto flex max-w-7xl">
        <CollapsibleSidebar groups={navGroups} pathname={pathname} />

        {/* 主内容区 */}
        <main className="flex-1 px-4 py-6">
          {children}
        </main>
      </div>
    </div>
  )
}
