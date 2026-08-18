'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  BookOpen,
  CalendarDays,
  GraduationCap,
  LineChart,
  ListChecks,
  Search,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react'
import {
  calculateGPA,
  getCourseGradeRecords,
  getCreditAnalysis,
  getRankingLeaderboard,
  scoreToGPA,
} from '@/lib/store'
import type {
  CourseGradeRecord,
  CreditAnalysis,
  GPASummary,
  RankingLeaderboard,
} from '@/lib/types'

function formatGPA(value?: number) {
  return value && value > 0 ? value.toFixed(2) : '-'
}

// 某一组课程的加权平均绩点（四分制）
function termGPA(records: CourseGradeRecord[]): number {
  const eligible = records.filter(record => record.totalScore !== undefined && record.examStatus !== '缓考')
  const totalCredits = eligible.reduce((sum, record) => sum + record.credit, 0)
  if (totalCredits === 0) return 0
  const weighted = eligible.reduce((sum, record) => (
    sum + scoreToGPA(record.totalScore, 'four') * record.credit
  ), 0)
  return Math.round((weighted / totalCredits) * 100) / 100
}

function shortTermLabel(academicYear: string, semester: string) {
  const year = academicYear.replace('学年', '')
  const term = semester === '第一学期' ? '上' : '下'
  return `${year} ${term}`
}

function rankEvaluation(percentAbove: number): string {
  if (percentAbove >= 90) return '名列前茅，继续保持！'
  if (percentAbove >= 60) return '表现优秀，稳中有进。'
  if (percentAbove >= 30) return '处于中上游，仍有提升空间。'
  return '仍需努力，关注薄弱科目。'
}

// ── 顶部统计卡片（图标在上方） ─────────────────────────────────
function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof GraduationCap
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
function InlineMetric({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof GraduationCap
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
function RankStatCard({
  icon: Icon,
  value,
  label,
  valueClassName,
}: {
  icon: typeof GraduationCap
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
function RankBadge({ rank }: { rank: number }) {
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

// ── 查询排名模块 ──────────────────────────────────────────────
function RankingModule({
  leaderboard,
  studentId,
}: {
  leaderboard: RankingLeaderboard
  studentId: string
}) {
  const [sortMode, setSortMode] = useState<'rank' | 'gpa'>('rank')

  // 榜单以绩点为唯一维度，【排名】与【绩点】的排序结果一致；保留切换以满足交互
  const entries = useMemo(() => (
    [...leaderboard.entries].sort((a, b) => b.gpa - a.gpa || a.studentName.localeCompare(b.studentName))
  ), [leaderboard])

  return (
    <div className="space-y-4">
      {/* 我的排名 */}
      <Card className="border-blue-500/25 bg-blue-500/10">
        <CardContent className="space-y-5 pt-6">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-blue-400" />
            <span className="font-semibold">我的排名</span>
          </div>
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="text-4xl font-bold text-foreground">{leaderboard.myRank || '-'}</span>
              <span className="ml-1 text-sm text-muted-foreground">/ {leaderboard.total || '-'}</span>
            </div>
            <div className="rounded-lg border border-border bg-card/60 px-4 py-2 text-right">
              <p className="text-xs text-muted-foreground">当学期平均绩点</p>
              <p className="text-2xl font-bold text-foreground">{formatGPA(leaderboard.myGPA)}</p>
            </div>
          </div>
          <div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-blue-500/20">
              <div className="h-full rounded-full bg-blue-400" style={{ width: `${leaderboard.percentAbove}%` }} />
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              超过本专业 <span className="font-semibold text-blue-400">{leaderboard.percentAbove}%</span> 的同学
              <span className="ml-1">· {rankEvaluation(leaderboard.percentAbove)}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 四个统计卡片 */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <RankStatCard icon={Users} value={`${leaderboard.total}`} label="参与" />
        <RankStatCard icon={ArrowUp} value={formatGPA(leaderboard.highestGPA)} label="最高" valueClassName="text-success" />
        <RankStatCard icon={BarChart3} value={formatGPA(leaderboard.averageGPA)} label="平均" valueClassName="text-warning" />
        <RankStatCard icon={ArrowDown} value={formatGPA(leaderboard.lowestGPA)} label="最低" valueClassName="text-destructive" />
      </div>

      {/* 榜单标题栏 */}
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

      {/* 绩点排行榜列表 */}
      <div className="space-y-2">
        {entries.map((entry, index) => {
          const isMe = entry.studentId === studentId
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
                  <span className="font-medium text-foreground">{entry.studentName}</span>
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

// ── 成绩表格（学分 / 绩点 / 分数） ─────────────────────────────
function GradeTable({ records }: { records: CourseGradeRecord[] }) {
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

export default function GradesPage() {
  const { user } = useAuth()
  const [records, setRecords] = useState<CourseGradeRecord[]>([])
  const [gpa, setGpa] = useState<GPASummary | null>(null)
  const [credit, setCredit] = useState<CreditAnalysis | null>(null)
  const [leaderboard, setLeaderboard] = useState<RankingLeaderboard | null>(null)
  const [rankingVisible, setRankingVisible] = useState(false)
  const rankingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user?.role !== 'student') return
    setRecords(getCourseGradeRecords(user.id))
    setGpa(calculateGPA(user.id, 'four'))
    setCredit(getCreditAnalysis(user.id))
    setLeaderboard(getRankingLeaderboard(user.id, 'four'))
  }, [user])

  // 已通过课程（计入课程数量 / 已修学期 / 已修学分）
  const passedRecords = useMemo(
    () => records.filter(record => record.examStatus === '通过' && record.totalScore !== undefined && record.totalScore >= 60),
    [records]
  )
  // 有成绩记录的课程（用于最高分 / 最低分）
  const scoredRecords = useMemo(
    () => records.filter(record => record.status === 'completed' && record.totalScore !== undefined),
    [records]
  )
  // 按学期分组的全部成绩
  const semesterGroups = useMemo(() => {
    const groups = new Map<string, { key: string; academicYear: string; semester: string; records: CourseGradeRecord[] }>()
    records
      .filter(record => record.status === 'completed')
      .forEach(record => {
        const key = `${record.academicYear}-${record.semester}`
        if (!groups.has(key)) {
          groups.set(key, { key, academicYear: record.academicYear, semester: record.semester, records: [] })
        }
        groups.get(key)!.records.push(record)
      })
    return Array.from(groups.values()).sort((a, b) => a.key.localeCompare(b.key))
  }, [records])

  const countedCourses = passedRecords.length
  const completedSemesters = new Set(passedRecords.map(record => `${record.academicYear}-${record.semester}`)).size
  const completionPercent = credit && credit.graduationRequiredCredits > 0
    ? Math.min(Math.round((credit.completedCredits / credit.graduationRequiredCredits) * 100), 100)
    : 0

  const highest = scoredRecords.reduce<CourseGradeRecord | null>(
    (max, record) => (!max || (record.totalScore ?? 0) > (max.totalScore ?? 0) ? record : max),
    null
  )
  const lowest = scoredRecords.reduce<CourseGradeRecord | null>(
    (min, record) => (!min || (record.totalScore ?? 0) < (min.totalScore ?? 0) ? record : min),
    null
  )

  const handleQueryRanking = () => {
    const next = !rankingVisible
    setRankingVisible(next)
    if (next) {
      setTimeout(() => rankingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
    }
  }

  if (user?.role !== 'student') {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          成绩绩点模块仅面向学生端展示。
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">成绩绩点</h1>
        <p className="text-muted-foreground">学生端成绩查询、绩点统计与学期排名</p>
      </div>

      {/* 顶部统计卡片 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard icon={GraduationCap} label="总 GPA" value={formatGPA(gpa?.cumulativeGPA)} />
        <MetricCard icon={BookOpen} label="已修学分" value={`${credit?.completedCredits ?? 0}`} />
      </div>

      {/* 大圆角容器：三栏指标 + 最高/最低分 */}
      <Card>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-3 gap-3">
            <InlineMetric icon={ListChecks} value={countedCourses} label="计入课程数量" />
            <InlineMetric icon={CalendarDays} value={completedSemesters} label="已修学期" />
            <InlineMetric icon={TrendingUp} value={`${completionPercent}%`} label="学业完成百分比" />
          </div>
          <div className="space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">最高分科目</span>
              <span className="text-right">
                {highest?.courseName ?? '-'}
                {highest && <span className="ml-1 font-semibold text-success">{highest.totalScore}分</span>}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">最低分科目</span>
              <span className="text-right">
                {lowest?.courseName ?? '-'}
                {lowest && <span className="ml-1 font-semibold text-destructive">{lowest.totalScore}分</span>}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 各学期平均绩点 */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center gap-2">
            <LineChart className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">各学期平均绩点</span>
          </div>
          {semesterGroups.length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无成绩记录</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {semesterGroups.map(group => (
                <div key={group.key} className="rounded-xl border border-border bg-card/40 p-4 text-center">
                  <p className="text-xs text-muted-foreground">{shortTermLabel(group.academicYear, group.semester)}</p>
                  <p className="mt-2 text-xl font-bold text-foreground">{formatGPA(termGPA(group.records))}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 查询排名按钮 */}
      <Button
        className="w-full bg-blue-500 text-white hover:bg-blue-600"
        onClick={handleQueryRanking}
      >
        <Search className="h-4 w-4" />
        {rankingVisible ? '收起排名' : '查询排名'}
      </Button>

      {/* 排名模块 */}
      {rankingVisible && leaderboard && (
        <div ref={rankingRef}>
          <RankingModule leaderboard={leaderboard} studentId={user.id} />
        </div>
      )}

      {/* 全部成绩（按学期分隔） */}
      <div className="space-y-4">
        {semesterGroups.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              暂无成绩记录
            </CardContent>
          </Card>
        ) : (
          semesterGroups.map(group => (
            <Card key={group.key}>
              <CardHeader>
                <CardTitle className="text-base">
                  {group.academicYear} · {group.semester}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">{group.records.length} 门</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GradeTable records={group.records} />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
