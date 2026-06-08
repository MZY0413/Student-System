'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  addHelpComment,
  getHelpComments,
  getHelpPostById,
  getHelpCollects,
  getUsers,
  toggleHelpCollect,
  toggleHelpCommentLike,
  toggleHelpPostLike,
} from '@/lib/store'
import type { HelpComment, HelpPost } from '@/lib/types'
import { Download, Heart, Star } from 'lucide-react'

export default function HelpDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [post, setPost] = useState<HelpPost | null>(null)
  const [comments, setComments] = useState<HelpComment[]>([])
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0)

  const refresh = () => {
    const currentPost = getHelpPostById(params.id)
    setPost(currentPost ?? null)
    setComments(getHelpComments(params.id))
  }

  useEffect(() => {
    if (!isLoading && !user) router.replace('/')
  }, [isLoading, user, router])

  useEffect(() => {
    Promise.resolve().then(refresh)
  }, [params.id, version])

  const users = useMemo(() => getUsers(), [version])
  const author = users.find(item => item.id === post?.userId)
  const sortedComments = useMemo(() => (
    [...comments].sort((a, b) => Number(b.isOfficial) - Number(a.isOfficial) || b.likeCount - a.likeCount || (a.createdAt < b.createdAt ? 1 : -1))
  ), [comments])
  const isCollected = user ? getHelpCollects(user.id).some(item => item.postId === params.id) : false

  if (isLoading || !user) return null
  if (!post) {
    return <div className="text-sm text-muted-foreground">帖子不存在</div>
  }

  const displayName = post.isAnonymous ? '匿名用户' : author?.name ?? '匿名用户'

  const submitAnswer = () => {
    setError('')
    const trimmed = answer.trim()
    if (!trimmed) return setError('请填写回答内容')
    if (trimmed.length > 300) return setError('回答最多300字')
    addHelpComment({ postId: post.id, userId: user.id, content: trimmed })
    setAnswer('')
    setVersion(value => value + 1)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{post.title}</CardTitle>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {displayName.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <span>{displayName}</span>
              <span>{post.createdAt}</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">{post.content}</p>
            {post.attachments.length > 0 && (
              <div className="space-y-2">
                {post.attachments.map(file => (
                  <a
                    key={file.id}
                    href={file.dataUrl}
                    download={file.fileName}
                    className="flex items-center gap-2 rounded-md border p-3 text-sm text-muted-foreground hover:bg-muted/30"
                  >
                    <Download className="h-4 w-4" />
                    {file.fileName}
                  </a>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { toggleHelpPostLike(post.id, user.id); setVersion(value => value + 1) }}>
                <Heart className="h-4 w-4" />
                {post.likeCount}
              </Button>
              <Button variant="outline" size="sm" onClick={() => { toggleHelpCollect(post.id, user.id); setVersion(value => value + 1) }}>
                <Star className={`h-4 w-4 ${isCollected ? 'fill-current' : ''}`} />
                {post.collectCount}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">回答列表</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sortedComments.map(comment => {
              const commentUser = users.find(item => item.id === comment.userId)
              return (
                <div key={comment.id} className="rounded-lg border p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {(commentUser?.name ?? '用户').slice(0, 1)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{commentUser?.name ?? '用户'}</span>
                      {comment.isOfficial && <Badge className="bg-blue-600">官方</Badge>}
                      <span>{comment.createdAt}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => { toggleHelpCommentLike(comment.id, user.id); setVersion(value => value + 1) }}>
                      <Heart className="h-4 w-4" />
                      {comment.likeCount}
                    </Button>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-6">{comment.content}</p>
                </div>
              )
            })}
            {sortedComments.length === 0 && (
              <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
                暂无回答
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 pt-6">
            <Textarea
              value={answer}
              onChange={event => setAnswer(event.target.value)}
              maxLength={300}
              rows={4}
              placeholder="写下你的回答（最多300字）"
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end">
              <Button onClick={submitAnswer}>提交</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="text-lg">发布人信息</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {displayName.slice(0, 1)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{displayName}</span>
          </div>
          {!post.isAnonymous && (
            <Button asChild className="w-full" variant="outline">
              <Link href={`/dashboard/profile?userId=${post.userId}`}>查看个人主页</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
