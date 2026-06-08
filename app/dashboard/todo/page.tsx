'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  getTodoItems,
  getTasksByStudentId,
} from '@/lib/store'
import type { TodoItem, AssessmentTask } from '@/lib/types'
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  CalendarDays,
} from 'lucide-react'

export default function TodoPage() {
  const { user } = useAuth()
  const [todoItems, setTodoItems] = useState<TodoItem[]>([])
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<AssessmentTask[]>([])

  useEffect(() => {
    if (user) {
      const items = getTodoItems(user.id)
      setTodoItems(items)

      // 获取最近7天内的截止任务
      const tasks = getTasksByStudentId(user.id)
      const today = new Date()
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      const upcoming = tasks.filter(task => {
        const deadline = new Date(task.deadline)
        return deadline >= today && deadline <= nextWeek && task.status === 'pending'
      }).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      setUpcomingDeadlines(upcoming)
    }
  }, [user])

  const priorityConfig = {
    high: { label: '紧急', color: 'bg-destructive text-destructive-foreground', icon: AlertTriangle },
    medium: { label: '中等', color: 'bg-warning text-warning-foreground', icon: Clock },
    low: { label: '普通', color: 'bg-muted text-muted-foreground', icon: CheckCircle2 },
  }

  const getDaysLeft = (deadline: string) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const daysLeft = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (daysLeft < 0) return '已过期'
    if (daysLeft === 0) return '今天截止'
    if (daysLeft === 1) return '明天截止'
    return `${daysLeft} 天后截止`
  }

  // 按日期分组
  const groupedTasks = upcomingDeadlines.reduce((groups, task) => {
    const date = task.deadline
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(task)
    return groups
  }, {} as Record<string, AssessmentTask[]>)

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">学业待办</h1>
        <p className="text-muted-foreground">管理您的考核任务和截止日期</p>
      </div>

      {/* 统计概览 */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-destructive/10 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">紧急任务</p>
                <p className="text-2xl font-bold text-foreground">
                  {todoItems.filter(t => t.priority === 'high').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-lg">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">待完成</p>
                <p className="text-2xl font-bold text-foreground">
                  {todoItems.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <CalendarDays className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">本周截止</p>
                <p className="text-2xl font-bold text-foreground">
                  {upcomingDeadlines.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 待办清单 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              待办清单
            </CardTitle>
            <CardDescription>
              按优先级排序的待完成任务
            </CardDescription>
          </CardHeader>
          <CardContent>
            {todoItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                太棒了！暂无待办任务
              </div>
            ) : (
              <div className="space-y-3">
                {todoItems.map(item => {
                  const config = priorityConfig[item.priority]
                  const PriorityIcon = config.icon
                  return (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                    >
                      <Checkbox className="mt-1" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground truncate">
                            {item.taskName}
                          </span>
                          <Badge className={config.color}>
                            <PriorityIcon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            {item.course}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {getDaysLeft(item.deadline)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 日程视图 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              近期日程
            </CardTitle>
            <CardDescription>
              未来7天内的任务截止日期
            </CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(groupedTasks).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                本周暂无截止任务
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedTasks).map(([date, tasks]) => (
                  <div key={date}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="font-medium text-foreground">{date}</span>
                      <span className="text-sm text-muted-foreground">
                        ({getDaysLeft(date)})
                      </span>
                    </div>
                    <div className="ml-4 space-y-2">
                      {tasks.map(task => (
                        <div
                          key={task.id}
                          className="p-3 rounded-lg bg-muted/30 border-l-2 border-primary"
                        >
                          <p className="font-medium text-foreground">{task.name}</p>
                          <p className="text-sm text-muted-foreground">{task.course}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 提示信息 */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-1">学业提醒</h4>
              <p className="text-sm text-muted-foreground">
                建议提前2-3天开始准备考核任务，确保有足够时间完成和修改。如有问题，请及时联系老师或在问题反馈中提交咨询。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
