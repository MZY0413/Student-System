import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const token = process.env.SUPABASE_MANAGEMENT_TOKEN ?? ''

const ref = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? ''

async function main() {
  if (!ref || !token) {
    console.error('缺少 NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_MANAGEMENT_TOKEN（Management API PAT）')
    process.exit(1)
  }

  const sql = fs.readFileSync(path.resolve(process.cwd(), 'lib/supabase/schema.sql'), 'utf8')

  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })

  const text = await res.text()
  console.log('HTTP', res.status)
  console.log(text.slice(0, 4000))

  if (!res.ok) process.exit(1)
  console.log('✅ schema 已应用')
}

main()
