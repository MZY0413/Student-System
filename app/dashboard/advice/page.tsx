'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getAcademicAdvice } from '@/lib/store'
import type { AcademicAdvice, AcademicAdviceType } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageSquareQuote, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'

const TYPE_CONFIG: Record<AcademicAdviceType, { label: string; className: string }> = {
  success: { label: '表扬', className: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' },
  warning: { label: '提醒', className: 'bg-amber-500/15 text-amber-600 border-amber-500/30' },
  info: { label: '建议', className: 'bg-blue-500/15 text-blue-600 border-blue-500/30' },
}

function formatDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function AdvicePage() {
  const { user } = useAuth()
  const [advice, setAdvice] = useState<AcademicAdvice[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.role !== 'student') return
    let cancelled = false
    ;(async () => {
      const list = await getAcademicAdvice(user.id)
      if (!cancelled) {
        setAdvice(list)
        setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [user])

  if (user?.role !== 'student') {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          学业建议模块仅面向学生端展示。
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">学业建议</h1>
        <p className="text-muted-foreground">老师为你发送的学业指导与学习建议</p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            加载中...
          </CardContent>
        </Card>
      ) : advice.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
            <MessageSquareQuote className="h-10 w-10 opacity-40" />
            <p>暂无学业建议</p>
            <p className="text-sm">老师向你发送建议后会显示在这里</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {advice.map(item => {
            const config = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.info
            return (
              <Card key={item.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="outline" className={cn('border', config.className)}>
                      {config.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                    {item.content}
                  </p>
                  <div className="mt-4 flex items-center gap-2 border-t border-border pt-3 text-sm text-muted-foreground">
                    <UserRound className="h-4 w-4" />
                    <span>{item.teacherName || '老师'}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
