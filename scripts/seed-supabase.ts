import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import {
  initialUsers,
  initialProfiles,
  initialBasicProfiles,
  initialCourses,
  initialStudentCourses,
} from '../lib/data'
import { AUTH_EMAIL_DOMAIN, initialPassword, usernameToEmail } from '../lib/auth-email'

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

// 清理本系统创建的旧 auth 用户（邮箱以固定域名结尾），保证可重复执行
async function clearAuthUsers(): Promise<number> {
  const { data: listData } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  const ours = (listData?.users ?? []).filter(u => u.email?.endsWith(AUTH_EMAIL_DOMAIN))
  for (const u of ours) {
    await supabase.auth.admin.deleteUser(u.id)
  }
  return ours.length
}

async function main() {
  const removed = await clearAuthUsers()
  if (removed > 0) console.log(`✔ 清理旧 auth 用户: ${removed} 个`)

  // 1. 创建 Auth 用户（密码 = 账号后六位），得到「账号 → auth uuid」映射
  const idMap = new Map<string, string>()
  for (const u of initialUsers) {
    const email = usernameToEmail(u.username)
    const password = initialPassword(u.username)
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: u.name, role: u.role },
    })
    if (error || !data.user) {
      console.error(`❌ 创建 auth 用户 ${u.username} 失败:`, error?.message)
      process.exit(1)
    }
    idMap.set(u.id, data.user.id)
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
