// 导入全班 24 名同学的学期平均成绩（用于按平均成绩排名）
// 数据来源：D:\25人工智能大一上成绩明细表（2025-2026 学年 第一学期 成绩表）
// 用法：npm run import:averages
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
const SEMESTER = '第一学期'

// 学号 → 平均成绩（成绩表末尾「平均成绩」列，非绩点）
const averages: [string, number][] = [
  ['202511173001', 93.71], // 朱云舒
  ['202511173008', 92.76], // 李子阳
  ['202511173015', 92.18], // 廉宇航
  ['202511173021', 91],    // 黄海芳
  ['202511173003', 90.44], // 何与航
  ['202511173010', 90.28], // 刘晨曦
  ['202511173017', 89.94], // 魏子翔
  ['202511173025', 89.71], // 陈宣融
  ['202511173016', 89.71], // 陶沐杰
  ['202511173011', 89.47], // 杨嘉盛
  ['202511173005', 89.44], // 史莫然
  ['202511173014', 89.24], // 康雨乐
  ['202511173019', 88.53], // 米振宇
  ['202511173004', 88.53], // 杨梓鑫
  ['202511173020', 88.17], // 邓诗越
  ['202511173024', 87.94], // 曹林婷
  ['202511173013', 87.93], // 张天翔
  ['202511173006', 86.29], // 马庆坤
  ['202511173009', 85.69], // 王安桥
  ['202511173007', 85],    // 张凯
  ['202511173022', 84.13], // 谢佳良
  ['202511173018', 83.81], // 李梓鸣
  ['202511173002', 82.36], // 陶知子
  ['202511173023', 79.13], // 朱思谦
]

async function main() {
  const rows: { student_id: string; academic_year: string; semester: string; average_score: number }[] = []
  const missing: string[] = []

  for (const [username, averageScore] of averages) {
    const { data: userRow, error } = await supabase
      .from('users')
      .select('id, name')
      .eq('username', username)
      .maybeSingle()
    if (error || !userRow) {
      missing.push(username)
      continue
    }
    rows.push({
      student_id: userRow.id,
      academic_year: ACADEMIC_YEAR,
      semester: SEMESTER,
      average_score: averageScore,
    })
  }

  if (missing.length) {
    console.error(`❌ 找不到用户（学号）：${missing.join(', ')}`)
  }

  const { error: upsertErr } = await supabase.from('semester_averages').upsert(rows)
  if (upsertErr) {
    console.error('❌ semester_averages 写入失败:', upsertErr.message)
    process.exit(1)
  }

  console.log(`✅ 完成。已写入 ${rows.length} 名同学的学期平均成绩（${ACADEMIC_YEAR} ${SEMESTER}）`)
  if (missing.length) process.exit(1)
}

main()
