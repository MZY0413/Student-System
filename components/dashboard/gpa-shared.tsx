'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { scoreToGPA } from '@/lib/store'
import type { CourseGradeRecord, RankingLeaderboardEntry } from '@/lib/types'
import { ArrowDown, ArrowUp, BarChart3, Trophy, Users } from 'lucide-react'

export function formatGPA(value?: number) {
  return value && value > 0 ? value.toFixed(2) : '-'
}

export function shortTermLabel(academicYear: string, semester: string) {
  const year = academicYear.replace('学年', '')
  const term = semester === '第一学期' ? '上' : '下'
  return `${year} ${term}`
}

export function rankEvaluation(percentAbove: number): string {
  if (percentAbove >= 90) return '名列前茅，继续保持！'
  if (percentAbove >= 60) return '表现优秀，稳中有进。'
  if (percentAbove >= 30) return '处于中上游，仍有提升空间。'
  return '仍需努力，关注薄弱科目。'
}

// ── 顶部统计卡片（图标在上方） ─────────────────────────────────
export function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Trophy
  label: string
  value: string
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 pt-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-bold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

// ── 大容器内横向三栏指标 ──────────────────────────────────────
export function InlineMetric({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Trophy
  value: string | number
  label: string
}) {
  return (
    <div className="flex flex-col items-center gap-1 text-center">
      <Icon className="h-5 w-5 text-primary" />
      <span className="text-2xl font-bold text-foreground">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

// ── 排名统计小卡片 ────────────────────────────────────────────
export function RankStatCard({
  icon: Icon,
  value,
  label,
  valueClassName,
}: {
  icon: typeof Trophy
  value: string
  label: string
  valueClassName?: string
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-1 pt-6 text-center">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className={cn('text-xl font-bold text-foreground', valueClassName)}>{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </CardContent>
    </Card>
  )
}

// ── 名次标识 ──────────────────────────────────────────────────
export function RankBadge({ rank }: { rank: number }) {
  const style = rank === 1
    ? 'bg-amber-400 text-amber-950'
    : rank === 2
      ? 'bg-slate-300 text-slate-800'
      : rank === 3
        ? 'bg-amber-600 text-amber-50'
        : 'bg-secondary text-muted-foreground'
  return (
    <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold', style)}>
      {rank}
    </div>
  )
}

// ── 成绩表格（学分 / 绩点 / 分数） ─────────────────────────────
export function GradeTable({ records }: { records: CourseGradeRecord[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>课程名称</TableHead>
          <TableHead className="text-center">学分</TableHead>
          <TableHead className="text-center">绩点</TableHead>
          <TableHead className="text-center">分数</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map(record => (
          <TableRow key={`${record.studentId}-${record.courseId}`}>
            <TableCell>
              <div className="font-medium">{record.courseName}</div>
              <div className="mt-0.5 text-xs text-blue-400">{record.creditRequirement}</div>
            </TableCell>
            <TableCell className="text-center">{record.credit}</TableCell>
            <TableCell className="text-center">{formatGPA(scoreToGPA(record.totalScore, 'four'))}</TableCell>
            <TableCell className="text-center font-semibold">{record.totalScore ?? '-'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// ── 我的排名（学生端） ────────────────────────────────────────
export function MyRankCard({ myRank, myGPA, total, percentAbove }: {
  myRank: number
  myGPA: number
  total: number
  percentAbove: number
}) {
  return (
    <Card className="border-blue-500/25 bg-blue-500/10">
      <CardContent className="space-y-5 pt-6">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-blue-400" />
          <span className="font-semibold">我的排名</span>
        </div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="text-4xl font-bold text-foreground">{myRank || '-'}</span>
            <span className="ml-1 text-sm text-muted-foreground">/ {total || '-'}</span>
          </div>
          <div className="rounded-lg border border-border bg-card/60 px-4 py-2 text-right">
            <p className="text-xs text-muted-foreground">学期平均绩点</p>
            <p className="text-2xl font-bold text-foreground">{formatGPA(myGPA)}</p>
          </div>
        </div>
        <div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-blue-500/20">
            <div className="h-full rounded-full bg-blue-400" style={{ width: `${percentAbove}%` }} />
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            超过本专业 <span className="font-semibold text-blue-400">{percentAbove}%</span> 的同学
            <span className="ml-1">· {rankEvaluation(percentAbove)}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// ── 排行榜（统计卡片 + 榜单） ─────────────────────────────────
export function RankingBoard({
  entries,
  studentId,
  anonymous,
}: {
  entries: RankingLeaderboardEntry[]
  studentId?: string
  anonymous?: boolean
}) {
  const [sortMode, setSortMode] = useState<'rank' | 'gpa'>('rank')

  const sorted = [...entries].sort((a, b) => b.gpa - a.gpa || a.studentName.localeCompare(b.studentName))
  const valid = sorted.map(entry => entry.gpa).filter(gpa => gpa > 0)
  const total = sorted.length
  const highestGPA = valid.length ? Math.max(...valid) : 0
  const lowestGPA = valid.length ? Math.min(...valid) : 0
  const averageGPA = valid.length ? Math.round((valid.reduce((sum, gpa) => sum + gpa, 0) / valid.length) * 100) / 100 : 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <RankStatCard icon={Users} value={`${total}`} label="参与" />
        <RankStatCard icon={ArrowUp} value={formatGPA(highestGPA)} label="最高" valueClassName="text-success" />
        <RankStatCard icon={BarChart3} value={formatGPA(averageGPA)} label="平均" valueClassName="text-warning" />
        <RankStatCard icon={ArrowDown} value={formatGPA(lowestGPA)} label="最低" valueClassName="text-destructive" />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">全榜</span>
        <div className="flex gap-1 rounded-lg bg-secondary p-1">
          <button
            type="button"
            onClick={() => setSortMode('rank')}
            className={cn(
              'rounded-md px-3 py-1 text-sm transition-colors',
              sortMode === 'rank' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            排名
          </button>
          <button
            type="button"
            onClick={() => setSortMode('gpa')}
            className={cn(
              'rounded-md px-3 py-1 text-sm transition-colors',
              sortMode === 'gpa' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            绩点
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {sorted.map((entry, index) => {
          const isMe = studentId ? entry.studentId === studentId : false
          const rank = index + 1
          return (
            <div
              key={entry.studentId}
              className={cn(
                'flex items-center gap-3 rounded-xl border p-3',
                isMe ? 'border-blue-400/60 bg-blue-500/10' : 'border-border bg-card/40'
              )}
            >
              <RankBadge rank={rank} />
              <div className="flex flex-1 items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {!anonymous && <span className="font-medium text-foreground">{entry.studentName}</span>}
                  {isMe && (
                    <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-xs font-medium text-blue-400">
                      我
                    </span>
                  )}
                </div>
                <span className="text-lg font-bold text-foreground">{formatGPA(entry.gpa)}</span>
              </div>
              <span className="shrink-0 text-xs text-muted-foreground">{entry.date}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
