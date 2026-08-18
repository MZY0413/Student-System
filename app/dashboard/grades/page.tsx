'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BookOpen,
  CalendarDays,
  GraduationCap,
  LineChart,
  ListChecks,
  Search,
  TrendingUp,
} from 'lucide-react'
import {
  calculateGPA,
  getCourseGradeRecords,
  getCreditAnalysis,
  getAllSemesters,
  getCurrentSemesterKey,
  getRankingLeaderboard,
  getStudentSemesterGPAs,
} from '@/lib/store'
import type {
  CourseGradeRecord,
  CreditAnalysis,
  GPASummary,
  RankingLeaderboard,
  SemesterGPA,
} from '@/lib/types'
import {
  formatGPA,
  GradeTable,
  InlineMetric,
  MetricCard,
  MyRankCard,
  RankingBoard,
  shortTermLabel,
} from '@/components/dashboard/gpa-shared'

export default function GradesPage() {
  const { user } = useAuth()
  const [records, setRecords] = useState<CourseGradeRecord[]>([])
  const [gpa, setGpa] = useState<GPASummary | null>(null)
  const [credit, setCredit] = useState<CreditAnalysis | null>(null)
  const [semesterGPAs, setSemesterGPAs] = useState<SemesterGPA[]>([])
  const [semesters, setSemesters] = useState<{ key: string; academicYear: string; semester: string }[]>([])
  const [selectedSemester, setSelectedSemester] = useState('')
  const [leaderboard, setLeaderboard] = useState<RankingLeaderboard | null>(null)
  const [rankingVisible, setRankingVisible] = useState(false)
  const rankingRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (user?.role !== 'student') return
    let cancelled = false
    ;(async () => {
      const [records, gpa, credit, semesterGPAs, all] = await Promise.all([
        getCourseGradeRecords(user.id),
        calculateGPA(user.id, 'four'),
        getCreditAnalysis(user.id),
        getStudentSemesterGPAs(user.id),
        getAllSemesters(),
      ])
      if (cancelled) return
      setRecords(records)
      setGpa(gpa)
      setCredit(credit)
      setSemesterGPAs(semesterGPAs)
      setSemesters(all)
      const currentKey = getCurrentSemesterKey()
      setSelectedSemester(all.some(s => s.key === currentKey) ? currentKey : (all[all.length - 1]?.key ?? ''))
    })()
    return () => { cancelled = true }
  }, [user])

  useEffect(() => {
    if (user?.role !== 'student' || !selectedSemester) return
    let cancelled = false
    ;(async () => {
      const leaderboard = await getRankingLeaderboard(user.id, selectedSemester)
      if (!cancelled) setLeaderboard(leaderboard)
    })()
    return () => { cancelled = true }
  }, [selectedSemester, user])

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
          {semesterGPAs.length === 0 ? (
            <p className="text-sm text-muted-foreground">暂无成绩记录</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {semesterGPAs.map(sg => (
                <div key={sg.key} className="rounded-xl border border-border bg-card/40 p-4 text-center">
                  <p className="text-xs text-muted-foreground">{shortTermLabel(sg.academicYear, sg.semester)}</p>
                  <p className="mt-2 text-xl font-bold text-foreground">{formatGPA(sg.gpa)}</p>
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
        <div ref={rankingRef} className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-semibold">统计学期</span>
            <Select value={selectedSemester} onValueChange={setSelectedSemester}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="选择学期" />
              </SelectTrigger>
              <SelectContent>
                {semesters.map(s => (
                  <SelectItem key={s.key} value={s.key}>{s.academicYear} · {s.semester}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <MyRankCard
            myRank={leaderboard.myRank}
            myGPA={leaderboard.myGPA}
            total={leaderboard.total}
            percentAbove={leaderboard.percentAbove}
          />
          <RankingBoard entries={leaderboard.entries} studentId={user.id} anonymous />
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
