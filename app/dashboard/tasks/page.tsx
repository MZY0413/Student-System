'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import {
  getAssessmentIndicatorStats,
  getAssessmentIndicators,
  getTasks,
  getUsers,
  reviewAssessmentTask,
  submitAssessmentAttachment,
} from '@/lib/store'
import type { AssessmentIndicator, AssessmentIndicatorStats, AssessmentTask, TaskStatus, User } from '@/lib/types'
import {
  Award,
  BookOpenCheck,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Filter,
  Search,
  Upload,
  XCircle,
} from 'lucide-react'

const statusConfig: Record<TaskStatus, { label: string; className: string }> = {
  passed: {
    label: '已达标',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  reviewing: {
    label: '待审核',
    className: 'bg-muted text-muted-foreground border-border',
  },
  failed: {
    label: '未达标',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
  pending: {
    label: '未达标',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
}

export default function TasksPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<AssessmentTask[]>([])
  const [students, setStudents] = useState<User[]>([])
  const [indicators, setIndicators] = useState<AssessmentIndicator[]>([])
  const [indicatorStats, setIndicatorStats] = useState<AssessmentIndicatorStats[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<AssessmentTask | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formError, setFormError] = useState('')

  const loadTasks = useCallback(() => {
    const allTasks = getTasks()
    const studentUsers = getUsers().filter(item => item.role === 'student')
    setStudents(studentUsers)
    setIndicators(getAssessmentIndicators())
    setIndicatorStats(getAssessmentIndicatorStats())
    setTasks(user?.role === 'student' ? allTasks.filter(task => task.studentId === user.id) : allTasks)
  }, [user])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const getStudentName = (studentId: string) => {
    return students.find(student => student.id === studentId)?.name || '未知学生'
  }

  const getTask = (studentId: string, indicatorId: string) => {
    return tasks.find(task => task.studentId === studentId && task.indicatorId === indicatorId)
  }

  const filteredTasks = tasks.filter(task => {
    const studentName = getStudentName(task.studentId)
    const matchesSearch =
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studentName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const counts = {
    passed: tasks.filter(task => task.status === 'passed').length,
    reviewing: tasks.filter(task => task.status === 'reviewing').length,
    failed: tasks.filter(task => task.status === 'failed').length,
    pending: tasks.filter(task => task.status === 'pending').length,
  }

  const completionRate = tasks.length > 0 ? Math.round((counts.passed / tasks.length) * 100) : 0

  const handleUpload = async () => {
    if (!selectedTask || !selectedFile) {
      setFormError('请选择需要上传的附件')
      return
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setFormError('附件大小不能超过 5MB')
      return
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(new Error('文件读取失败'))
      reader.readAsDataURL(selectedFile)
    })

    submitAssessmentAttachment(selectedTask.id, {
      name: selectedFile.name,
      type: selectedFile.type || 'application/octet-stream',
      size: selectedFile.size,
      dataUrl,
    })
    setUploadDialogOpen(false)
    setSelectedTask(null)
    setSelectedFile(null)
    setFormError('')
    loadTasks()
  }

  const handleReview = (status: 'passed' | 'failed') => {
    if (!selectedTask || !user) return
    reviewAssessmentTask(selectedTask.id, status, user)
    setReviewDialogOpen(false)
    setSelectedTask(null)
    loadTasks()
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {user.role === 'teacher' ? '学业考核管理' : '学业考核任务'}
        </h1>
        <p className="text-muted-foreground">
          {user.role === 'teacher' ? '审核学生附件并查看班级各指标达标情况' : '按考核指标独立上传附件，等待老师审核确认'}
        </p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard title="已达标" value={counts.passed} icon={CheckCircle} className="text-emerald-600 bg-emerald-50" />
        <StatCard title="待审核" value={counts.reviewing} icon={Clock} className="text-slate-600 bg-slate-100" />
        <StatCard title="未达标" value={counts.pending + counts.failed} icon={XCircle} className="text-red-600 bg-red-50" />
        <StatCard title="达标率" value={`${completionRate}%`} icon={BookOpenCheck} className="text-primary bg-primary/10" />
      </div>

      {user.role === 'teacher' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">班级指标统计</CardTitle>
            <CardDescription>每项指标当前已达标人数 / 总人数</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {indicatorStats.map(item => {
                const rate = item.totalStudents > 0 ? Math.round((item.passedCount / item.totalStudents) * 100) : 0
                return (
                  <div key={item.indicatorId} className="rounded-lg border border-border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.passedCount}/{item.totalStudents} 人已达标</p>
                      </div>
                      <Award className="h-5 w-5 text-primary" />
                    </div>
                    <Progress value={rate} className="mt-4 h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={user.role === 'teacher' ? '搜索指标或学生...' : '搜索考核指标...'}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="筛选状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="pending">未达标</SelectItem>
            <SelectItem value="reviewing">待审核</SelectItem>
            <SelectItem value="passed">已达标</SelectItem>
            <SelectItem value="failed">不通过</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {user.role === 'student' ? (
        <StudentIndicatorGrid
          indicators={indicators}
          tasks={filteredTasks}
          onUpload={(task) => {
            setSelectedTask(task)
            setSelectedFile(null)
            setFormError('')
            setUploadDialogOpen(true)
          }}
        />
      ) : (
        <TeacherReviewBoard
          students={students}
          indicators={indicators}
          tasks={filteredTasks}
          getTask={getTask}
          onReview={(task) => {
            setSelectedTask(task)
            setReviewDialogOpen(true)
          }}
        />
      )}

      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>上传考核附件</DialogTitle>
            <DialogDescription>{selectedTask?.name}</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <FieldLabel>附件文件</FieldLabel>
              <Input
                type="file"
                onChange={(event) => {
                  setSelectedFile(event.target.files?.[0] ?? null)
                  setFormError('')
                }}
              />
            </Field>
          </FieldGroup>
          {formError && <p className="text-sm text-destructive">{formError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleUpload}>
              <Upload className="mr-1 h-4 w-4" />
              提交审核
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>审核考核附件</DialogTitle>
            <DialogDescription>
              {selectedTask?.name} - {selectedTask ? getStudentName(selectedTask.studentId) : ''}
            </DialogDescription>
          </DialogHeader>
          {selectedTask && <AttachmentInfo task={selectedTask} />}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={() => handleReview('failed')}>
              不通过
            </Button>
            <Button onClick={() => handleReview('passed')}>
              <CheckCircle className="mr-1 h-4 w-4" />
              确认达标
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  className,
}: {
  title: string
  value: number | string
  icon: typeof CheckCircle
  className: string
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={`rounded-lg p-3 ${className}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StudentIndicatorGrid({
  indicators,
  tasks,
  onUpload,
}: {
  indicators: AssessmentIndicator[]
  tasks: AssessmentTask[]
  onUpload: (task: AssessmentTask) => void
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {tasks.map(task => {
        const indicator = indicators.find(item => item.id === task.indicatorId)
        return (
          <Card key={task.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">{task.name}</CardTitle>
                  <CardDescription>{indicator?.description}</CardDescription>
                </div>
                <StatusBadge status={task.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <AttachmentInfo task={task} compact />
              <Button
                className="w-full"
                variant={task.status === 'passed' ? 'outline' : 'default'}
                onClick={() => onUpload(task)}
                disabled={task.status === 'passed'}
              >
                <Upload className="mr-1 h-4 w-4" />
                {task.attachmentName ? '重新上传附件' : '上传附件'}
              </Button>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function TeacherReviewBoard({
  students,
  indicators,
  tasks,
  getTask,
  onReview,
}: {
  students: User[]
  indicators: AssessmentIndicator[]
  tasks: AssessmentTask[]
  getTask: (studentId: string, indicatorId: string) => AssessmentTask | undefined
  onReview: (task: AssessmentTask) => void
}) {
  const visibleStudentIds = new Set(tasks.map(task => task.studentId))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">学生完成状态</CardTitle>
        <CardDescription>按学生和考核指标查看附件提交与审核状态</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[860px] rounded-lg border border-border">
            <div className="grid grid-cols-[120px_repeat(4,minmax(180px,1fr))] border-b border-border bg-muted/40">
              <div className="p-3 text-sm font-medium text-foreground">学生</div>
              {indicators.map(indicator => (
                <div key={indicator.id} className="p-3 text-sm font-medium text-foreground">
                  {indicator.name}
                </div>
              ))}
            </div>
            {students.filter(student => visibleStudentIds.has(student.id)).map(student => (
              <div key={student.id} className="grid grid-cols-[120px_repeat(4,minmax(180px,1fr))] border-b border-border last:border-b-0">
                <div className="p-3 font-medium text-foreground">{student.name}</div>
                {indicators.map(indicator => {
                  const task = getTask(student.id, indicator.id)
                  if (!task) return <div key={indicator.id} className="p-3 text-sm text-muted-foreground">-</div>
                  return (
                    <div key={indicator.id} className="space-y-2 p-3">
                      <StatusBadge status={task.status} />
                      <p className="truncate text-xs text-muted-foreground">
                        {task.attachmentName || '未上传附件'}
                      </p>
                      {task.status === 'reviewing' && (
                        <Button size="sm" onClick={() => onReview(task)}>
                          审核确认
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: TaskStatus }) {
  const config = statusConfig[status]
  return (
    <Badge variant="outline" className={config.className}>
      {status === 'passed' && <CheckCircle className="mr-1 h-3 w-3" />}
      {status === 'reviewing' && <Clock className="mr-1 h-3 w-3" />}
      {(status === 'pending' || status === 'failed') && <XCircle className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  )
}

function AttachmentInfo({ task, compact = false }: { task: AssessmentTask; compact?: boolean }) {
  if (!task.attachmentName) {
    return (
      <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
        <FileText className="mb-2 h-5 w-5" />
        暂未上传附件
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{task.attachmentName}</p>
          <p className="text-xs text-muted-foreground">
            {task.submittedAt ? `提交时间：${task.submittedAt}` : '已提交附件'}
          </p>
          {!compact && task.reviewedByName && (
            <p className="text-xs text-muted-foreground">
              审核老师：{task.reviewedByName} {task.reviewedAt ? `· ${task.reviewedAt}` : ''}
            </p>
          )}
        </div>
        {task.attachmentDataUrl && (
          <Button size="icon" variant="ghost" asChild>
            <a href={task.attachmentDataUrl} download={task.attachmentName} aria-label="下载附件">
              <Download className="h-4 w-4" />
            </a>
          </Button>
        )}
      </div>
    </div>
  )
}
