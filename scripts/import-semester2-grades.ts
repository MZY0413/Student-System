// 导入全班 24 名同学的第二学期（2025-2026 学年 春季 / 大一下）各科成绩
// 数据来源：中国传媒大学 2025 级人工智能（智能视听卓越人才实验班）成绩明细
// 用法：npm run import:semester2
// 幂等：courses 按课程号 upsert，student_courses 按 (student_id, course_id) upsert
// 说明：绩点是否计入由 category 决定（通识教育拓展课/核心课/特色课 = 公选不计入，必修 + 限选计入）
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

// 课程号（真实课程号来自成绩单；T9 开头为占位课程号，成绩单/培养方案未提供编号）
const g = {
  wuli: '2131010027', // 大学物理 B
  gailv: '2131010039', // 概率论与数理统计
  gaoshu: '2131010040', // 高等数学（下）A
  yingB2: '2161010033', // 大学英语B2
  tiyu: '2173010002', // 体育(2)
  xingshi: '2211010003', // 形势与政策(2)
  mayuan: '2211010024', // 马克思主义基本原理
  jiqiren: 'T9000011', // 机器人与人工智能（占位课程号）
  laodong: '1311040104', // 劳动教育
  shuju: '2111010011', // 数据结构与算法
  gongcheng: '2111040043', // 工程技术思维与创新实践
  meiti: '2111040081', // 媒体计算编程基础实践
  suanfa: '2111040085', // 算法应用与实践
  shiyan: '2131010005', // 大学物理实验
  yingA2: 'T9000012', // 大学英语A2（占位课程号）
  jianji: 'T9000013', // 剪辑的历史、理论与实践（公选）
  dianzi: 'T9000014', // 电子设计思维（公选）
  gaige: '1131021047', // 改革开放简史（公选）
  jingong: '2111040031', // 基于金工实训技术的艺术创作训练（院级实践选修）
  shuzi: 'T9000015', // 人工智能与数字素养（公选）
  zhuangzi: 'T9000016', // 庄子哲学（公选）
  dianying: 'T9000017', // 电影与精神分析导引（公选）
  xinli: 'T9000018', // 心理成长互动体验（公选）
  shehui: 'T9000019', // 社会主义发展简史（公选）
  yingxiang: 'T9000020', // 影像叙事观念与技巧（公选）
  hongguan: 'T9000021', // 宏观经济学（公选）
}

type Nature = '必修' | '限选' | '任选'

type CourseDef = { id: string; name: string; credit: number; category: string; nature: Nature }

const COURSES: CourseDef[] = [
  { id: g.wuli, name: '大学物理 B', credit: 4, category: '通识教育基础课', nature: '必修' },
  { id: g.gailv, name: '概率论与数理统计', credit: 3, category: '通识教育基础课', nature: '必修' },
  { id: g.gaoshu, name: '高等数学（下）A', credit: 6, category: '通识教育基础课', nature: '必修' },
  { id: g.yingB2, name: '大学英语B2', credit: 4, category: '通识教育基础课', nature: '必修' },
  { id: g.tiyu, name: '体育(2)', credit: 1, category: '基础教育课程', nature: '必修' },
  { id: g.xingshi, name: '形势与政策(2)', credit: 0.5, category: '通识教育基础课', nature: '必修' },
  { id: g.mayuan, name: '马克思主义基本原理', credit: 3, category: '通识教育基础课', nature: '必修' },
  { id: g.jiqiren, name: '机器人与人工智能', credit: 2, category: '通识教育基础课', nature: '必修' },
  { id: g.laodong, name: '劳动教育', credit: 1, category: '实践必修环节', nature: '必修' },
  { id: g.shuju, name: '数据结构与算法', credit: 3, category: '通识教育基础课', nature: '必修' },
  { id: g.gongcheng, name: '工程技术思维与创新实践', credit: 1, category: '实践选修环节', nature: '限选' },
  { id: g.meiti, name: '媒体计算编程基础实践', credit: 1, category: '通识教育基础课', nature: '必修' },
  { id: g.suanfa, name: '算法应用与实践', credit: 1.5, category: '实践选修环节', nature: '限选' },
  { id: g.shiyan, name: '大学物理实验', credit: 0.5, category: '通识教育基础课', nature: '必修' },
  { id: g.yingA2, name: '大学英语A2', credit: 4, category: '通识教育基础课', nature: '必修' },
  { id: g.jianji, name: '剪辑的历史、理论与实践', credit: 2, category: '通识教育拓展课', nature: '任选' },
  { id: g.dianzi, name: '电子设计思维', credit: 2, category: '通识教育拓展课', nature: '任选' },
  { id: g.gaige, name: '改革开放简史', credit: 1, category: '通识教育特色课', nature: '任选' },
  { id: g.jingong, name: '基于金工实训技术的艺术创作训练', credit: 2, category: '实践选修环节', nature: '限选' },
  { id: g.shuzi, name: '人工智能与数字素养', credit: 2, category: '通识教育拓展课', nature: '任选' },
  { id: g.zhuangzi, name: '庄子哲学', credit: 2, category: '通识教育拓展课', nature: '任选' },
  { id: g.dianying, name: '电影与精神分析导引', credit: 2, category: '通识教育拓展课', nature: '任选' },
  { id: g.xinli, name: '心理成长互动体验', credit: 2, category: '通识教育拓展课', nature: '任选' },
  { id: g.shehui, name: '社会主义发展简史', credit: 2, category: '通识教育拓展课', nature: '任选' },
  { id: g.yingxiang, name: '影像叙事观念与技巧', credit: 2, category: '通识教育拓展课', nature: '任选' },
  { id: g.hongguan, name: '宏观经济学', credit: 2, category: '通识教育拓展课', nature: '任选' },
]

function mapModule(category: string): { moduleId: number; module: string } {
  if (category.includes('创新创业')) return { moduleId: 5, module: '创新创业与素质拓展模块' }
  if (category.includes('实践')) return { moduleId: 4, module: '实践教学模块' }
  return { moduleId: 1, module: '通识教育模块' }
}

// 公选课（通识教育拓展课/核心课/特色课）只记录分数，不记录学分、不参与绩点
const GONGXUAN_CATEGORIES = new Set(['通识教育拓展课', '通识教育核心课', '通识教育特色课'])

const STUDENTS: { u: string; n: string; s: [string, number][] }[] = [
  { u: '202511173011', n: '杨嘉盛', s: [
    [g.wuli, 93], [g.gailv, 93], [g.gaoshu, 99], [g.yingB2, 92], [g.tiyu, 88],
    [g.xingshi, 88], [g.mayuan, 80], [g.jiqiren, 93], [g.laodong, 98], [g.shuju, 92],
    [g.gongcheng, 88], [g.meiti, 95], [g.suanfa, 97], [g.shiyan, 93],
  ]},
  { u: '202511173017', n: '魏子翔', s: [
    [g.wuli, 93], [g.gailv, 95], [g.gaoshu, 96], [g.yingB2, 88], [g.tiyu, 98],
    [g.xingshi, 91], [g.jiqiren, 90], [g.laodong, 92], [g.shuju, 95], [g.meiti, 96],
    [g.suanfa, 88], [g.jianji, 94], [g.dianzi, 89], [g.gaige, 79],
  ]},
  { u: '202511173008', n: '李子阳', s: [
    [g.wuli, 80], [g.gailv, 78], [g.gaoshu, 90], [g.yingB2, 93], [g.tiyu, 98],
    [g.xingshi, 95], [g.jiqiren, 87], [g.laodong, 88], [g.shuju, 90], [g.gongcheng, 85],
    [g.suanfa, 97], [g.dianzi, 88], [g.dianying, 97], [g.zhuangzi, 90], [g.xinli, 92],
  ]},
  { u: '202511173001', n: '朱云舒', s: [
    [g.wuli, 80], [g.gailv, 88], [g.gaoshu, 93], [g.yingB2, 91], [g.tiyu, 98],
    [g.xingshi, 93], [g.jiqiren, 91], [g.laodong, 90], [g.shuju, 77], [g.yingA2, 91],
    [g.zhuangzi, 94], [g.dianying, 90],
  ]},
  { u: '202511173003', n: '何与航', s: [
    [g.wuli, 86], [g.gailv, 82], [g.gaoshu, 77], [g.yingB2, 88], [g.tiyu, 85],
    [g.xingshi, 94], [g.mayuan, 82], [g.jiqiren, 86], [g.laodong, 95], [g.shuju, 85],
    [g.gongcheng, 100], [g.suanfa, 97], [g.xinli, 95],
  ]},
  { u: '202511173019', n: '米振宇', s: [
    [g.wuli, 86], [g.gailv, 90], [g.gaoshu, 98], [g.yingB2, 88], [g.tiyu, 93],
    [g.jiqiren, 86], [g.laodong, 90], [g.shuju, 90], [g.gongcheng, 87], [g.suanfa, 94],
    [g.gaige, 80],
  ]},
  { u: '202511173015', n: '廉宇航', s: [
    [g.wuli, 81], [g.gailv, 75], [g.gaoshu, 83], [g.yingB2, 84], [g.tiyu, 86],
    [g.xingshi, 96], [g.mayuan, 94], [g.jiqiren, 84], [g.laodong, 89], [g.shuju, 82],
    [g.gongcheng, 92], [g.suanfa, 92], [g.jingong, 100],
  ]},
  { u: '202511173016', n: '陶沐杰', s: [
    [g.wuli, 83], [g.gailv, 79], [g.gaoshu, 83], [g.yingB2, 77], [g.tiyu, 88],
    [g.xingshi, 96], [g.jiqiren, 83], [g.laodong, 91], [g.shuju, 92], [g.gongcheng, 91],
    [g.suanfa, 96],
  ]},
  { u: '202511173020', n: '邓诗越', s: [
    [g.wuli, 81], [g.gailv, 81], [g.gaoshu, 92], [g.yingB2, 84], [g.tiyu, 90],
    [g.xingshi, 95], [g.mayuan, 86], [g.jiqiren, 84], [g.laodong, 93], [g.shuju, 91],
    [g.gongcheng, 86], [g.suanfa, 88],
  ]},
  { u: '202511173021', n: '黄海芳', s: [
    [g.wuli, 73], [g.gailv, 76], [g.gaoshu, 78], [g.yingB2, 80], [g.tiyu, 91],
    [g.xingshi, 95], [g.mayuan, 85], [g.jiqiren, 85], [g.laodong, 90], [g.shuju, 94],
    [g.gongcheng, 90], [g.suanfa, 92],
  ]},
  { u: '202511173005', n: '史莫然', s: [
    [g.wuli, 86], [g.gailv, 85], [g.gaoshu, 87], [g.yingB2, 83], [g.tiyu, 95],
    [g.xingshi, 85], [g.jiqiren, 85], [g.laodong, 90], [g.shuju, 80], [g.gongcheng, 87],
    [g.dianying, 87],
  ]},
  { u: '202511173010', n: '刘晨曦', s: [
    [g.wuli, 69], [g.gailv, 71], [g.gaoshu, 90], [g.yingB2, 81], [g.tiyu, 88],
    [g.xingshi, 94], [g.mayuan, 72], [g.jiqiren, 83], [g.laodong, 90], [g.shuju, 82],
    [g.gongcheng, 84], [g.suanfa, 95],
  ]},
  { u: '202511173006', n: '马庆坤', s: [
    [g.wuli, 74], [g.gailv, 75], [g.gaoshu, 75], [g.yingB2, 88], [g.tiyu, 96],
    [g.xingshi, 71], [g.jiqiren, 88], [g.laodong, 90], [g.shuju, 81], [g.gongcheng, 92],
    [g.suanfa, 98], [g.shuzi, 84],
  ]},
  { u: '202511173014', n: '康雨乐', s: [
    [g.wuli, 67], [g.gailv, 76], [g.gaoshu, 82], [g.yingB2, 80], [g.tiyu, 93],
    [g.xingshi, 96], [g.mayuan, 86], [g.jiqiren, 84], [g.laodong, 90], [g.shuju, 85],
    [g.gongcheng, 90], [g.suanfa, 96],
  ]},
  { u: '202511173024', n: '曹林婷', s: [
    [g.wuli, 63], [g.gailv, 76], [g.gaoshu, 87], [g.yingB2, 91], [g.tiyu, 94],
    [g.xingshi, 85], [g.jiqiren, 77], [g.laodong, 80], [g.shuju, 86], [g.gongcheng, 91],
    [g.suanfa, 96], [g.dianying, 87],
  ]},
  { u: '202511173002', n: '陶知子', s: [
    [g.wuli, 76], [g.gailv, 78], [g.gaoshu, 94], [g.yingB2, 72], [g.tiyu, 80],
    [g.xingshi, 84], [g.mayuan, 74], [g.jiqiren, 82], [g.laodong, 91], [g.shuju, 85],
    [g.gongcheng, 95], [g.suanfa, 100], [g.jianji, 92],
  ]},
  { u: '202511173004', n: '杨梓鑫', s: [
    [g.wuli, 63], [g.gailv, 68], [g.gaoshu, 78], [g.yingB2, 80], [g.tiyu, 87],
    [g.xingshi, 89], [g.mayuan, 81], [g.jiqiren, 85], [g.laodong, 86], [g.shuju, 70],
    [g.gongcheng, 92], [g.gaige, 97], [g.yingA2, 80],
  ]},
  { u: '202511173022', n: '谢佳良', s: [
    [g.wuli, 72], [g.gailv, 70], [g.gaoshu, 68], [g.yingB2, 81], [g.tiyu, 90],
    [g.xingshi, 86], [g.mayuan, 81], [g.jiqiren, 87], [g.laodong, 83], [g.shuju, 91],
    [g.gongcheng, 85], [g.suanfa, 94],
  ]},
  { u: '202511173025', n: '陈宣融', s: [
    [g.wuli, 70], [g.gailv, 64], [g.gaoshu, 80], [g.yingB2, 77], [g.tiyu, 94],
    [g.xingshi, 88], [g.mayuan, 79], [g.jiqiren, 80], [g.laodong, 90], [g.shuju, 92],
    [g.gongcheng, 97], [g.suanfa, 96], [g.dianying, 82],
  ]},
  { u: '202511173018', n: '李梓鸣', s: [
    [g.wuli, 66], [g.gailv, 79], [g.gaoshu, 81], [g.yingB2, 77], [g.tiyu, 90],
    [g.xingshi, 64], [g.mayuan, 78], [g.jiqiren, 85], [g.laodong, 85], [g.shuju, 100],
    [g.gongcheng, 88],
  ]},
  { u: '202511173007', n: '张凯', s: [
    [g.wuli, 87], [g.gailv, 60], [g.gaoshu, 86], [g.yingB2, 78], [g.tiyu, 81],
    [g.xingshi, 77], [g.jiqiren, 82], [g.laodong, 84], [g.shuju, 85], [g.gongcheng, 77],
    [g.suanfa, 92], [g.shiyan, 89],
  ]},
  { u: '202511173023', n: '朱思谦', s: [
    [g.wuli, 60], [g.gailv, 60], [g.gaoshu, 71], [g.yingB2, 86], [g.tiyu, 92],
    [g.xingshi, 72], [g.mayuan, 95], [g.jiqiren, 90], [g.laodong, 84], [g.shuju, 91],
    [g.gongcheng, 88], [g.suanfa, 80], [g.dianying, 81], [g.shehui, 99],
    [g.yingxiang, 95], [g.hongguan, 74],
  ]},
  { u: '202511173013', n: '张天翔', s: [
    [g.wuli, 80], [g.gailv, 70], [g.gaoshu, 65], [g.yingB2, 76], [g.tiyu, 87],
    [g.xingshi, 86], [g.mayuan, 80], [g.jiqiren, 84], [g.laodong, 85], [g.shuju, 86],
    [g.gongcheng, 86], [g.suanfa, 88],
  ]},
  { u: '202511173009', n: '王安桥', s: [
    [g.wuli, 63], [g.gailv, 71], [g.gaoshu, 73], [g.yingB2, 85], [g.tiyu, 91],
    [g.xingshi, 80], [g.mayuan, 86], [g.jiqiren, 85], [g.laodong, 83], [g.shuju, 82],
    [g.gongcheng, 89], [g.suanfa, 90], [g.dianying, 82],
  ]},
]

async function main() {
  // 1. 清理本脚本覆盖课程的历史成绩（含米振宇旧的第二学期数据、劳动教育的旧成绩），保证重复执行不残留
  const courseIds = COURSES.map(c => c.id)
  const { error: delErr } = await supabase.from('student_courses').delete().in('course_id', courseIds)
  if (delErr) {
    console.error('❌ 清理历史成绩失败:', delErr.message)
    process.exit(1)
  }

  // 2. 一次性查询全部用户名 → uuid
  const usernames = STUDENTS.map(s => s.u)
  const { data: userRows, error: userErr } = await supabase
    .from('users')
    .select('id, username, name')
    .in('username', usernames)
  if (userErr) {
    console.error('❌ 查询用户失败:', userErr.message)
    process.exit(1)
  }
  const idMap = new Map((userRows ?? []).map(row => [row.username, row.id]))
  const missing = usernames.filter(u => !idMap.has(u))
  if (missing.length) {
    console.error(`❌ 找不到用户（学号）：${missing.join(', ')}`)
    process.exit(1)
  }

  // 3. 写入课程（绩点是否计入由 category 决定：通识教育拓展课/核心课/特色课 = 公选，不计入绩点）
  const courseRows = COURSES.map(c => {
    const { moduleId, module } = mapModule(c.category)
    const isRequired = c.nature === '必修'
    return {
      id: c.id,
      name: c.name,
      credit: GONGXUAN_CATEGORIES.has(c.category) ? 0 : c.credit,
      module_id: moduleId,
      module,
      year: 1,
      academic_year: ACADEMIC_YEAR,
      semester: SEMESTER,
      course_attribute: isRequired ? '必修' : '选修',
      credit_requirement: isRequired ? '必修' : '选修',
      category: c.category,
      suggested_semester: SEMESTER,
      is_core: isRequired,
      status: 'completed',
    }
  })
  const { error: courseErr } = await supabase.from('courses').upsert(courseRows)
  if (courseErr) {
    console.error('❌ courses 写入失败:', courseErr.message)
    process.exit(1)
  }
  console.log(`✔ courses: ${courseRows.length} 门`)

  // 4. 写入学生成绩（全部为百分制，考试状态均为「通过」）
  const scRows: Record<string, unknown>[] = []
  for (const student of STUDENTS) {
    const studentId = idMap.get(student.u)!
    for (const [courseId, score] of student.s) {
      scRows.push({
        student_id: studentId,
        course_id: courseId,
        status: 'completed',
        regular_score: null,
        final_score: null,
        total_score: score,
        gpa: null,
        exam_status: '通过',
        remediation_status: '无需',
      })
    }
  }
  const { error: scErr } = await supabase.from('student_courses').upsert(scRows)
  if (scErr) {
    console.error('❌ student_courses 写入失败:', scErr.message)
    process.exit(1)
  }
  console.log(`✔ student_courses: ${scRows.length} 条`)

  // 5. 汇总
  const total = STUDENTS.reduce((sum, s) => sum + s.s.length, 0)
  console.log(`✅ 完成。${STUDENTS.length} 名同学 / ${total} 门课程成绩（${ACADEMIC_YEAR} ${SEMESTER}）`)
}

main()
