import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import {
  initialUsers,
  initialProfiles,
  initialBasicProfiles,
  initialCourses,
  initialStudentCourses,
} from '../lib/data'
import { usernameToEmail } from '../lib/auth-email'

dotenv.config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('请在 .env.local 中配置 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
})

async function upsert(table: string, rows: Record<string, unknown>[]) {
  const { error } = await supabase.from(table).upsert(rows)
  if (error) {
    console.error(`❌ ${table} 写入失败:`, error.message)
  } else {
    console.log(`✔ ${table}: ${rows.length} 行`)
  }
}

// 创建（或复用）Auth 用户，返回 auth.users 的 uuid
async function getOrCreateAuthUser(email: string, password: string, name: string, role: string): Promise<string> {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, role },
  })
  if (!error && data.user) return data.user.id

  // 已存在：按邮箱找回
  const { data: listData } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const existing = listData?.users.find(u => u.email?.toLowerCase() === email.toLowerCase())
  if (existing) return existing.id

  throw error ?? new Error(`无法创建或找到 Auth 用户: ${email}`)
}

async function main() {
  // 1. 创建（或复用）Auth 用户，得到「种子文本 id → auth uuid」映射
  const idMap = new Map<string, string>()
  for (const u of initialUsers) {
    const email = usernameToEmail(u.username)
    const authId = await getOrCreateAuthUser(email, u.password, u.name, u.role)
    idMap.set(u.id, authId)
  }
  console.log(`✔ auth.users: ${idMap.size} 个`)

  // 2. 应用用户表（id = auth uuid）
  await upsert('users', initialUsers.map(u => ({
    id: idMap.get(u.id)!,
    username: u.username,
    role: u.role,
    name: u.name,
    avatar: u.avatar ?? null,
    major: u.major ?? null,
    class_name: u.className ?? null,
    enrollment_grade: u.enrollmentGrade ?? null,
  })))

  await upsert('basic_profiles', initialBasicProfiles.map(p => ({
    user_id: idMap.get(p.userId)!,
    name: p.name,
    gender: p.gender,
    grade: p.grade,
    hometown: p.hometown,
    email: p.email,
    experiences: p.experiences,
    strengths: p.strengths,
  })))

  await upsert('student_profiles', initialProfiles.map(p => ({
    user_id: idMap.get(p.userId)!,
    nickname: p.nickname,
    bio: p.bio,
    interests: p.interests,
    skills: p.skills,
    projects: p.projects,
  })))

  await upsert('courses', initialCourses.map(c => ({
    id: c.id,
    name: c.name,
    credit: c.credit,
    module_id: c.moduleId,
    module: c.module,
    year: c.year,
    academic_year: c.academicYear,
    semester: c.semester,
    course_attribute: c.courseAttribute,
    credit_requirement: c.creditRequirement,
    category: c.category,
    suggested_semester: c.suggestedSemester,
    is_core: c.isCore,
    status: c.status,
  })))

  await upsert('student_courses', initialStudentCourses.map(sc => ({
    student_id: idMap.get(sc.studentId)!,
    course_id: sc.courseId,
    status: sc.status,
    regular_score: sc.regularScore ?? null,
    final_score: sc.finalScore ?? null,
    total_score: sc.totalScore ?? null,
    exam_status: sc.examStatus ?? null,
    remediation_status: sc.remediationStatus ?? null,
  })))

  console.log('✅ 种子数据写入完成')
}

main()
