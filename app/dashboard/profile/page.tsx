'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import type { Gender, HelpPost, StudentBasicProfile } from '@/lib/types'
import {
  getBasicProfileByUserId,
  getBasicProfiles,
  getUserHelpActivity,
  getUsers,
  upsertBasicProfile,
} from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { HelpPostCard } from '@/components/help/help-post-card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const genderOptions: Gender[] = ['男', '女', '保密']

const experienceHints = [
  '学科竞赛获奖情况',
  '奖学金获得情况',
  '项目参与和开发经历',
  '志愿活动经历',
  '学生工作经历',
  '社团经历',
  '论文软著专利发布情况',
]

function buildDefaultProfile(userId: string, name: string): StudentBasicProfile {
  return {
    userId,
    name,
    gender: '保密',
    grade: '',
    hometown: '',
    email: '',
    experiences: '',
    strengths: '',
  }
}

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [profile, setProfile] = useState<StudentBasicProfile | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [hintOpen, setHintOpen] = useState(false)
  const [version, setVersion] = useState(0)

  const targetUserId = searchParams.get('userId') || user?.id
  const targetUser = useMemo(() => getUsers().find(item => item.id === targetUserId) ?? user, [targetUserId, user])
  const userId = targetUser?.id
  const userName = targetUser?.name

  useEffect(() => {
    if (!isLoading && !user) router.replace('/')
  }, [isLoading, user, router])

  useEffect(() => {
    if (!userId || !userName) return
    const stored = getBasicProfileByUserId(userId)
    // 合并默认值，兼容旧数据（旧字段 motto → experiences）
    setProfile(stored ? { ...buildDefaultProfile(userId, userName), ...stored } : buildDefaultProfile(userId, userName))
  }, [userId, userName])

  useEffect(() => {
    Promise.resolve().then(() => setVersion(value => value + 1))
  }, [userId])

  const canEdit = useMemo(() => Boolean(user && user.role === 'student' && user.id === userId), [user, userId])
  const isSelf = canEdit
  const helpActivity = useMemo(() => userId ? getUserHelpActivity(userId) : { posts: [], collectedPosts: [], answeredPosts: [] }, [userId, version])
  const users = useMemo(() => getUsers(), [version])
  const basicProfiles = useMemo(() => getBasicProfiles(), [version])
  const profileMap = useMemo(() => new Map(basicProfiles.map(item => [item.userId, item])), [basicProfiles])
  const classmates = useMemo(() => users.filter(item => item.role === 'student' && item.id !== userId), [users, userId])

  if (isLoading || !user || !profile) return null

  const handleSave = async () => {
    setIsSaving(true)
    try {
      upsertBasicProfile(profile)
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
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                {userName?.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{userName}</CardTitle>
              <CardDescription>
                {[profile.gender, profile.grade || '年级未填', profile.hometown || '家乡未填'].filter(Boolean).join(' · ')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">姓名</Label>
            <Input id="name" value={profile.name} disabled />
          </div>

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
              placeholder="例如：大一 / 大二 / 2024级"
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

          <div className="space-y-2 md:col-span-2">
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

          <div className="space-y-2 md:col-span-2">
            <div className="flex items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-2">
                <Label htmlFor="experiences">我的代表性经历</Label>
                <span className="text-xs text-muted-foreground">让大家认识更全面的自己！</span>
              </div>
              <button
                type="button"
                onClick={() => setHintOpen(v => !v)}
                className="shrink-0 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
              >
                不知道怎么写？
              </button>
            </div>
            {hintOpen && (
              <div className="rounded-lg border border-border bg-muted/40 p-3">
                <p className="text-xs font-medium text-foreground">可以从这些方面入手：</p>
                <ul className="mt-1.5 list-inside list-disc space-y-0.5 text-xs text-muted-foreground">
                  {experienceHints.map(hint => <li key={hint}>{hint}</li>)}
                </ul>
              </div>
            )}
            <Textarea
              id="experiences"
              rows={4}
              placeholder="例如：全国大学生数学建模竞赛省一等奖、校一等奖学金、参与「智能图像分类系统」项目开发、担任机器人社团负责人…"
              value={profile.experiences}
              onChange={(e) => setProfile(p => (p ? { ...p, experiences: e.target.value } : p))}
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="strengths">兴趣特长</Label>
            <Textarea
              id="strengths"
              rows={3}
              placeholder="例如：编程 / 演讲 / 数据分析 / 篮球 ..."
              value={profile.strengths}
              onChange={(e) => setProfile(p => (p ? { ...p, strengths: e.target.value } : p))}
              disabled={!canEdit}
            />
          </div>

          {canEdit && (
            <div className="md:col-span-2 flex justify-end">
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
                    {cp?.experiences?.trim() ? cp.experiences : '暂未填写代表性经历'}
                  </p>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* 我的互助（仅自己可见） */}
      {isSelf && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">我的互助</CardTitle>
            <CardDescription>你发布、收藏与回答的学业互助内容</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="published" className="space-y-4">
              <TabsList>
                <TabsTrigger value="published">我发布的</TabsTrigger>
                <TabsTrigger value="collected">我收藏的</TabsTrigger>
                <TabsTrigger value="answered">我的回答</TabsTrigger>
              </TabsList>
              <TabsContent value="published">
                <HelpPostList posts={helpActivity.posts} users={users} />
              </TabsContent>
              <TabsContent value="collected">
                <HelpPostList posts={helpActivity.collectedPosts} users={users} />
              </TabsContent>
              <TabsContent value="answered">
                <HelpPostList posts={helpActivity.answeredPosts} users={users} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function HelpPostList({ posts, users }: { posts: HelpPost[]; users: ReturnType<typeof getUsers> }) {
  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
        暂无记录
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {posts.map(post => (
        <HelpPostCard key={post.id} post={post} author={users.find(item => item.id === post.userId)} />
      ))}
    </div>
  )
}
