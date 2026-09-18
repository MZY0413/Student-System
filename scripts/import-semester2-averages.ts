// 导入第二学期（大一下）平均成绩（用于按平均成绩排名）
// 平均成绩 = 该学期全部课程百分制分数的算术平均（含公选课）
// 用法：npm run import:averages2
// 幂等：semester_averages 按 (student_id, academic_year, semester) upsert
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error('请在 .env.local 中配置 NEXT_PUBLIC_SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } })

const ACADEMIC_YEAR = '2025-2026学年'
const SEMESTER = '第二学期'

type Row = { id: string }
type ScoreRow = { student_id: string; total_score: number | null }

async function main() {
  // 1. 第二学期全部课程
  const { data: courses, error: cErr } = await supabase
    .from('courses')
    .select('id')
    .eq('academic_year', ACADEMIC_YEAR)
    .eq('semester', SEMESTER)
  if (cErr) {
    console.error('❌ 查询课程失败:', cErr.message)
    process.exit(1)
  }
  const courseIds = (courses as Row[]).map(c => c.id)
  if (courseIds.length === 0) {
    console.error('❌ 未找到第二学期课程，请先运行 npm run import:semester2')
    process.exit(1)
  }

  // 2. 这些课程的成绩
  const { data: scs, error: scErr } = await supabase
    .from('student_courses')
    .select('student_id, total_score')
    .in('course_id', courseIds)
  if (scErr) {
    console.error('❌ 查询成绩失败:', scErr.message)
    process.exit(1)
  }

  // 3. 按学生汇总（求算术平均）
  const sums = new Map<string, { sum: number; n: number }>()
  for (const sc of (scs as ScoreRow[])) {
    if (sc.total_score == null) continue
    const entry = sums.get(sc.student_id) ?? { sum: 0, n: 0 }
    entry.sum += sc.total_score
    entry.n += 1
    sums.set(sc.student_id, entry)
  }

  const rows = Array.from(sums.entries()).map(([studentId, { sum, n }]) => ({
    student_id: studentId,
    academic_year: ACADEMIC_YEAR,
    semester: SEMESTER,
    average_score: Math.round((sum / n) * 100) / 100,
  }))

  const { error: upErr } = await supabase.from('semester_averages').upsert(rows)
  if (upErr) {
    console.error('❌ semester_averages 写入失败:', upErr.message)
    process.exit(1)
  }
  console.log(`✅ 完成。已写入 ${rows.length} 名同学的学期平均成绩（${ACADEMIC_YEAR} ${SEMESTER}）`)
}

main()
