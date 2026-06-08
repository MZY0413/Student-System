'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import type { HelpPost, User } from '@/lib/types'
import { Heart, MessageCircle, Star } from 'lucide-react'

export function HelpPostCard({ post, author }: { post: HelpPost; author?: User }) {
  const displayName = post.isAnonymous ? '匿名用户' : author?.name ?? '匿名用户'
  const initial = displayName.slice(0, 1)

  return (
    <Link href={`/dashboard/help/${post.id}`}>
      <Card className="transition-colors hover:bg-muted/30">
        <CardContent className="space-y-4 p-4">
          <div className="space-y-3">
            <h2 className="line-clamp-2 text-lg font-semibold text-foreground">{post.title}</h2>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {initial}
                </AvatarFallback>
              </Avatar>
              <span>{displayName}</span>
              <span>{post.createdAt}</span>
            </div>
          </div>
          <div className="flex justify-end gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {post.likeCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              {post.commentCount}
            </span>
            <span className="inline-flex items-center gap-1">
              <Star className="h-4 w-4" />
              {post.collectCount}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
