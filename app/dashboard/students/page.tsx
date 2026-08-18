'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getUsers, calculateGPA } from '@/lib/store'
import type { User } from '@/lib/types'
import { Search, ArrowRight, GraduationCap } from 'lucide-react'

export default function StudentsPage() {
  const [students, setStudents] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
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
      if (!cancelled) setStudentGPAs(gpas)
    })()
    return () => { cancelled = true }
  }, [])

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">学生管理</h1>
        <p className="text-muted-foreground">查看班级学生信息与平均绩点</p>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="搜索学生姓名..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredStudents.map(student => {
          const gpa = studentGPAs[student.id]
          return (
            <Card key={student.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {student.name.slice(0, 1)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{student.name}</CardTitle>
                    <CardDescription>{student.username}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3 mb-4">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">平均GPA</span>
                  </div>
                  <p className="text-xl font-bold text-foreground">{gpa ? gpa.toFixed(2) : '-'}</p>
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
