'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
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
  TrendingUp,
} from 'lucide-react'
import {
  calculateGPA,
  getCourseGradeRecords,
  getCreditAnalysis,
  getAllSemesters,
  getCurrentSemesterKey,
  getSemesterRanking,
  getStudentSemesterGPAs,
  getUsers,
} from '@/lib/store'
import type {
  CourseGradeRecord,
  CreditAnalysis,
  GPASummary,
  RankingLeaderboardEntry,
  SemesterGPA,
  User,
} from '@/lib/types'
import {
  formatGPA,
  GradeTable,
  InlineMetric,
  MetricCard,
  RankingBoard,
  shortTermLabel,
} from '@/components/dashboard/gpa-shared'

export default function TeacherGpaPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [students, setStudents] = useState<User[]>([])
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [records, setRecords] = useState<CourseGradeRecord[]>([])
  const [gpa, setGpa] = useState<GPASummary | null>(null)
  const [credit, setCredit] = useState<CreditAnalysis | null>(null)
  const [semesterGPAs, setSemesterGPAs] = useState<SemesterGPA[]>([])
  const [semesters, setSemesters] = useState<{ key: string; academicYear: string; semester: string }[]>([])
  const [rankSemester, setRankSemester] = useState('')
  const [ranking, setRanking] = useState<RankingLeaderboardEntry[]>([])

  // 路由守卫
  useEffect(() => {
    if (!isLoading && user && user.role !== 'teacher') router.replace('/dashboard')
  }, [isLoading, user, router])

  // 初始化学生列表与学期
  useEffect(() => {
    if (user?.role !== 'teacher') return
    const list = getUsers().filter(u => u.role === 'student')
    setStudents(list)
    const fromParam = searchParams.get('studentId')
    setSelectedStudentId(fromParam && list.some(s => s.id === fromParam) ? fromParam : (list[0]?.id ?? ''))

    const all = getAllSemesters()
    setSemesters(all)
    const currentKey = getCurrentSemesterKey()
    const defaultSemester = all.some(s => s.key === currentKey) ? currentKey : (all[all.length - 1]?.key ?? '')
    setRankSemester(defaultSemester)
  }, [user, searchParams])

  // 加载选中学生的成绩数据
  useEffect(() => {
    if (user?.role !== 'teacher' || !selectedStudentId) return
    setRecords(getCourseGradeRecords(selectedStudentId))
    setGpa(calculateGPA(selectedStudentId, 'four'))
    setCredit(getCreditAnalysis(selectedStudentId))
    setSemesterGPAs(getStudentSemesterGPAs(selectedStudentId))
  }, [selectedStudentId, user])

  // 排名学期切换
  useEffect(() => {
    if (user?.role === 'teacher' && rankSemester) {
      setRanking(getSemesterRanking(rankSemester))
    }
  }, [rankSemester, user])

  // 已通过课程 / 有成绩课程 / 按学期分组
  const passedRecords = useMemo(
    () => records.filter(record => record.examStatus === '通过' && record.totalScore !== undefined && record.totalScore >= 60),
    [records]
  )
  const scoredRecords = useMemo(
    () => records.filter(record => record.status === 'completed' && record.totalScore !== undefined),
    [records]
  )
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

  if (isLoading || !user) return null
  if (user.role !== 'teacher') return null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">学生绩点</h1>
          <p className="text-muted-foreground">查看任一学生的各学期绩点与班级绩点排名</p>
        </div>
        <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="选择学生" />
          </SelectTrigger>
          <SelectContent>
            {students.map(student => (
              <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 选中学生成绩概况 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard icon={GraduationCap} label="总 GPA" value={formatGPA(gpa?.cumulativeGPA)} />
        <MetricCard icon={BookOpen} label="已修学分" value={`${credit?.completedCredits ?? 0}`} />
      </div>

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

      {/* 班级绩点排名（含姓名） */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-semibold">班级绩点排名</span>
            <Select value={rankSemester} onValueChange={setRankSemester}>
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
          {ranking.length === 0 ? (
            <p className="text-sm text-muted-foreground">该学期暂无成绩排名</p>
          ) : (
            <RankingBoard entries={ranking} />
          )}
        </CardContent>
      </Card>

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
