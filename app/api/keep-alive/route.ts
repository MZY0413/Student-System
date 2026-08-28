import { NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client'

// 防止免费版 Supabase 7 天无 API 活动被自动暂停：Vercel Cron 每天调用本路由，
// 对 users 表做一次轻量 HEAD 计数查询，产生真实 API 活动。
export const dynamic = 'force-dynamic'

export async function GET() {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: 'Supabase 未配置' }, { status: 500 })
  }

  const { error } = await supabase
    .from('users')
    .select('id', { count: 'exact', head: true })

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
