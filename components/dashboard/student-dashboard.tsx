'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  getProfiles,
  getUsers,
  calculateGPA,
  generateAdvice,
  getTasksByStudentId,
} from '@/lib/store'
import type { StudentProfile, User, AcademicAdvice } from '@/lib/types'
import {
  Code,
  Lightbulb,
  Briefcase,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react'

interface StudentDashboardProps {
  studentId: string
}

export default function StudentDashboard({ studentId }: StudentDashboardProps) {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [gpaData, setGpaData] = useState<{ totalGPA: number } | null>(null)
  const [advice, setAdvice] = useState<AcademicAdvice[]>([])
  const [taskStats, setTaskStats] = useState({ total: 0, completed: 0, pending: 0 })

  useEffect(() => {
    const profiles = getProfiles()
    const foundProfile = profiles.find(p => p.userId === studentId)
    setProfile(foundProfile || null)

    const users = getUsers()
    const foundUser = users.find(u => u.id === studentId)
    setUser(foundUser || null)

    const gpa = calculateGPA(studentId)
    setGpaData(gpa)

    const generatedAdvice = generateAdvice(studentId)
    setAdvice(generatedAdvice)

    const tasks = getTasksByStudentId(studentId)
    setTaskStats({
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'passed').length,
      pending: tasks.filter(t => t.status === 'pending').length,
    })
  }, [studentId])

  if (!profile || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">个人画像</h1>
          <p className="text-muted-foreground">查看学生的个人信息和学业概况</p>
        </div>
      </div>

      {/* 主要信息卡片 */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* 个人信息 */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <Avatar className="w-24 h-24 mx-auto sm:mx-0">
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                  {user.name.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
                <p className="text-muted-foreground mb-2">{profile.nickname}</p>
                <p className="text-foreground leading-relaxed">{profile.bio}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 学业统计 */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              学业概况
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">加权平均分</span>
                <span className="text-2xl font-bold text-primary">
                  {gpaData?.totalGPA || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">已完成任务</span>
                <span className="text-lg font-semibold text-foreground">
                  {taskStats.completed}/{taskStats.total}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">待完成任务</span>
                <span className="text-lg font-semibold text-warning">
                  {taskStats.pending}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 兴趣和技能 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-accent" />
              兴趣方向
            </CardTitle>
            <CardDescription>个人感兴趣的技术领域</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1">
                  {interest}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Code className="w-5 h-5 text-primary" />
              技能标签
            </CardTitle>
            <CardDescription>已掌握的技术技能</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <Badge key={index} variant="outline" className="px-3 py-1 border-primary/30 text-primary">
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 项目经历 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-accent" />
            项目经历
          </CardTitle>
          <CardDescription>参与过的AI相关项目</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {profile.projects.map((project) => (
              <div
                key={project.id}
                className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <h4 className="font-semibold text-foreground mb-1">{project.name}</h4>
                <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-primary">{project.role}</span>
                  <span className="text-muted-foreground">{project.period}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 学业建议 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="w-5 h-5 text-primary" />
            学业建议
          </CardTitle>
          <CardDescription>根据当前学业情况生成的建议</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {advice.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">暂无建议</p>
            ) : (
              advice.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    item.type === 'success'
                      ? 'bg-success/10 text-success'
                      : item.type === 'warning'
                      ? 'bg-warning/10 text-warning-foreground'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {item.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  ) : item.type === 'warning' ? (
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Info className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  )}
                  <p className="text-sm">{item.message}</p>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
