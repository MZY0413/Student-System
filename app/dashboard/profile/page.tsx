'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import type { Gender, StudentBasicProfile, User } from '@/lib/types'
import {
  getBasicProfileByUserId,
  getBasicProfiles,
  getUsers,
  upsertBasicProfile,
} from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const genderOptions: Gender[] = ['男', '女', '保密']

function buildDefaultProfile(userId: string, name: string): StudentBasicProfile {
  return {
    userId,
    name,
    gender: '保密',
    grade: '',
    hometown: '',
    email: '',
    researchExperience: '',
    competitionExperience: '',
    campusLifeExperience: '',
    strengths: '',
  }
}

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [profile, setProfile] = useState<StudentBasicProfile | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [allUsers, setAllUsers] = useState<User[]>([])
  const [basicProfiles, setBasicProfiles] = useState<StudentBasicProfile[]>([])

  const targetUserId = searchParams.get('userId') || user?.id

  // 加载全部用户与基本资料（用于 targetUser 与同学卡片）
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [users, profiles] = await Promise.all([getUsers(), getBasicProfiles()])
      if (cancelled) return
      setAllUsers(users)
      setBasicProfiles(profiles)
    })()
    return () => { cancelled = true }
  }, [targetUserId])

  const targetUser = allUsers.find(item => item.id === targetUserId) ?? user
  const userId = targetUser?.id
  const userName = targetUser?.name

  useEffect(() => {
    if (!isLoading && !user) router.replace('/')
  }, [isLoading, user, router])

  useEffect(() => {
    if (!userId || !userName) return
    let cancelled = false
    ;(async () => {
      const stored = await getBasicProfileByUserId(userId)
      if (cancelled) return
      // 合并默认值，兼容旧数据
      setProfile(stored ? { ...buildDefaultProfile(userId, userName), ...stored } : buildDefaultProfile(userId, userName))
    })()
    return () => { cancelled = true }
  }, [userId, userName])

  const canEdit = useMemo(() => Boolean(user && user.role === 'student' && user.id === userId), [user, userId])
  const isSelf = canEdit
  const profileMap = useMemo(() => new Map(basicProfiles.map(item => [item.userId, item])), [basicProfiles])
  const classmates = useMemo(() => allUsers.filter(item => item.role === 'student' && item.id !== userId), [allUsers, userId])

  if (isLoading || !user || !profile) return null

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await upsertBasicProfile(profile)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{isSelf ? '个人主页' : `${userName} 的主页`}</h1>
        <p className="text-muted-foreground">{isSelf ? '这是你的个人卡片，完善后让同学们更了解你' : '查看同学的卡片内容'}</p>
      </div>

      {/* 个人卡片 */}
      <Card>
        {/* 紧凑头部：姓名 + 基本 meta */}
        <CardHeader className="pb-0">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {userName?.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <CardTitle className="text-base">{userName}</CardTitle>
              <CardDescription className="truncate text-xs">
                {[profile.gender, profile.grade || '年级未填', profile.hometown || '家乡未填'].filter(Boolean).join(' · ')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        {/* 代表性经历 —— 主体（科研 / 竞赛 / 校园生活） */}
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="researchExperience" className="text-base">科研经历</Label>
            <Textarea
              id="researchExperience"
              rows={3}
              className="mt-2 min-h-20 text-base leading-relaxed"
              placeholder="例如：和xxx同学（或者正在推进）完成xxx项目，获得xxx。或者参加大学生创新创业项目，正在推进项目xxxx"
              value={profile.researchExperience}
              onChange={(e) => setProfile(p => (p ? { ...p, researchExperience: e.target.value } : p))}
              disabled={!canEdit}
            />
          </div>
          <div>
            <Label htmlFor="competitionExperience" className="text-base">竞赛经历</Label>
            <Textarea
              id="competitionExperience"
              rows={3}
              className="mt-2 min-h-20 text-base leading-relaxed"
              placeholder="例如：获得全国大学生数学竞赛xxx奖，获得码蹄杯国赛xxx奖"
              value={profile.competitionExperience}
              onChange={(e) => setProfile(p => (p ? { ...p, competitionExperience: e.target.value } : p))}
              disabled={!canEdit}
            />
          </div>
          <div>
            <Label htmlFor="campusLifeExperience" className="text-base">校园生活经历</Label>
            <Textarea
              id="campusLifeExperience"
              rows={3}
              className="mt-2 min-h-20 text-base leading-relaxed"
              placeholder="例如：担任班级班长，参加xxx社团，加入xxx学校部门"
              value={profile.campusLifeExperience}
              onChange={(e) => setProfile(p => (p ? { ...p, campusLifeExperience: e.target.value } : p))}
              disabled={!canEdit}
            />
          </div>
        </CardContent>

        {/* 基本资料（紧凑） */}
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>性别</Label>
            <Select
              value={profile.gender}
              onValueChange={(v) => setProfile(p => (p ? { ...p, gender: v as Gender } : p))}
              disabled={!canEdit}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择性别" />
              </SelectTrigger>
              <SelectContent>
                {genderOptions.map(g => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grade">年级</Label>
            <Input
              id="grade"
              placeholder="例如：大二"
              value={profile.grade}
              onChange={(e) => setProfile(p => (p ? { ...p, grade: e.target.value } : p))}
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hometown">家乡</Label>
            <Input
              id="hometown"
              placeholder="例如：四川·成都"
              value={profile.hometown}
              onChange={(e) => setProfile(p => (p ? { ...p, hometown: e.target.value } : p))}
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-2 sm:col-span-3">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={profile.email}
              onChange={(e) => setProfile(p => (p ? { ...p, email: e.target.value } : p))}
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-2 sm:col-span-3">
            <Label htmlFor="strengths">兴趣特长</Label>
            <Textarea
              id="strengths"
              rows={2}
              placeholder="例如：编程 / 演讲 / 数据分析 / 篮球 ..."
              value={profile.strengths}
              onChange={(e) => setProfile(p => (p ? { ...p, strengths: e.target.value } : p))}
              disabled={!canEdit}
            />
          </div>

          {canEdit && (
            <div className="sm:col-span-3 flex justify-end">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? '保存中...' : '保存资料'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 同学卡片 */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">同学卡片</h2>
        {classmates.length === 0 ? (
          <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
            暂无其他同学
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {classmates.map(classmate => {
              const cp = profileMap.get(classmate.id)
              return (
                <Link
                  key={classmate.id}
                  href={`/dashboard/profile?userId=${classmate.id}`}
                  className="group rounded-xl border border-border bg-card/40 p-4 transition-colors hover:border-primary/40 hover:bg-card/70"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {classmate.name.slice(0, 1)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{classmate.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{cp?.grade || '年级未填'}</p>
                    </div>
                  </div>
                  <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
                    {cp?.researchExperience?.trim() || cp?.competitionExperience?.trim() || cp?.campusLifeExperience?.trim() || '暂未填写经历'}
                  </p>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
