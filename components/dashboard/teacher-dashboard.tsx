'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getUsers, getClassStats, calculateGPA } from '@/lib/store'
import type { User, ClassStats } from '@/lib/types'
import { Users, GraduationCap, ArrowRight } from 'lucide-react'

export default function TeacherDashboard() {
  const [students, setStudents] = useState<User[]>([])
  const [classStats, setClassStats] = useState<ClassStats | null>(null)
  const [studentGPAs, setStudentGPAs] = useState<Record<string, number>>({})

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const users = await getUsers()
      const studentUsers = users.filter(u => u.role === 'student')
      if (cancelled) return
      setStudents(studentUsers)

      const gpas: Record<string, number> = {}
      for (const student of studentUsers) {
        const { cumulativeGPA } = await calculateGPA(student.id, 'four')
        gpas[student.id] = cumulativeGPA
      }
      if (!cancelled) return
      setStudentGPAs(gpas)

      setClassStats(await getClassStats())
    })()
    return () => { cancelled = true }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">班级概览</h1>
        <p className="text-muted-foreground">人工智能实验班学情统计</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 sm:grid-cols-2">
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
      </div>

      {/* 学生列表 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">学生列表</CardTitle>
            <CardDescription>点击查看学生详细信息</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/students">
              查看全部
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
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
                  <p className="font-semibold text-foreground">{(studentGPAs[student.id] || 0).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">平均GPA</p>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
