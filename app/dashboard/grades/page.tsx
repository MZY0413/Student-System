'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AlertTriangle,
  Award,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  ListFilter,
} from 'lucide-react'
import {
  calculateGPA,
  getAcademicRankings,
  getCourseGradeRecords,
  getCreditAnalysis,
  scoreToGPA,
} from '@/lib/store'
import type {
  AcademicRankings,
  CourseGradeRecord,
  CreditAnalysis,
  GPAScale,
  GPASummary,
  RankingScope,
} from '@/lib/types'

const PAGE_SIZE = 6

const scaleLabel: Record<GPAScale, string> = {
  four: '四分制',
  five: '五分制',
  hundred: '百分制',
}

const rankingScopeLabel: Record<RankingScope, string> = {
  term: '本学期 GPA',
  year: '学年 GPA',
  cumulative: '累计 GPA',
}

const statusStyle = {
  通过: 'bg-success/12 text-success border-success/30',
  不及格: 'bg-destructive/12 text-destructive border-destructive/30',
  缺考: 'bg-destructive/12 text-destructive border-destructive/30',
  缓考: 'bg-warning/12 text-warning-foreground border-warning/30',
}

function formatScore(value?: number) {
  return value === undefined ? '-' : value
}

function formatGPA(value?: number) {
  return value && value > 0 ? value.toFixed(2) : '-'
}

function getArchiveKey(record: CourseGradeRecord) {
  return `${record.academicYear}-${record.semester}`
}

function GradeTable({
  records,
  scale,
  showRemediation = false,
}: {
  records: CourseGradeRecord[]
  scale: GPAScale
  showRemediation?: boolean
}) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>课程名称</TableHead>
            <TableHead className="text-center">课程属性</TableHead>
            <TableHead className="text-center">学分</TableHead>
            <TableHead className="text-center">平时成绩</TableHead>
            <TableHead className="text-center">期末成绩</TableHead>
            <TableHead className="text-center">综合总分</TableHead>
            <TableHead className="text-center">课程绩点</TableHead>
            <TableHead className="text-center">考核状态</TableHead>
            {showRemediation && <TableHead className="text-center">补考 / 重修状态</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showRemediation ? 9 : 8} className="h-24 text-center text-muted-foreground">
                暂无成绩记录
              </TableCell>
            </TableRow>
          ) : (
            records.map(record => {
              const isWarning = record.examStatus !== '通过'
              return (
                <TableRow key={`${record.studentId}-${record.courseId}`} className={isWarning ? 'bg-destructive/5' : undefined}>
                  <TableCell className="font-medium">{record.courseName}</TableCell>
                  <TableCell className="text-center">{record.courseAttribute}</TableCell>
                  <TableCell className="text-center">{record.credit}</TableCell>
                  <TableCell className="text-center">{formatScore(record.regularScore)}</TableCell>
                  <TableCell className="text-center">{formatScore(record.finalScore)}</TableCell>
                  <TableCell className="text-center font-semibold">{formatScore(record.totalScore)}</TableCell>
                  <TableCell className="text-center">{formatGPA(scoreToGPA(record.totalScore, scale))}</TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className={statusStyle[record.examStatus]}>
                      {record.examStatus}
                    </Badge>
                  </TableCell>
                  {showRemediation && (
                    <TableCell className="text-center font-medium text-destructive">
                      {record.remediationStatus}
                    </TableCell>
                  )}
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string
  value: string
  icon: typeof GraduationCap
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 pt-6">
        <div className="rounded-md bg-primary/10 p-3 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function RankingCard({
  title,
  rank,
  total,
}: {
  title: string
  rank: number
  total: number
}) {
  return (
    <div className="rounded-md border border-border p-4">
      <p className="text-sm text-muted-foreground">{title}</p>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-3xl font-bold text-primary">{rank || '-'}</span>
        <span className="pb-1 text-sm text-muted-foreground">/ {total || '-'}</span>
      </div>
    </div>
  )
}

function CreditProgress({
  label,
  value,
  target,
  met,
}: {
  label: string
  value: number
  target: number
  met?: boolean
}) {
  const percent = target > 0 ? Math.min(Math.round((value / target) * 100), 100) : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{label}</span>
          {met !== undefined && (
            <Badge variant="outline" className={met ? 'border-success/30 text-success' : 'border-warning/30 text-warning-foreground'}>
              {met ? '已达标' : '未达标'}
            </Badge>
          )}
        </div>
        <span className="text-sm text-muted-foreground">
          {value}/{target} 学分
        </span>
      </div>
      <Progress value={percent} className="h-2" />
    </div>
  )
}

export default function GradesPage() {
  const { user } = useAuth()
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [records, setRecords] = useState<CourseGradeRecord[]>([])
  const [gpaScale, setGpaScale] = useState<GPAScale>('four')
  const [gpaData, setGpaData] = useState<GPASummary | null>(null)
  const [rankScope, setRankScope] = useState<RankingScope>('cumulative')
  const [rankings, setRankings] = useState<AcademicRankings | null>(null)
  const [creditAnalysis, setCreditAnalysis] = useState<CreditAnalysis | null>(null)
  const [archiveFilter, setArchiveFilter] = useState('all')
  const [archivePage, setArchivePage] = useState(1)

  const loadStudentData = useCallback((studentId: string, scale: GPAScale, scope: RankingScope) => {
    setRecords(getCourseGradeRecords(studentId))
    setGpaData(calculateGPA(studentId, scale))
    setRankings(getAcademicRankings(studentId, scope, scale))
    setCreditAnalysis(getCreditAnalysis(studentId))
  }, [])

  useEffect(() => {
    setSelectedStudentId(user?.role === 'student' ? user.id : '')
  }, [user])

  useEffect(() => {
    if (selectedStudentId) {
      loadStudentData(selectedStudentId, gpaScale, rankScope)
      setArchivePage(1)
    }
  }, [selectedStudentId, gpaScale, rankScope, loadStudentData])

  const completedRecords = records.filter(record => record.status === 'completed')
  const warningRecords = completedRecords.filter(record => ['不及格', '缺考', '缓考'].includes(record.examStatus))
  const archiveOptions = useMemo(() => {
    const unique = Array.from(new Set(completedRecords.map(getArchiveKey)))
    return unique.sort((a, b) => b.localeCompare(a))
  }, [completedRecords])
  const archivedRecords = archiveFilter === 'all'
    ? completedRecords
    : completedRecords.filter(record => getArchiveKey(record) === archiveFilter)
  const archiveTotalPages = Math.max(Math.ceil(archivedRecords.length / PAGE_SIZE), 1)
  const archivePageRecords = archivedRecords.slice((archivePage - 1) * PAGE_SIZE, archivePage * PAGE_SIZE)

  useEffect(() => {
    setArchivePage(page => Math.min(page, archiveTotalPages))
  }, [archiveTotalPages])

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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">成绩绩点</h1>
          <p className="text-muted-foreground">学生端成绩查询、绩点统计、排名与学分完成情况</p>
        </div>
        <div className="w-full sm:w-40">
          <Select value={gpaScale} onValueChange={value => setGpaScale(value as GPAScale)}>
            <SelectTrigger>
              <SelectValue placeholder="绩点标准" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="four">四分制</SelectItem>
              <SelectItem value="five">五分制</SelectItem>
              <SelectItem value="hundred">百分制</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="平均学分绩点 GPA" value={formatGPA(gpaData?.comprehensiveGPA)} icon={GraduationCap} />
        <StatCard title="本学期 GPA" value={formatGPA(gpaData?.currentTermGPA)} icon={BookOpen} />
        <StatCard title="学年 GPA" value={formatGPA(gpaData?.academicYearGPA)} icon={BarChart3} />
        <StatCard title="累计总 GPA" value={formatGPA(gpaData?.cumulativeGPA)} icon={Award} />
      </div>

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList className="h-auto w-full flex-wrap justify-start">
          <TabsTrigger value="current">本学期成绩</TabsTrigger>
          <TabsTrigger value="archive">历史成绩归档</TabsTrigger>
          <TabsTrigger value="warning">不及格 / 挂科预警</TabsTrigger>
          <TabsTrigger value="ranking">排名与学情分析</TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-primary" />
                本学期成绩查看
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GradeTable records={completedRecords} scale={gpaScale} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archive">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ListFilter className="h-5 w-5 text-primary" />
                  历史成绩归档
                </CardTitle>
                <Select
                  value={archiveFilter}
                  onValueChange={value => {
                    setArchiveFilter(value)
                    setArchivePage(1)
                  }}
                >
                  <SelectTrigger className="w-full lg:w-56">
                    <SelectValue placeholder="按学年 + 学期筛选" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部学年学期</SelectItem>
                    {archiveOptions.map(option => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <GradeTable records={archivePageRecords} scale={gpaScale} />
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  第 {archivePage} / {archiveTotalPages} 页，共 {archivedRecords.length} 门课程
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={archivePage <= 1}
                    onClick={() => setArchivePage(page => Math.max(page - 1, 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    上一页
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={archivePage >= archiveTotalPages}
                    onClick={() => setArchivePage(page => Math.min(page + 1, archiveTotalPages))}
                  >
                    下一页
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warning">
          <Card className="border-destructive/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg text-destructive">
                <AlertTriangle className="h-5 w-5" />
                不及格 / 缺考 / 缓考课程
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GradeTable records={warningRecords} scale={gpaScale} showRemediation />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ranking">
          <div className="grid gap-6 xl:grid-cols-[1fr_1.25fr]">
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Award className="h-5 w-5 text-primary" />
                    学业排名
                  </CardTitle>
                  <Select value={rankScope} onValueChange={value => setRankScope(value as RankingScope)}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="排名范围" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="term">本学期 GPA</SelectItem>
                      <SelectItem value="year">学年 GPA</SelectItem>
                      <SelectItem value="cumulative">累计 GPA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md bg-muted/50 p-4">
                  <p className="text-sm text-muted-foreground">{user?.name} 当前按 {rankingScopeLabel[rankScope]} 排名</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">
                    {formatGPA(rankings?.scopeGPA)} <span className="text-sm font-normal text-muted-foreground">{scaleLabel[gpaScale]}</span>
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <RankingCard title="专业内排名" rank={rankings?.majorRank ?? 0} total={rankings?.majorTotal ?? 0} />
                  <RankingCard title="班级排名" rank={rankings?.classRank ?? 0} total={rankings?.classTotal ?? 0} />
                  <RankingCard title="同年级排名" rank={rankings?.gradeRank ?? 0} total={rankings?.gradeTotal ?? 0} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  成绩数据分析
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-md border border-border p-4">
                    <p className="text-sm text-muted-foreground">已修学分</p>
                    <p className="mt-1 text-3xl font-bold text-foreground">{creditAnalysis?.completedCredits ?? 0}</p>
                  </div>
                  <div className="rounded-md border border-border p-4">
                    <p className="text-sm text-muted-foreground">剩余毕业学分</p>
                    <p className="mt-1 text-3xl font-bold text-foreground">{creditAnalysis?.remainingGraduationCredits ?? 0}</p>
                  </div>
                </div>
                {creditAnalysis && (
                  <div className="space-y-5">
                    <CreditProgress
                      label="毕业总学分进度"
                      value={creditAnalysis.completedCredits}
                      target={creditAnalysis.graduationRequiredCredits}
                    />
                    <CreditProgress
                      label="必修学分达标情况"
                      value={creditAnalysis.requiredCredits}
                      target={creditAnalysis.requiredTargetCredits}
                      met={creditAnalysis.requiredMet}
                    />
                    <CreditProgress
                      label="选修学分达标情况"
                      value={creditAnalysis.electiveCredits}
                      target={creditAnalysis.electiveTargetCredits}
                      met={creditAnalysis.electiveMet}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
