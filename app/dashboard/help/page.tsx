'use client'

import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { HelpPostCard } from '@/components/help/help-post-card'
import { createHelpPost, getHelpPosts, getUsers } from '@/lib/store'
import type { HelpAttachment, HelpPost } from '@/lib/types'
import { Search } from 'lucide-react'

type SortValue = 'latest' | 'likes' | 'answers'

export default function HelpPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [posts, setPosts] = useState<HelpPost[]>([])
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortValue>('latest')
  const [open, setOpen] = useState(false)

  const loadPosts = () => {
    Promise.resolve(getHelpPosts()).then(setPosts)
  }

  useEffect(() => {
    if (!isLoading && !user) router.replace('/')
  }, [isLoading, user, router])

  useEffect(() => {
    loadPosts()
  }, [])

  const users = useMemo(() => getUsers(), [posts])
  const visiblePosts = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    return posts
      .filter(post => !keyword || post.title.toLowerCase().includes(keyword) || post.content.toLowerCase().includes(keyword))
      .sort((a, b) => {
        if (sort === 'likes') return b.likeCount - a.likeCount || (a.createdAt < b.createdAt ? 1 : -1)
        if (sort === 'answers') return b.commentCount - a.commentCount || (a.createdAt < b.createdAt ? 1 : -1)
        return a.createdAt < b.createdAt ? 1 : -1
      })
  }, [posts, query, sort])

  if (isLoading || !user) return null

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="搜索帖子、资料"
            className="pl-9"
          />
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setOpen(true)}>
          发布
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-end">
          <Select value={sort} onValueChange={value => setSort(value as SortValue)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest">最新发布</SelectItem>
              <SelectItem value="likes">最多点赞</SelectItem>
              <SelectItem value="answers">最多回答</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {visiblePosts.map(post => (
            <HelpPostCard key={post.id} post={post} author={users.find(item => item.id === post.userId)} />
          ))}
          {visiblePosts.length === 0 && (
            <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
              暂无帖子
            </div>
          )}
        </div>
      </div>

      <PublishDialog
        open={open}
        onOpenChange={setOpen}
        userId={user.id}
        onDone={() => {
          setOpen(false)
          loadPosts()
        }}
      />
    </div>
  )
}

function PublishDialog({
  open,
  onOpenChange,
  userId,
  onDone,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  onDone: () => void
}) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [attachments, setAttachments] = useState<HelpAttachment[]>([])
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [error, setError] = useState('')

  const reset = () => {
    setTitle('')
    setContent('')
    setAttachments([])
    setIsAnonymous(false)
    setError('')
  }

  const handleFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    setError('')
    if (files.length > 3) {
      setError('最多上传3个文件')
      event.target.value = ''
      return
    }
    if (files.some(file => file.size > 10 * 1024 * 1024)) {
      setError('单文件不能超过10MB')
      event.target.value = ''
      return
    }

    const next = await Promise.all(files.map(file => new Promise<HelpAttachment>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve({
        id: `ha${Date.now()}${Math.random().toString(16).slice(2, 6)}`,
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        dataUrl: String(reader.result),
      })
      reader.onerror = () => reject(reader.error)
      reader.readAsDataURL(file)
    })))
    setAttachments(next)
  }

  const submit = () => {
    setError('')
    const trimmedTitle = title.trim()
    const trimmedContent = content.trim()
    if (!trimmedTitle) return setError('标题为必填项')
    if (!trimmedContent) return setError('内容为必填项')
    if (trimmedTitle.length > 50) return setError('标题最多50字')
    if (trimmedContent.length > 500) return setError('内容最多500字')

    createHelpPost({
      userId,
      title: trimmedTitle,
      content: trimmedContent,
      isAnonymous,
      attachments,
    })
    reset()
    onDone()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={next => {
        onOpenChange(next)
        if (!next) reset()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>发布</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="help-title">标题</Label>
            <Input
              id="help-title"
              maxLength={50}
              value={title}
              onChange={event => setTitle(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="help-content">内容</Label>
            <Textarea
              id="help-content"
              maxLength={500}
              rows={6}
              value={content}
              onChange={event => setContent(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="help-files">文件上传</Label>
            <Input id="help-files" type="file" multiple onChange={handleFiles} />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="help-anonymous"
              checked={isAnonymous}
              onCheckedChange={checked => setIsAnonymous(Boolean(checked))}
            />
            <Label htmlFor="help-anonymous">匿名发布</Label>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={submit}>发布</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
