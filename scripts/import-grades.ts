// 导入米振宇（学号 202511173019）的真实成绩
// 用法：npm run import:grades
// 幂等：courses 按课程号 upsert，student_courses 按 (student_id, course_id) upsert
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

const TARGET_USERNAME = '202511173019' // 米振宇

// 课程号 / 课程名 / 总成绩 / 学分 / 课程类别 / 课程性质(必修|任选|限选) / 学期
type RawCourse = {
  no: string
  name: string
  score: number
  credit: number
  category: string
  nature: '必修' | '任选' | '限选'
  term: '秋' | '春'
}

const rawCourses: RawCourse[] = [
  // ── 2025-2026 秋季学期（第一学期）──
  { no: '1131040091', name: '算法与程序设计实训', score: 84, credit: 2, category: '校级实践与创新创业教育选修课', nature: '限选', term: '秋' },
  { no: '1081010001', name: '大学生安全教育', score: 92, credit: 1, category: '通识教育拓展课', nature: '任选', term: '秋' },
  { no: '1131020717', name: '语言沟通与表达', score: 95, credit: 2, category: '通识教育核心课', nature: '任选', term: '秋' },
  { no: '2131010036', name: '高等数学（上）', score: 95, credit: 5, category: '通识教育基础课', nature: '必修', term: '秋' },
  { no: '2211010029', name: '习近平新时代中国特色社会主义思想概论', score: 85, credit: 3, category: '通识教育基础课', nature: '必修', term: '秋' },
  { no: '2211010002', name: '形势与政策(1)', score: 89, credit: 0.5, category: '通识教育基础课', nature: '必修', term: '秋' },
  { no: '1071040003', name: '军事技能', score: 91, credit: 2, category: '实践必修环节', nature: '必修', term: '秋' },
  { no: '2191010002', name: '大学生职业生涯规划', score: 94, credit: 1, category: '实践必修环节', nature: '必修', term: '秋' },
  { no: '2111010039', name: '智能传媒技术导论', score: 94, credit: 2, category: '通识教育基础课', nature: '必修', term: '秋' },
  { no: '1131020713', name: '大学生信息素养——数字资源的检索与利用', score: 82, credit: 1, category: '通识教育核心课', nature: '任选', term: '秋' },
  { no: '2131010033', name: '线性代数', score: 95, credit: 3, category: '通识教育基础课', nature: '必修', term: '秋' },
  { no: '1071040002', name: '军事理论课', score: 68, credit: 2, category: '实践必修环节', nature: '必修', term: '秋' },
  { no: '2161010032', name: '大学英语B1', score: 90, credit: 4, category: '通识教育基础课', nature: '必修', term: '秋' },
  { no: '2111010036', name: 'C/C++语言程序设计', score: 84, credit: 3, category: '通识教育基础课', nature: '必修', term: '秋' },
  { no: '1071010002', name: '大学生心理健康教育', score: 95, credit: 2, category: '基础教育课程', nature: '必修', term: '秋' },
  { no: '2211010025', name: '思想道德与法治', score: 92, credit: 3, category: '通识教育基础课', nature: '必修', term: '秋' },
  { no: '2173010001', name: '体育(1)', score: 80, credit: 1, category: '基础教育课程', nature: '必修', term: '秋' },
  // ── 2025-2026 春季学期（第二学期）──
  { no: '2111040085', name: '算法应用与实践', score: 87, credit: 1.5, category: '实践选修环节', nature: '限选', term: '春' },
  { no: '2131010005', name: '大学物理实验', score: 94, credit: 0.5, category: '通识教育基础课', nature: '必修', term: '春' },
  { no: '1311040104', name: '劳动教育', score: 86, credit: 1, category: '实践必修环节', nature: '必修', term: '春' },
  { no: '1131020672', name: '汉字与历史文化', score: 94, credit: 2, category: '通识教育核心课', nature: '任选', term: '春' },
  { no: '2161010033', name: '大学英语B2', score: 88, credit: 4, category: '通识教育基础课', nature: '必修', term: '春' },
  { no: '2111040043', name: '工程技术思维与创新实践', score: 90, credit: 1, category: '实践选修环节', nature: '限选', term: '春' },
  { no: '2173010002', name: '体育(2)', score: 93, credit: 1, category: '基础教育课程', nature: '必修', term: '春' },
  { no: '2131010039', name: '概率论与数理统计', score: 90, credit: 3, category: '通识教育基础课', nature: '必修', term: '春' },
  { no: '2211010024', name: '马克思主义基本原理', score: 83, credit: 3, category: '通识教育基础课', nature: '必修', term: '春' },
  { no: '2131010040', name: '高等数学（下）A', score: 98, credit: 6, category: '通识教育基础课', nature: '必修', term: '春' },
  { no: '2211010003', name: '形势与政策(2)', score: 90, credit: 0.5, category: '通识教育基础课', nature: '必修', term: '春' },
  { no: '1131021047', name: '改革开放简史', score: 80, credit: 1, category: '通识教育特色课', nature: '任选', term: '春' },
  { no: '2131010027', name: '大学物理 B', score: 86, credit: 4, category: '通识教育基础课', nature: '必修', term: '春' },
  { no: '1131020686', name: '邂逅交响乐', score: 96, credit: 2, category: '通识教育特色课', nature: '任选', term: '春' },
  { no: '2111010011', name: '数据结构与算法', score: 80, credit: 3, category: '通识教育基础课', nature: '必修', term: '春' },
  { no: '2111040081', name: '媒体计算编程基础实践', score: 90, credit: 1, category: '通识教育基础课', nature: '必修', term: '春' },
]

function mapModule(category: string): { moduleId: number; module: string } {
  if (category.includes('创新创业')) return { moduleId: 5, module: '创新创业与素质拓展模块' }
  if (category.includes('实践')) return { moduleId: 4, module: '实践教学模块' }
  return { moduleId: 1, module: '通识教育模块' }
}

async function main() {
  // 1. 找到米振宇的 uuid
  const { data: userRow, error: userErr } = await supabase
    .from('users')
    .select('id, name')
    .eq('username', TARGET_USERNAME)
    .maybeSingle()
  if (userErr || !userRow) {
    console.error(`❌ 找不到用户 ${TARGET_USERNAME}:`, userErr?.message)
    process.exit(1)
  }
  console.log(`✔ 目标学生: ${userRow.name} (${TARGET_USERNAME}) uuid=${userRow.id}`)

  // 2. 生成 courses 行 + student_courses 行
  const courseRows = rawCourses.map(c => {
    const { moduleId, module } = mapModule(c.category)
    const isRequired = c.nature === '必修'
    return {
      id: c.no,
      name: c.name,
      credit: c.credit,
      module_id: moduleId,
      module,
      year: 1,
      academic_year: '2025-2026学年',
      semester: c.term === '秋' ? '第一学期' : '第二学期',
      course_attribute: isRequired ? '必修' : '选修',
      credit_requirement: isRequired ? '必修' : '选修',
      category: c.category,
      suggested_semester: c.term === '秋' ? '第一学期' : '第二学期',
      is_core: isRequired,
      status: 'completed',
    }
  })

  const studentCourseRows = rawCourses.map(c => ({
    student_id: userRow.id,
    course_id: c.no,
    status: 'completed',
    regular_score: null,
    final_score: null,
    total_score: c.score,
    exam_status: '通过',
    remediation_status: '无需',
  }))

  // 3. upsert
  const { error: courseErr } = await supabase.from('courses').upsert(courseRows)
  if (courseErr) {
    console.error('❌ courses 写入失败:', courseErr.message)
    process.exit(1)
  }
  console.log(`✔ courses: ${courseRows.length} 门`)

  const { error: scErr } = await supabase.from('student_courses').upsert(studentCourseRows)
  if (scErr) {
    console.error('❌ student_courses 写入失败:', scErr.message)
    process.exit(1)
  }
  console.log(`✔ student_courses: ${studentCourseRows.length} 条`)

  // 4. 汇总
  const totalCredits = rawCourses.reduce((sum, c) => sum + c.credit, 0)
  console.log(`✅ 完成。米振宇成绩：${rawCourses.length} 门课，总学分 ${totalCredits}（第一学期 ${rawCourses.filter(c => c.term === '秋').length} 门 / 第二学期 ${rawCourses.filter(c => c.term === '春').length} 门）`)
}

main()
