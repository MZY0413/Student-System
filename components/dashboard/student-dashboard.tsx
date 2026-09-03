'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getProfiles, getUsers, calculateGPA, getBasicProfileByUserId } from '@/lib/store'
import type { StudentProfile, User } from '@/lib/types'
import { Briefcase, TrendingUp, ArrowRight } from 'lucide-react'

interface StudentDashboardProps {
  studentId: string
}

function ExperienceSection({ label, text }: { label: string; text: string }) {
  return (
    <div className="text-left">
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
      <p className="mt-1 whitespace-pre-line leading-relaxed text-foreground">
        {text.trim() ? text : '暂未填写'}
      </p>
    </div>
  )
}

export default function StudentDashboard({ studentId }: StudentDashboardProps) {
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [gpa, setGpa] = useState(0)
  const [researchExperience, setResearchExperience] = useState('')
  const [competitionExperience, setCompetitionExperience] = useState('')
  const [campusLifeExperience, setCampusLifeExperience] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const profiles = await getProfiles()
      const foundProfile = profiles.find(p => p.userId === studentId)
      const users = await getUsers()
      const foundUser = users.find(u => u.id === studentId)
      const gpaData = await calculateGPA(studentId, 'four')
      const basic = await getBasicProfileByUserId(studentId)
      if (cancelled) return
      setProfile(foundProfile || null)
      setUser(foundUser || null)
      setGpa(gpaData.cumulativeGPA)
      setResearchExperience(basic?.researchExperience || '')
      setCompetitionExperience(basic?.competitionExperience || '')
      setCampusLifeExperience(basic?.campusLifeExperience || '')
    })()
    return () => { cancelled = true }
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
      <div>
        <h1 className="text-2xl font-bold text-foreground">个人画像</h1>
        <p className="text-muted-foreground">查看学生的科研/竞赛/校园经历与学业概况</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 个人信息 + 科研/竞赛/校园经历 */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <Avatar className="h-20 w-20 mx-auto sm:mx-0">
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                  {user.name.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-foreground">{user.name}</h2>
                <div className="mt-3 space-y-3">
                  <ExperienceSection label="科研经历" text={researchExperience} />
                  <ExperienceSection label="竞赛经历" text={competitionExperience} />
                  <ExperienceSection label="校园生活经历" text={campusLifeExperience} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 学业概况（点击进入学生绩点） */}
        <Link href={`/dashboard/gpa?studentId=${studentId}`} className="group block">
          <Card className="h-full transition-colors hover:border-primary/40">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                学业概况
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between">
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">平均GPA</span>
                <span className="text-3xl font-bold text-primary">{gpa > 0 ? gpa.toFixed(2) : '-'}</span>
              </div>
              <p className="mt-4 flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground">
                查看该学生绩点详情 <ArrowRight className="h-3.5 w-3.5" />
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* 项目经历 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-accent" />
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
    </div>
  )
}
