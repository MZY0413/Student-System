'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  getUsers,
  getProfiles,
  calculateGPA,
  getTasksByStudentId,
} from '@/lib/store'
import type { User, StudentProfile } from '@/lib/types'
import {
  Search,
  ArrowRight,
  GraduationCap,
  ClipboardList,
  TrendingUp,
} from 'lucide-react'

export default function StudentsPage() {
  const [students, setStudents] = useState<User[]>([])
  const [profiles, setProfiles] = useState<StudentProfile[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [studentStats, setStudentStats] = useState<Record<string, { gpa: number; completed: number; total: number }>>({})

  useEffect(() => {
    const users = getUsers()
    const studentUsers = users.filter(u => u.role === 'student')
    setStudents(studentUsers)
    setProfiles(getProfiles())

    const stats: Record<string, { gpa: number; completed: number; total: number }> = {}
    studentUsers.forEach(student => {
      const { totalGPA } = calculateGPA(student.id)
      const tasks = getTasksByStudentId(student.id)
      stats[student.id] = {
        gpa: totalGPA,
        completed: tasks.filter(t => t.status === 'passed').length,
        total: tasks.length,
      }
    })
    setStudentStats(stats)
  }, [])

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getProfile = (userId: string) => profiles.find(p => p.userId === userId)

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">学生管理</h1>
        <p className="text-muted-foreground">查看和管理班级学生信息</p>
      </div>

      {/* 搜索 */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="搜索学生姓名..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* 学生列表 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredStudents.map(student => {
          const profile = getProfile(student.id)
          const stats = studentStats[student.id]
          return (
            <Card key={student.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                        {student.name.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{student.name}</CardTitle>
                      <CardDescription>{profile?.nickname || student.username}</CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* 技能标签 */}
                {profile && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {profile.skills.slice(0, 3).map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {profile.skills.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{profile.skills.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* 统计数据 */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-primary mb-1">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <p className="text-lg font-bold text-foreground">{stats?.gpa || 0}</p>
                    <p className="text-xs text-muted-foreground">平均分</p>
                  </div>
                  <div className="text-center p-2 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-success mb-1">
                      <ClipboardList className="w-4 h-4" />
                    </div>
                    <p className="text-lg font-bold text-foreground">{stats?.completed || 0}</p>
                    <p className="text-xs text-muted-foreground">已完成</p>
                  </div>
                  <div className="text-center p-2 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-center gap-1 text-accent mb-1">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <p className="text-lg font-bold text-foreground">{stats?.total || 0}</p>
                    <p className="text-xs text-muted-foreground">总任务</p>
                  </div>
                </div>

                <Button asChild className="w-full">
                  <Link href={`/dashboard/students/${student.id}`}>
                    查看详情
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          未找到符合条件的学生
        </div>
      )}
    </div>
  )
}
