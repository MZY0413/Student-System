'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import * as echarts from 'echarts'
import { useAuth } from '@/lib/auth-context'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
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
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Download,
  GraduationCap,
  TrendingUp,
} from 'lucide-react'
import { getCurriculumProgressOverview } from '@/lib/store'
import type {
  CurriculumCourseRecord,
  CurriculumCourseStatus,
  CurriculumProgressOverview,
} from '@/lib/types'

const statusConfig: Record<CurriculumCourseStatus, { label: string; className: string; color: string }> = {
  passed: { label: '已修通过', className: 'border-success/30 bg-success/10 text-success', color: '#16a34a' },
  studying: { label: '在读中', className: 'border-blue-500/30 bg-blue-500/10 text-blue-600', color: '#2563eb' },
  notStarted: { label: '未修', className: 'border-muted bg-muted text-muted-foreground', color: '#94a3b8' },
  retaking: { label: '挂科需重修', className: 'border-destructive/30 bg-destructive/10 text-destructive', color: '#dc2626' },
}

const statusOrder: CurriculumCourseStatus[] = ['passed', 'studying', 'retaking', 'notStarted']

function EChart({ option, className }: { option: echarts.EChartsOption; className: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return
    const chart = echarts.init(ref.current)
    chart.setOption(option)
    const resize = () => chart.resize()
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      chart.dispose()
    }
  }, [option])

  return <div ref={ref} className={className} />
}

function StatusBadge({ status, insufficient }: { status: CurriculumCourseStatus; insufficient?: boolean }) {
  if (insufficient) {
    return <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning-foreground">选修学分不足</Badge>
  }
  const config = statusConfig[status]
  return <Badge variant="outline" className={config.className}>{config.label}</Badge>
}

function getFilteredCourses(
  courses: CurriculumCourseRecord[],
  filters: { attribute: string; status: string; semester: string }
) {
  return courses.filter(course => {
    const attributeMatch = filters.attribute === 'all' || course.courseAttribute === filters.attribute
    const statusMatch = filters.status === 'all' || course.status === filters.status
    const semesterMatch = filters.semester === 'all' || course.suggestedSemester === filters.semester
    return attributeMatch && statusMatch && semesterMatch
  })
}

function getModuleBarOption(module: CurriculumProgressOverview['modules'][number]): echarts.EChartsOption {
  const totalCredits = Math.max(
    statusOrder.reduce((sum, status) => sum + module.statusCredits[status], 0),
    module.requiredCredits,
    1
  )

  return {
    animation: false,
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
    xAxis: { type: 'value', max: totalCredits, show: false },
    yAxis: { type: 'category', data: [''], show: false },
    series: statusOrder.map(status => ({
      type: 'bar',
      stack: 'curriculum',
      barWidth: 12,
      emphasis: { disabled: true },
      data: [module.statusCredits[status]],
      itemStyle: { color: statusConfig[status].color },
    })),
  }
}

export default function CoursesPage() {
  const { user } = useAuth()
  const [overview, setOverview] = useState<CurriculumProgressOverview | null>(null)
  const [openModules, setOpenModules] = useState<Record<number, boolean>>({ 1: true })
  const [filters, setFilters] = useState({ attribute: 'all', status: 'all', semester: 'all' })

  useEffect(() => {
    if (!user) return
    let alive = true
    Promise.resolve(getCurriculumProgressOverview(user.id)).then(data => {
      if (alive) setOverview(data)
    })
    return () => {
      alive = false
    }
  }, [user])

  const semesters = useMemo(() => {
    if (!overview) return []
    return Array.from(new Set(overview.modules.flatMap(module => module.courses.map(course => course.suggestedSemester))))
      .sort((a, b) => Number(a.split('-')[0]) - Number(b.split('-')[0]))
  }, [overview])

  const ringOption = useMemo<echarts.EChartsOption>(() => ({
    series: [{
      type: 'pie',
      radius: ['72%', '90%'],
      avoidLabelOverlap: false,
      label: { show: false },
      data: overview ? [
        { value: overview.totalCompletedCredits, itemStyle: { color: '#16a34a' } },
        { value: Math.max(overview.totalRequiredCredits - overview.totalCompletedCredits, 0), itemStyle: { color: '#e5e7eb' } },
      ] : [],
    }],
  }), [overview])

  const pieOption = useMemo<echarts.EChartsOption>(() => ({
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, textStyle: { color: '#64748b' } },
    series: [{
      type: 'pie',
      radius: ['42%', '72%'],
      data: overview?.modules.map(module => ({ name: module.name, value: module.requiredCredits })) ?? [],
    }],
  }), [overview])

  const handleExportPdf = () => {
    window.print()
  }

  if (!overview) {
    return (
      <div className="flex min-h-[360px] items-center justify-center text-muted-foreground">
        正在加载课程培养方案进度...
      </div>
    )
  }

  const hasRedWarning = overview.warnings.some(warning => warning.level === 'red')
  const statusTone = overview.graduationStatus === '已达标'
    ? 'text-success'
    : hasRedWarning
      ? 'text-destructive'
      : 'text-warning-foreground'

  return (
    <div className="space-y-6 print:bg-white">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">课程培养方案进度一览</h1>
          <p className="text-muted-foreground">中国传媒大学人工智能本科专业标准培养方案</p>
        </div>
        <Button onClick={handleExportPdf} className="w-full sm:w-auto">
          <Download className="h-4 w-4" />
          导出PDF
        </Button>
      </div>

      <Card className="min-h-52">
        <CardContent className="grid gap-6 pt-6 lg:grid-cols-[18rem_1fr]">
          <div className="relative h-44">
            <EChart option={ringOption} className="h-44 w-full" />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-foreground">{overview.totalPercent}%</span>
              <span className="text-sm text-muted-foreground">{overview.totalCompletedCredits}/{overview.totalRequiredCredits} 学分</span>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-md border border-border p-4">
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle2 className={`h-5 w-5 ${statusTone}`} />
                <span className="text-sm text-muted-foreground">毕业达标状态</span>
              </div>
              <p className={`text-2xl font-bold ${statusTone}`}>{overview.graduationStatus}</p>
              <p className="mt-2 text-xs text-muted-foreground">当前年级应完成约 {overview.expectedPercent}%</p>
            </div>
            <div className="rounded-md border border-border p-4">
              <div className="mb-3 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">剩余必修学分</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{overview.remainingRequiredCredits}</p>
            </div>
            <div className="rounded-md border border-border p-4">
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-sm text-muted-foreground">剩余选修学分</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{overview.remainingElectiveCredits}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="min-h-[70vh] space-y-4">
        {overview.modules.map(module => {
          const filteredCourses = getFilteredCourses(module.courses, filters)
          return (
            <Collapsible
              key={module.moduleId}
              open={openModules[module.moduleId] ?? false}
              onOpenChange={open => setOpenModules(prev => ({ ...prev, [module.moduleId]: open }))}
            >
              <Card>
                <CollapsibleTrigger asChild>
                  <button className="w-full text-left">
                    <CardHeader className="space-y-4">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <ChevronDown className={`h-4 w-4 transition-transform ${(openModules[module.moduleId] ?? false) ? '' : '-rotate-90'}`} />
                          {module.name}
                        </CardTitle>
                        <div className="text-sm text-muted-foreground">
                          {module.completedCredits}/{module.requiredCredits} 学分 · {module.percent}%
                        </div>
                      </div>
                      <EChart option={getModuleBarOption(module)} className="h-4 w-full overflow-hidden rounded-full bg-muted" />
                      <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                        <span>必修完成率 {module.required.percent}%（{module.required.completedCredits}/{module.required.requiredCredits} 学分）</span>
                        <span>选修完成率 {module.elective.percent}%（{module.elective.completedCredits}/{module.elective.requiredCredits} 学分）</span>
                      </div>
                    </CardHeader>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4">
                    <div className="grid gap-3 md:grid-cols-3">
                      <Select value={filters.attribute} onValueChange={value => setFilters(prev => ({ ...prev, attribute: value }))}>
                        <SelectTrigger><SelectValue placeholder="课程属性" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部属性</SelectItem>
                          <SelectItem value="必修">必修</SelectItem>
                          <SelectItem value="选修">选修</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filters.status} onValueChange={value => setFilters(prev => ({ ...prev, status: value }))}>
                        <SelectTrigger><SelectValue placeholder="修读状态" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部状态</SelectItem>
                          <SelectItem value="passed">已修通过</SelectItem>
                          <SelectItem value="studying">在读中</SelectItem>
                          <SelectItem value="notStarted">未修</SelectItem>
                          <SelectItem value="retaking">挂科需重修</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={filters.semester} onValueChange={value => setFilters(prev => ({ ...prev, semester: value }))}>
                        <SelectTrigger><SelectValue placeholder="建议学期" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">全部学期</SelectItem>
                          {semesters.map(semester => <SelectItem key={semester} value={semester}>{semester}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>课程名称</TableHead>
                            <TableHead className="text-center">课程属性</TableHead>
                            <TableHead className="text-center">学分</TableHead>
                            <TableHead className="text-center">建议学期</TableHead>
                            <TableHead className="text-center">修读状态</TableHead>
                            <TableHead className="text-center">成绩</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredCourses.map(course => (
                            <TableRow key={course.courseId}>
                              <TableCell className="font-medium">
                                {course.courseName}
                                {course.isCore && <Badge variant="outline" className="ml-2">核心课</Badge>}
                              </TableCell>
                              <TableCell className="text-center">{course.courseAttribute}</TableCell>
                              <TableCell className="text-center">{course.credit}</TableCell>
                              <TableCell className="text-center">{course.suggestedSemester}</TableCell>
                              <TableCell className="text-center">
                                <StatusBadge status={course.status} insufficient={course.courseAttribute === '选修' && module.elective.isInsufficient && course.status === 'notStarted'} />
                              </TableCell>
                              <TableCell className="text-center">{course.totalScore ?? '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">五大模块学分占比</CardTitle>
          </CardHeader>
          <CardContent>
            <EChart option={pieOption} className="h-80 w-full" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-warning" />
              智能预警提示
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overview.warnings.length === 0 ? (
              <div className="rounded-md border border-success/30 bg-success/10 p-4 text-sm text-success">
                当前培养方案进度正常，暂无预警事项。
              </div>
            ) : overview.warnings.map(warning => (
              <div
                key={warning.id}
                className={`rounded-md border p-4 text-sm ${
                  warning.level === 'red'
                    ? 'border-destructive/30 bg-destructive/10 text-destructive'
                    : 'border-warning/30 bg-warning/10 text-warning-foreground'
                }`}
              >
                {warning.message}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
