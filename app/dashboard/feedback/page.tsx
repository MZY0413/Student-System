'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  addFeedback,
  addFeedbackAttachment,
  deleteFeedbackByStudent,
  getFeedbackAttachments,
  getFeedbacks,
  getTeacherAssigneeGroupsForStudent,
  getTeacherFeedbackStats,
  getUsers,
  updateFeedbackByStudent,
} from '@/lib/store'
import type { Feedback, FeedbackCategory, FeedbackStatus, FeedbackType } from '@/lib/types'
import { AlertCircle, CheckCircle2, Clock3, FileUp, MessageSquare, Pencil, Plus, Trash2 } from 'lucide-react'

const subjects = ['机器学习基础', '深度学习', '自然语言处理', '计算机视觉', '高等数学', 'AI项目实训']
const categoryLabels: Record<FeedbackCategory, string> = {
  academic: '学业问题',
  life: '生活问题',
  classAffairs: '班级事务',
  system: '系统建议',
}
const statusLabels: Record<FeedbackStatus, string> = {
  pending: '待处理',
  replied: '已回复',
  resolved: '已解决',
  closed: '无需跟进',
}

export default function FeedbackPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [version, setVersion] = useState(0)
  const [statusFilter, setStatusFilter] = useState('all')
  const [teacherFilter, setTeacherFilter] = useState('all')
  const [studentFilter, setStudentFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortOrder, setSortOrder] = useState('newest')
  const refresh = () => setVersion(v => v + 1)

  useEffect(() => {
    if (!isLoading && !user) router.replace('/')
  }, [isLoading, user, router])

  const data = useMemo(() => {
    if (!user) return null
    const all = getFeedbacks()
    const scoped = user.role === 'student'
      ? all.filter(item => item.studentId === user.id)
      : all.filter(item => item.assigneeTeacherId === user.id)

    const filtered = scoped
      .filter(item => statusFilter === 'all' || item.status === statusFilter)
      .filter(item => teacherFilter === 'all' || item.assigneeTeacherId === teacherFilter)
      .filter(item => studentFilter === 'all' || item.studentId === studentFilter)
      .filter(item => categoryFilter === 'all' || item.category === categoryFilter)
      .sort((a, b) => sortOrder === 'oldest'
        ? (a.createdAt > b.createdAt ? 1 : -1)
        : (a.createdAt < b.createdAt ? 1 : -1)
      )

    return {
      feedbacks: filtered,
      rawFeedbacks: scoped,
      teachers: getTeacherAssigneeGroupsForStudent(user.id),
      students: getUsers().filter(item => item.role === 'student'),
      stats: user.role === 'teacher' ? getTeacherFeedbackStats(user.id) : null,
    }
  }, [user, statusFilter, teacherFilter, studentFilter, categoryFilter, sortOrder, version])

  if (isLoading || !user || !data) return null

  const pending = data.rawFeedbacks.filter(item => item.status === 'pending').length
  const replied = data.rawFeedbacks.filter(item => item.status === 'replied').length
  const resolved = data.rawFeedbacks.filter(item => item.status === 'resolved').length
  const unread = data.rawFeedbacks.filter(item => user.role === 'student' ? item.unreadForStudent : item.unreadForTeacher).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{user.role === 'student' ? '我的问题反馈' : '反馈处理'}</h1>
          <p className="text-muted-foreground">
            {user.role === 'student' ? '向班主任或任课老师提交定向反馈，并跟进处理进度。' : '仅显示学生提交给你的反馈，保护师生沟通隐私。'}
          </p>
        </div>
        {user.role === 'student' && <FeedbackForm user={user} teachers={data.teachers} onDone={refresh} />}
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title={user.role === 'teacher' ? '收到反馈数' : '反馈总数'} value={data.rawFeedbacks.length} icon={MessageSquare} />
        <StatCard title="待处理" value={pending} icon={Clock3} tone="warning" />
        <StatCard title="已回复" value={replied} icon={AlertCircle} tone="primary" />
        <StatCard title={user.role === 'teacher' ? '处理率' : '未读回复'} value={user.role === 'teacher' && data.stats ? `${data.stats.processingRate}%` : unread} icon={CheckCircle2} tone="success" />
      </div>

      {user.role === 'teacher' && data.stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">个人反馈统计</CardTitle>
            <CardDescription>收到 {data.stats.total} 条，待处理 {data.stats.pending} 条，已回复 {data.stats.replied} 条，已解决 {data.stats.resolved} 条。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={data.stats.processingRate} />
            <div className="grid gap-2 md:grid-cols-4">
              {data.stats.categoryDistribution.map(item => (
                <div key={item.key} className="rounded-lg border p-3 text-sm">
                  <div className="text-muted-foreground">{item.label}</div>
                  <div className="mt-1 text-xl font-semibold">{item.value}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{user.role === 'student' ? '我的反馈列表' : '收到的反馈'}</CardTitle>
          <CardDescription>{user.role === 'student' ? '未处理反馈可修改或删除，已处理反馈仅可查看。' : '可按学生、分类、状态和时间筛选个人反馈。'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full"><SelectValue placeholder="状态" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="pending">待处理</SelectItem>
                <SelectItem value="replied">已回复</SelectItem>
                <SelectItem value="resolved">已解决</SelectItem>
                <SelectItem value="closed">无需跟进</SelectItem>
              </SelectContent>
            </Select>
            {user.role === 'student' ? (
              <Select value={teacherFilter} onValueChange={setTeacherFilter}>
                <SelectTrigger className="w-full"><SelectValue placeholder="反馈对象" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部老师</SelectItem>
                  {data.teachers.map(group => (
                    <SelectGroup key={group.group}>
                      <SelectLabel>{group.group}</SelectLabel>
                      {group.teachers.map(teacher => <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>)}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Select value={studentFilter} onValueChange={setStudentFilter}>
                <SelectTrigger className="w-full"><SelectValue placeholder="学生" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部学生</SelectItem>
                  {data.students.map(student => <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full"><SelectValue placeholder="分类" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分类</SelectItem>
                <SelectItem value="academic">学业问题</SelectItem>
                <SelectItem value="life">生活问题</SelectItem>
                <SelectItem value="classAffairs">班级事务</SelectItem>
                <SelectItem value="system">系统建议</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-full"><SelectValue placeholder="时间" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">最新提交</SelectItem>
                <SelectItem value="oldest">最早提交</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {data.feedbacks.length === 0 ? (
            <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
              {user.role === 'student' ? '暂无反馈记录' : '暂无收到的反馈'}
            </div>
          ) : (
            <div className="space-y-3">
              {data.feedbacks.map(item => (
                <FeedbackRow key={item.id} feedback={item} role={user.role} currentUserId={user.id} teachers={data.teachers} onChanged={refresh} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function FeedbackForm({ user, teachers, onDone }: { user: { id: string; name: string }; teachers: ReturnType<typeof getTeacherAssigneeGroupsForStudent>; onDone: () => void }) {
  const flatTeachers = teachers.flatMap(group => group.teachers)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<FeedbackCategory>('academic')
  const [type, setType] = useState<FeedbackType>('question')
  const [subject, setSubject] = useState(subjects[0])
  const [teacherId, setTeacherId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    setError('')
    if (!teacherId) return setError('请选择一位反馈对象')
    if (!title.trim()) return setError('请填写反馈标题')
    if (!content.trim()) return setError('请填写反馈内容')
    if (title.trim().length > 100) return setError('标题不能超过100字')
    if (content.trim().length > 1000) return setError('内容不能超过1000字')
    if (file && file.size > 2 * 1024 * 1024) return setError('附件不能超过2MB')

    const teacher = flatTeachers.find(item => item.id === teacherId)
    if (!teacher) return setError('反馈对象无效')
    setSubmitting(true)
    try {
      const feedback = addFeedback({
        studentId: user.id,
        studentName: user.name,
        assigneeTeacherId: teacher.id,
        assigneeTeacherName: teacher.name,
        category,
        subject: category === 'academic' ? subject : undefined,
        type,
        title: title.trim(),
        content: content.trim(),
        visibility: 'private',
        isPublicQuestion: false,
      })
      if (file) {
        const dataUrl = await readFileAsDataUrl(file)
        addFeedbackAttachment({
          feedbackId: feedback.id,
          uploaderRole: 'student',
          uploaderId: user.id,
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          size: file.size,
          dataUrl,
        })
      }
      setTitle('')
      setContent('')
      setTeacherId('')
      setFile(null)
      onDone()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="w-full lg:w-[460px]">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">新建定向反馈</CardTitle>
        <CardDescription>反馈对象为必选，提交后仅该老师可见。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 md:grid-cols-2">
          <Select value={category} onValueChange={value => setCategory(value as FeedbackCategory)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="academic">学业问题</SelectItem>
              <SelectItem value="life">生活问题</SelectItem>
              <SelectItem value="classAffairs">班级事务</SelectItem>
              <SelectItem value="system">系统建议</SelectItem>
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={value => setType(value as FeedbackType)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="question">问题咨询</SelectItem>
              <SelectItem value="suggestion">优化建议</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {category === 'academic' && (
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="w-full"><SelectValue placeholder="选择学科/课程" /></SelectTrigger>
            <SelectContent>{subjects.map(item => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
          </Select>
        )}
        <Select value={teacherId} onValueChange={setTeacherId}>
          <SelectTrigger className="w-full"><SelectValue placeholder="选择反馈对象" /></SelectTrigger>
          <SelectContent>
            {teachers.map(group => (
              <SelectGroup key={group.group}>
                <SelectLabel>{group.group}</SelectLabel>
                {group.teachers.map(teacher => <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>)}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
        <Input value={title} maxLength={100} onChange={e => setTitle(e.target.value)} placeholder="标题，100字以内" />
        <Textarea value={content} maxLength={1000} onChange={e => setContent(e.target.value)} placeholder="请描述反馈内容，1000字以内" rows={4} />
        <div className="space-y-2">
          <Label className="text-sm">附件（图片/文档，2MB以内）</Label>
          <Input type="file" accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt" onChange={e => setFile(e.target.files?.[0] ?? null)} />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button onClick={submit} disabled={submitting} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          {submitting ? '提交中...' : '提交反馈'}
        </Button>
      </CardContent>
    </Card>
  )
}

function FeedbackRow({ feedback, role, currentUserId, teachers, onChanged }: { feedback: Feedback; role: 'student' | 'teacher'; currentUserId: string; teachers: ReturnType<typeof getTeacherAssigneeGroupsForStudent>; onChanged: () => void }) {
  const [editing, setEditing] = useState(false)
  const unread = role === 'student' ? feedback.unreadForStudent : feedback.unreadForTeacher
  const attachmentCount = getFeedbackAttachments().filter(item => item.feedbackId === feedback.id).length

  if (editing) {
    return <FeedbackEditCard feedback={feedback} currentUserId={currentUserId} teachers={teachers} onCancel={() => setEditing(false)} onDone={() => { setEditing(false); onChanged() }} />
  }

  return (
    <div className="rounded-lg border p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/dashboard/feedback/${feedback.id}`} className="font-semibold hover:underline">{feedback.title}</Link>
            {unread && <Badge variant="destructive">未读回复</Badge>}
            <StatusBadge status={feedback.status} />
            <Badge variant="secondary">{categoryLabels[feedback.category]}{feedback.subject ? ` · ${feedback.subject}` : ''}</Badge>
            {attachmentCount > 0 && <Badge variant="outline"><FileUp className="mr-1 h-3 w-3" />{attachmentCount}</Badge>}
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">{feedback.content}</p>
          <p className="text-xs text-muted-foreground">
            {role === 'student' ? `反馈对象：${feedback.assigneeTeacherName}` : `提交学生：${feedback.studentName}`} · 提交时间：{feedback.createdAt}
            {feedback.lastReplyAt ? ` · 最近回复：${feedback.lastReplyAt}` : ''}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button asChild size="sm" variant="outline"><Link href={`/dashboard/feedback/${feedback.id}`}>查看</Link></Button>
          {role === 'student' && feedback.studentId === currentUserId && feedback.status === 'pending' && (
            <>
              <Button size="sm" variant="outline" onClick={() => setEditing(true)}><Pencil className="mr-1 h-4 w-4" />修改</Button>
              <Button size="sm" variant="outline" className="text-destructive" onClick={() => { deleteFeedbackByStudent({ feedbackId: feedback.id, studentId: currentUserId }); onChanged() }}><Trash2 className="mr-1 h-4 w-4" />删除</Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function FeedbackEditCard({ feedback, currentUserId, teachers, onCancel, onDone }: { feedback: Feedback; currentUserId: string; teachers: ReturnType<typeof getTeacherAssigneeGroupsForStudent>; onCancel: () => void; onDone: () => void }) {
  const flatTeachers = teachers.flatMap(group => group.teachers)
  const [title, setTitle] = useState(feedback.title)
  const [content, setContent] = useState(feedback.content)
  const [category, setCategory] = useState<FeedbackCategory>(feedback.category)
  const [type, setType] = useState<FeedbackType>(feedback.type)
  const [subject, setSubject] = useState(feedback.subject ?? subjects[0])
  const [teacherId, setTeacherId] = useState(feedback.assigneeTeacherId)
  const [error, setError] = useState('')

  const save = () => {
    setError('')
    const teacher = flatTeachers.find(item => item.id === teacherId)
    if (!teacher) return setError('请选择反馈对象')
    if (!title.trim()) return setError('请填写标题')
    if (!content.trim()) return setError('请填写内容')
    const ok = updateFeedbackByStudent({
      feedbackId: feedback.id,
      studentId: currentUserId,
      patch: {
        category,
        type,
        title: title.trim(),
        content: content.trim(),
        subject: category === 'academic' ? subject : undefined,
        assigneeTeacherId: teacher.id,
        assigneeTeacherName: teacher.name,
      },
    })
    if (!ok) return setError('当前状态不支持修改')
    onDone()
  }

  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <div className="grid gap-2 md:grid-cols-3">
          <Select value={category} onValueChange={value => setCategory(value as FeedbackCategory)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="academic">学业问题</SelectItem>
              <SelectItem value="life">生活问题</SelectItem>
              <SelectItem value="classAffairs">班级事务</SelectItem>
              <SelectItem value="system">系统建议</SelectItem>
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={value => setType(value as FeedbackType)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="question">问题咨询</SelectItem>
              <SelectItem value="suggestion">优化建议</SelectItem>
            </SelectContent>
          </Select>
          <Select value={teacherId} onValueChange={setTeacherId}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {teachers.map(group => (
                <SelectGroup key={group.group}>
                  <SelectLabel>{group.group}</SelectLabel>
                  {group.teachers.map(teacher => <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>)}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>
        {category === 'academic' && (
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>{subjects.map(item => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
          </Select>
        )}
        <Input value={title} maxLength={100} onChange={e => setTitle(e.target.value)} />
        <Textarea value={content} maxLength={1000} onChange={e => setContent(e.target.value)} rows={4} />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Button onClick={save}>保存修改</Button>
          <Button variant="outline" onClick={onCancel}>取消</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: FeedbackStatus }) {
  const className =
    status === 'pending'
      ? 'bg-orange-100 text-orange-700 border-orange-200'
      : status === 'replied'
      ? 'bg-blue-100 text-blue-700 border-blue-200'
      : status === 'resolved'
      ? 'bg-green-100 text-green-700 border-green-200'
      : 'bg-muted text-muted-foreground'
  return <Badge variant="outline" className={className}>{statusLabels[status]}</Badge>
}

function StatCard({ title, value, icon: Icon, tone = 'default' }: { title: string; value: number | string; icon: typeof MessageSquare; tone?: 'default' | 'warning' | 'primary' | 'success' }) {
  const toneClass = tone === 'warning' ? 'text-orange-600' : tone === 'primary' ? 'text-blue-600' : tone === 'success' ? 'text-green-600' : 'text-muted-foreground'
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardDescription>{title}</CardDescription>
        <Icon className={`h-4 w-4 ${toneClass}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('read failed'))
    reader.onload = () => resolve(String(reader.result))
    reader.readAsDataURL(file)
  })
}
