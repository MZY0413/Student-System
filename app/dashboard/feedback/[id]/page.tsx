'use client'

import { use, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  addFeedbackAttachment,
  closeFeedbackByTeacher,
  getFeedbackAttachments,
  getFeedbackById,
  getFeedbackMessages,
  getFeedbackStatusHistoryByFeedbackId,
  markFeedbackRead,
  replyToFeedback,
  resolveFeedback,
} from '@/lib/store'
import type { FeedbackCategory, FeedbackStatus } from '@/lib/types'
import { CheckCircle2, Download, Send, XCircle } from 'lucide-react'

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

export default function FeedbackDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [version, setVersion] = useState(0)
  const [reply, setReply] = useState('')
  const [nextStatus, setNextStatus] = useState<FeedbackStatus>('replied')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const refresh = () => setVersion(v => v + 1)

  const feedback = useMemo(() => getFeedbackById(id), [id, version])
  const messages = useMemo(() => getFeedbackMessages().filter(item => item.feedbackId === id), [id, version])
  const attachments = useMemo(() => getFeedbackAttachments().filter(item => item.feedbackId === id), [id, version])
  const history = useMemo(() => getFeedbackStatusHistoryByFeedbackId(id), [id, version])

  useEffect(() => {
    if (!isLoading && !user) router.replace('/')
  }, [isLoading, user, router])

  useEffect(() => {
    if (!user || !feedback) return
    if (user.role === 'student' && feedback.studentId !== user.id) {
      router.replace('/dashboard/feedback')
      return
    }
    if (user.role === 'teacher' && feedback.assigneeTeacherId !== user.id) {
      router.replace('/dashboard/feedback')
      return
    }
    markFeedbackRead({ feedbackId: feedback.id, role: user.role, userId: user.id })
  }, [user, feedback, router])

  if (isLoading || !user) return null

  if (!feedback) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">反馈详情</h1>
          <Button asChild variant="outline"><Link href="/dashboard/feedback">返回列表</Link></Button>
        </div>
        <Card><CardContent className="pt-6 text-muted-foreground">未找到该反馈</CardContent></Card>
      </div>
    )
  }

  const sendReply = () => {
    setError('')
    if (!reply.trim()) return setError('请填写回复内容')
    if (reply.trim().length > 1000) return setError('回复内容不能超过1000字')
    setSubmitting(true)
    try {
      const ok = replyToFeedback({
        feedbackId: feedback.id,
        teacherId: user.id,
        teacherName: user.name,
        content: reply.trim(),
        nextStatus,
      })
      if (!ok) return setError('你无权回复该反馈')
      setReply('')
      refresh()
    } finally {
      setSubmitting(false)
    }
  }

  const markResolved = () => {
    const ok = resolveFeedback({
      feedbackId: feedback.id,
      teacherId: user.id,
      teacherName: user.name,
      note: note.trim() || '老师已标记为已解决',
    })
    if (ok) {
      setNote('')
      refresh()
    }
  }

  const closeFeedback = () => {
    const ok = closeFeedbackByTeacher({
      feedbackId: feedback.id,
      teacherId: user.id,
      teacherName: user.name,
      note: note.trim() || '无需再跟进',
    })
    if (ok) {
      setNote('')
      refresh()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">反馈详情</h1>
          <p className="text-muted-foreground">查看沟通记录、附件与处理进度。</p>
        </div>
        <Button asChild variant="outline"><Link href="/dashboard/feedback">返回列表</Link></Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg">{feedback.title}</CardTitle>
              <CardDescription>
                提交学生：{feedback.studentName} · 反馈对象：{feedback.assigneeTeacherName} · 提交时间：{feedback.createdAt}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={feedback.status} />
              <Badge variant="secondary">{categoryLabels[feedback.category]}{feedback.subject ? ` · ${feedback.subject}` : ''}</Badge>
              <Badge variant="outline">{feedback.type === 'question' ? '问题咨询' : '优化建议'}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg border bg-muted/20 p-4">
            <p className="mb-2 text-sm text-muted-foreground">学生提交内容</p>
            <p className="whitespace-pre-wrap text-foreground">{feedback.content}</p>
          </div>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold">沟通记录</h2>
            {messages.length === 0 ? (
              <div className="text-sm text-muted-foreground">暂无沟通记录</div>
            ) : (
              <div className="space-y-2">
                {messages.map(message => (
                  <div key={message.id} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{message.senderRole === 'teacher' ? '老师' : message.senderRole === 'student' ? '学生' : '系统'}</span>
                      <span>{message.createdAt}</span>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm">{message.content}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {user.role === 'teacher' && (
            <section className="space-y-3 rounded-lg border p-4">
              <h2 className="text-sm font-semibold">回复与状态处理</h2>
              <Textarea value={reply} maxLength={1000} onChange={e => setReply(e.target.value)} placeholder="填写给学生的回复或处理意见" rows={4} />
              <div className="grid gap-2 md:grid-cols-[180px_1fr_auto]">
                <Select value={nextStatus} onValueChange={value => setNextStatus(value as FeedbackStatus)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="replied">回复后标记已回复</SelectItem>
                    <SelectItem value="resolved">回复后标记已解决</SelectItem>
                    <SelectItem value="pending">保持待处理</SelectItem>
                  </SelectContent>
                </Select>
                <Input value={note} onChange={e => setNote(e.target.value)} placeholder="状态处理备注，可选" />
                <Button onClick={sendReply} disabled={submitting}><Send className="mr-2 h-4 w-4" />{submitting ? '回复中...' : '回复'}</Button>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={markResolved}><CheckCircle2 className="mr-2 h-4 w-4" />标记已解决</Button>
                <Button variant="outline" onClick={closeFeedback}><XCircle className="mr-2 h-4 w-4" />无需再跟进</Button>
              </div>
            </section>
          )}

          <section className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-sm font-semibold">附件</h2>
              <label className="text-sm">
                <span className="sr-only">上传附件</span>
                <Input
                  type="file"
                  disabled={uploading}
                  accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                  onChange={async (event) => {
                    const file = event.target.files?.[0]
                    if (!file || !user || !feedback) return
                    if (file.size > 2 * 1024 * 1024) {
                      event.target.value = ''
                      return
                    }
                    setUploading(true)
                    setUploadProgress(20)
                    try {
                      const dataUrl = await readFileAsDataUrl(file)
                      setUploadProgress(80)
                      addFeedbackAttachment({
                        feedbackId: feedback.id,
                        uploaderRole: user.role,
                        uploaderId: user.id,
                        fileName: file.name,
                        mimeType: file.type || 'application/octet-stream',
                        size: file.size,
                        dataUrl,
                      })
                      setUploadProgress(100)
                      event.target.value = ''
                      refresh()
                    } finally {
                      setTimeout(() => {
                        setUploading(false)
                        setUploadProgress(0)
                      }, 300)
                    }
                  }}
                />
              </label>
            </div>
            {uploading && <Progress value={uploadProgress} />}
            {attachments.length === 0 ? (
              <div className="text-sm text-muted-foreground">暂无附件</div>
            ) : (
              <div className="space-y-2">
                {attachments.map(attachment => (
                  <div key={attachment.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{attachment.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {attachment.uploaderRole === 'teacher' ? '老师' : '学生'} · {attachment.createdAt} · {Math.round(attachment.size / 1024)}KB
                      </p>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <a href={attachment.dataUrl} download={attachment.fileName}><Download className="mr-1 h-4 w-4" />下载</a>
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold">状态记录</h2>
            {history.length === 0 ? (
              <div className="text-sm text-muted-foreground">暂无状态记录</div>
            ) : (
              <div className="space-y-2">
                {history.map(item => (
                  <div key={item.id} className="rounded-lg border p-3 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={item.status} />
                      <span className="font-medium">{item.operatorName}</span>
                      <span className="text-muted-foreground">{item.createdAt}</span>
                    </div>
                    {item.note && <p className="mt-2 text-muted-foreground">{item.note}</p>}
                  </div>
                ))}
              </div>
            )}
          </section>
        </CardContent>
      </Card>
    </div>
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

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('read failed'))
    reader.onload = () => resolve(String(reader.result))
    reader.readAsDataURL(file)
  })
}
