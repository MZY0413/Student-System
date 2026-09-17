// 更新教师账号：清空旧教师，创建真实教师（工号 = 登录账号，密码暂设为工号）
// 用法：npm run update:teachers
// 幂等：先删除所有 role='teacher' 的用户，再创建下方两位教师
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { usernameToEmail } from '../lib/auth-email'

dotenv.config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('请在 .env.local 中配置 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })

// 教师名单（工号 = 登录账号；密码暂设为工号）
const TEACHERS = [
  { username: '2990', name: '张靓菲' },
  { username: '2262', name: '吴晓雨' },
]

async function createTeacher(username: string, name: string): Promise<boolean> {
  const email = usernameToEmail(username)
  const attempt = async (password: string) =>
    supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role: 'teacher' },
    })

  // 密码暂设为工号；Supabase Auth 至少 6 位，工号不足 6 位时补零到 6 位
  let { data, error } = await attempt(username)
  let finalPassword = username
  if (error) {
    const padded = username.padStart(6, '0')
    finalPassword = padded
    const retry = await attempt(padded)
    error = retry.error
    data = retry.data
    if (!error) {
      console.log(`⚠ 工号 ${username} 不足 6 位，密码已补零为 "${padded}"`)
    }
  }

  if (error || !data.user) {
    console.error(`❌ 创建教师 ${username} 失败:`, error?.message)
    return false
  }

  const { error: userErr } = await supabase.from('users').insert({
    id: data.user.id,
    username,
    role: 'teacher',
    name,
    avatar: null,
    major: null,
    class_name: null,
    enrollment_grade: null,
  })
  if (userErr) {
    console.error(`❌ 写入 users 表失败（${username}）:`, userErr.message)
    return false
  }
  console.log(`✔ 教师 ${name}（工号 ${username}，登录密码 ${finalPassword}）`)
  return true
}

async function main() {
  // 1. 删除旧教师（auth 删除会级联删除 users 表记录）
  const { data: teacherRows } = await supabase.from('users').select('id, username, name').eq('role', 'teacher')
  const old = teacherRows ?? []
  for (const row of old) {
    const { error } = await supabase.auth.admin.deleteUser(row.id)
    if (error) {
      console.error(`❌ 删除旧教师 ${row.username} 失败:`, error.message)
    } else {
      console.log(`✔ 删除旧教师 ${row.name}（${row.username}）`)
    }
  }

  // 2. 创建新教师
  let ok = true
  for (const t of TEACHERS) {
    if (!(await createTeacher(t.username, t.name))) ok = false
  }

  if (!ok) process.exit(1)
  console.log(`✅ 教师更新完成（${TEACHERS.length} 名）`)
}

main()
