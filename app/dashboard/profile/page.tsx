'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import type { Gender, HelpPost, StudentBasicProfile } from '@/lib/types'
import { getBasicProfileByUserId, getUserHelpActivity, getUsers, upsertBasicProfile } from '@/lib/store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

function buildDefaultProfile(userId: string, name: string): StudentBasicProfile {
  return {
    userId,
    name,
    gender: '保密',
    grade: '',
    hometown: '',
    email: '',
    motto: '',
    strengths: '',
  }
}

export default function ProfilePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [profile, setProfile] = useState<StudentBasicProfile | null>(null)
  const [isSaving, setIsSaving] = useState(false)
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
    setProfile(stored ?? buildDefaultProfile(userId, userName))
  }, [userId, userName])

  useEffect(() => {
    Promise.resolve().then(() => setVersion(value => value + 1))
  }, [userId])

  const canEdit = useMemo(() => Boolean(user && user.role === 'student' && user.id === userId), [user, userId])
  const helpActivity = useMemo(() => userId ? getUserHelpActivity(userId) : { posts: [], collectedPosts: [], answeredPosts: [] }, [userId, version])
  const users = useMemo(() => getUsers(), [version])

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
        <h1 className="text-2xl font-bold text-foreground">个人主页</h1>
        <p className="text-muted-foreground">仅展示当前登录用户的信息</p>
      </div>

      <Tabs defaultValue="basic" className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">基本资料</TabsTrigger>
          <TabsTrigger value="help">我的互助</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>资料信息</CardTitle>
              <CardDescription>填写后将用于系统内展示与联系</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">姓名</Label>
                <Input
                  id="name"
                  value={profile.name}
                  disabled
                />
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
                <Label htmlFor="motto">座右铭</Label>
                <Textarea
                  id="motto"
                  rows={3}
                  placeholder="写一句让你保持前进的话"
                  value={profile.motto}
                  onChange={(e) => setProfile(p => (p ? { ...p, motto: e.target.value } : p))}
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
        </TabsContent>

        <TabsContent value="help">
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
        </TabsContent>
      </Tabs>
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

