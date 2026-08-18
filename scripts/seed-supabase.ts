import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import {
  initialUsers,
  initialProfiles,
  initialBasicProfiles,
  initialCourses,
  initialStudentCourses,
} from '../lib/data'

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

async function main() {
  await upsert('users', initialUsers.map(u => ({
    id: u.id,
    username: u.username,
    role: u.role,
    name: u.name,
    avatar: u.avatar ?? null,
    major: u.major ?? null,
    class_name: u.className ?? null,
    enrollment_grade: u.enrollmentGrade ?? null,
  })))

  await upsert('basic_profiles', initialBasicProfiles.map(p => ({
    user_id: p.userId,
    name: p.name,
    gender: p.gender,
    grade: p.grade,
    hometown: p.hometown,
    email: p.email,
    experiences: p.experiences,
    strengths: p.strengths,
  })))

  await upsert('student_profiles', initialProfiles.map(p => ({
    user_id: p.userId,
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
    student_id: sc.studentId,
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
