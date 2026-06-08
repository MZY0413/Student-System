'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  getUsers,
  getClassStats,
  getTasks,
  calculateGPA,
} from '@/lib/store'
import type { User, ClassStats, AssessmentTask } from '@/lib/types'
import {
  Users,
  GraduationCap,
  ClipboardList,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react'

export default function TeacherDashboard() {
  const [students, setStudents] = useState<User[]>([])
  const [classStats, setClassStats] = useState<ClassStats | null>(null)
  const [recentTasks, setRecentTasks] = useState<AssessmentTask[]>([])
  const [studentGPAs, setStudentGPAs] = useState<Record<string, number>>({})

  useEffect(() => {
    const users = getUsers()
    const studentUsers = users.filter(u => u.role === 'student')
    setStudents(studentUsers)

    const stats = getClassStats()
    setClassStats(stats)

    const tasks = getTasks()
    const reviewing = tasks.filter(t => t.status === 'reviewing').slice(0, 5)
    setRecentTasks(reviewing)

    const gpas: Record<string, number> = {}
    studentUsers.forEach(student => {
      const { totalGPA } = calculateGPA(student.id)
      gpas[student.id] = totalGPA
    })
    setStudentGPAs(gpas)
  }, [])

  const statusConfig = {
    passed: { label: '已通过', color: 'bg-success text-success-foreground', icon: CheckCircle },
    reviewing: { label: '待审核', color: 'bg-warning text-warning-foreground', icon: Clock },
    failed: { label: '未通过', color: 'bg-destructive text-destructive-foreground', icon: XCircle },
    pending: { label: '未完成', color: 'bg-muted text-muted-foreground', icon: AlertCircle },
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">班级概览</h1>
        <p className="text-muted-foreground">人工智能实验班学情统计</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">班级人数</p>
                <p className="text-2xl font-bold text-foreground">
                  {classStats?.totalStudents || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <GraduationCap className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">平均成绩</p>
                <p className="text-2xl font-bold text-foreground">
                  {classStats?.averageGPA || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-lg">
                <ClipboardList className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">任务完成率</p>
                <p className="text-2xl font-bold text-foreground">
                  {classStats?.completionRate || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-lg">
                <TrendingUp className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">任务通过率</p>
                <p className="text-2xl font-bold text-foreground">
                  {classStats?.passRate || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 学生列表 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">学生列表</CardTitle>
              <CardDescription>点击查看详细信息</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/students">
                查看全部
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {students.map(student => (
                <Link
                  key={student.id}
                  href={`/dashboard/students/${student.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {student.name.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{student.name}</p>
                      <p className="text-sm text-muted-foreground">{student.username}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{studentGPAs[student.id] || 0}</p>
                    <p className="text-xs text-muted-foreground">平均分</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 待审核任务 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg">待审核任务</CardTitle>
              <CardDescription>学生提交的任务等待审核</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/tasks">
                查看全部
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                暂无待审核任务
              </div>
            ) : (
              <div className="space-y-4">
                {recentTasks.map(task => {
                  const student = students.find(s => s.id === task.studentId)
                  const config = statusConfig[task.status]
                  return (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{task.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{student?.name || '未知学生'}</span>
                          <span>·</span>
                          <span>{task.course}</span>
                        </div>
                      </div>
                      <Badge className={config.color}>
                        {config.label}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 班级整体完成情况 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">班级学情统计</CardTitle>
          <CardDescription>各项考核指标完成情况</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-foreground">任务完成率</span>
                <span className="text-sm text-muted-foreground">{classStats?.completionRate || 0}%</span>
              </div>
              <Progress value={classStats?.completionRate || 0} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-foreground">任务通过率</span>
                <span className="text-sm text-muted-foreground">{classStats?.passRate || 0}%</span>
              </div>
              <Progress value={classStats?.passRate || 0} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-foreground">平均成绩占比</span>
                <span className="text-sm text-muted-foreground">{classStats?.averageGPA || 0}/100</span>
              </div>
              <Progress value={classStats?.averageGPA || 0} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
