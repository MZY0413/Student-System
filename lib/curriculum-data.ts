import type { Course, StudentCourse } from './types'

export const aiMajorCurriculum = {
  modules: [
    {
      module_id: 1,
      module_name: '通识教育模块',
      required_credits: 48,
      elective_credits: 12,
      courses: {
        required: [
          { name: '思想道德修养与法律基础', credit: 3, semester: 1 },
          { name: '中国近现代史纲要', credit: 3, semester: 2 },
          { name: '毛泽东思想和中国特色社会主义理论体系概论', credit: 5, semester: 3 },
          { name: '马克思主义基本原理', credit: 3, semester: 4 },
          { name: '形势与政策', credit: 2, semester: '1-8' },
          { name: '大学英语(1-4)', credit: 16, semester: '1-4' },
          { name: '大学体育(1-4)', credit: 4, semester: '1-4' },
          { name: '军事理论', credit: 2, semester: 1 },
          { name: '军事技能训练(军训)', credit: 2, semester: 1 },
          { name: '高等数学A(1-2)', credit: 10, semester: '1-2' },
          { name: '线性代数A', credit: 3, semester: 2 },
          { name: '概率论与数理统计A', credit: 3, semester: 3 },
          { name: '大学计算机基础', credit: 2, semester: 1 },
          { name: '心理健康教育', credit: 1, semester: 1 },
          { name: '劳动教育', credit: 2, semester: '1-8' },
        ],
        elective: [
          { name: '人文社科类选修课', credit: 4, note: '至少修满4学分' },
          { name: '艺术美育类选修课', credit: 3, note: '至少修满3学分' },
          { name: '跨学科通识课', credit: 2, note: '至少修满2学分' },
          { name: '自然科学泛选课', credit: 2, note: '至少修满2学分' },
          { name: '国学文化类选修课', credit: 1, note: '至少修满1学分' },
        ],
      },
    },
    {
      module_id: 2,
      module_name: '学科基础模块',
      required_credits: 32,
      elective_credits: 8,
      courses: {
        required: [
          { name: '离散数学', credit: 4, semester: 2 },
          { name: '大学物理A(1-2)', credit: 8, semester: '1-2' },
          { name: 'C/C++程序设计', credit: 4, semester: 1 },
          { name: 'Python程序设计', credit: 3, semester: 2 },
          { name: '逻辑学导论', credit: 2, semester: 3 },
          { name: '人工智能工程导论', credit: 2, semester: 1 },
          { name: '计算机组成原理', credit: 4, semester: 3 },
          { name: '操作系统原理', credit: 3, semester: 4 },
          { name: '数据结构与算法A', credit: 4, semester: 3 },
        ],
        elective: [
          { name: '数据库系统原理', credit: 3, semester: 4 },
          { name: '计算机网络', credit: 3, semester: 4 },
          { name: '软件工程导论', credit: 2, semester: 5 },
          { name: '信息安全基础', credit: 2, semester: 5 },
          { name: '嵌入式系统基础', credit: 3, semester: 5 },
        ],
      },
    },
    {
      module_id: 3,
      module_name: '专业教育模块',
      required_credits: 30,
      elective_credits: 20,
      courses: {
        required: [
          { name: '人工智能导论', credit: 3, semester: 3 },
          { name: '机器学习', credit: 4, semester: 4 },
          { name: '深度学习', credit: 4, semester: 5 },
          { name: '神经网络与深度学习', credit: 3, semester: 5 },
          { name: '模式识别', credit: 3, semester: 5 },
          { name: '计算机视觉', credit: 3, semester: 6 },
          { name: '自然语言处理', credit: 3, semester: 6 },
          { name: '强化学习', credit: 3, semester: 6 },
          { name: '大数据处理技术', credit: 3, semester: 4 },
          { name: '智能算法设计与分析', credit: 3, semester: 6 },
        ],
        elective: {
          计算机视觉方向: ['数字图像处理', '目标检测与跟踪', '图像生成技术', '三维视觉'],
          自然语言处理方向: ['计算语言学', '文本挖掘', '大语言模型应用', '机器翻译'],
          智能机器人方向: ['机器人学基础', '运动控制', '机器人感知', 'SLAM技术'],
          大数据与智能决策方向: ['数据挖掘', '推荐系统', '计算广告学', '博弈论与决策'],
          自动驾驶方向: ['自动驾驶感知', '自动驾驶决策规划', '多传感器融合'],
        },
      },
    },
    {
      module_id: 4,
      module_name: '实践教学模块',
      required_credits: 25,
      elective_credits: 0,
      courses: {
        required: [
          { name: '入学教育', credit: 1, semester: 1 },
          { name: '劳动实践', credit: 2, semester: '1-8' },
          { name: '思政社会实践', credit: 2, semester: '2-3' },
          { name: '基础课程实验(高数/物理/编程)', credit: 6, semester: '1-4' },
          { name: 'C++程序设计实训', credit: 1, semester: 1 },
          { name: 'Python程序设计实训', credit: 1, semester: 2 },
          { name: '算法设计实训', credit: 2, semester: 3 },
          { name: 'AI综合课程设计', credit: 3, semester: 6 },
          { name: '专业认识实习', credit: 1, semester: 4 },
          { name: '生产实习', credit: 4, semester: 7 },
          { name: '企业项目实训', credit: 3, semester: 7 },
          { name: '毕业实习', credit: 2, semester: 8 },
          { name: '毕业设计(论文)', credit: 8, semester: 8 },
        ],
      },
    },
    {
      module_id: 5,
      module_name: '创新创业与素质拓展模块',
      required_credits: 10,
      elective_credits: 0,
      courses: {
        required: [
          { name: '创新创业基础', credit: 2, semester: 5 },
          { name: '科研方法论', credit: 1, semester: 4 },
          { name: '大学生创新创业训练计划(SRTP)', credit: 3, note: '可替换' },
          { name: '学科竞赛(数学建模/蓝桥杯/ACM/AI挑战赛)', credit: 2, note: '可替换' },
          { name: '学术讲座与学术活动', credit: 1, semester: '1-8' },
          { name: '职业发展规划与就业指导', credit: 1, semester: 7 },
        ],
      },
    },
  ],
} as const

type SeedCourse = { name: string; credit: number; semester?: number | string; note?: string }
type FlattenedCourse = SeedCourse & {
  moduleId: number
  moduleName: Course['module']
  attribute: '必修' | '选修'
}

function semesterToYear(semester?: number | string): 1 | 2 | 3 | 4 {
  const first = typeof semester === 'number' ? semester : typeof semester === 'string' ? Number(semester.split('-')[0]) || 1 : 1
  return Math.min(Math.max(Math.ceil(first / 2), 1), 4) as 1 | 2 | 3 | 4
}

function semesterToTerm(semester?: number | string) {
  const first = typeof semester === 'number' ? semester : typeof semester === 'string' ? Number(semester.split('-')[0]) || 1 : 1
  return first % 2 === 1 ? '第一学期' : '第二学期'
}

function academicYear(year: 1 | 2 | 3 | 4) {
  const start = 2024 + year - 1
  return `${start}-${start + 1}学年`
}

const flattened: FlattenedCourse[] = aiMajorCurriculum.modules.flatMap(module => {
  const required = module.courses.required.map(course => ({
    ...(course as SeedCourse),
    moduleId: module.module_id,
    moduleName: module.module_name,
    attribute: '必修' as const,
  }))

  const electiveSource = 'elective' in module.courses ? module.courses.elective : undefined
  const elective = Array.isArray(electiveSource)
    ? electiveSource.map(course => ({ ...(course as SeedCourse), moduleId: module.module_id, moduleName: module.module_name, attribute: '选修' as const }))
    : Object.values((electiveSource ?? {}) as Record<string, readonly string[]>).flatMap(items => items.map(name => ({
        name,
        credit: 4,
        semester: 6,
        moduleId: module.module_id,
        moduleName: module.module_name,
        attribute: '选修' as const,
      })))

  return [...required, ...elective]
})

export const curriculumModulePlans = aiMajorCurriculum.modules.map(module => ({
  moduleId: module.module_id,
  name: module.module_name,
  requiredCredits: module.required_credits,
  electiveCredits: module.elective_credits,
}))

export const initialCourses: Course[] = flattened.map((course, index) => {
  const year = semesterToYear(course.semester)
  return {
    id: `ai-${String(index + 1).padStart(3, '0')}`,
    name: course.name,
    credit: course.credit,
    moduleId: course.moduleId,
    module: course.moduleName,
    year,
    academicYear: academicYear(year),
    semester: semesterToTerm(course.semester),
    courseAttribute: course.attribute,
    creditRequirement: course.attribute,
    category: course.moduleName,
    suggestedSemester: course.semester?.toString() ?? course.note ?? '按培养方案选修',
    isCore: course.attribute === '必修' || ['机器学习', '深度学习', '计算机视觉', '自然语言处理', '毕业设计(论文)'].includes(course.name),
    status: 'notStarted',
  }
})

const student1: Record<string, Partial<StudentCourse>> = {
  思想道德修养与法律基础: { status: 'completed', totalScore: 88, examStatus: '通过', remediationStatus: '无需' },
  中国近现代史纲要: { status: 'completed', totalScore: 86, examStatus: '通过', remediationStatus: '无需' },
  毛泽东思想和中国特色社会主义理论体系概论: { status: 'completed', totalScore: 82, examStatus: '通过', remediationStatus: '无需' },
  形势与政策: { status: 'inProgress' },
  '大学英语(1-4)': { status: 'completed', totalScore: 91, examStatus: '通过', remediationStatus: '无需' },
  '大学体育(1-4)': { status: 'completed', totalScore: 89, examStatus: '通过', remediationStatus: '无需' },
  军事理论: { status: 'completed', totalScore: 84, examStatus: '通过', remediationStatus: '无需' },
  '军事技能训练(军训)': { status: 'completed', totalScore: 90, examStatus: '通过', remediationStatus: '无需' },
  '高等数学A(1-2)': { status: 'completed', totalScore: 92, examStatus: '通过', remediationStatus: '无需' },
  线性代数A: { status: 'completed', totalScore: 88, examStatus: '通过', remediationStatus: '无需' },
  概率论与数理统计A: { status: 'completed', totalScore: 85, examStatus: '通过', remediationStatus: '无需' },
  大学计算机基础: { status: 'completed', totalScore: 93, examStatus: '通过', remediationStatus: '无需' },
  心理健康教育: { status: 'completed', totalScore: 87, examStatus: '通过', remediationStatus: '无需' },
  劳动教育: { status: 'inProgress' },
  人文社科类选修课: { status: 'completed', totalScore: 86, examStatus: '通过', remediationStatus: '无需' },
  艺术美育类选修课: { status: 'completed', totalScore: 90, examStatus: '通过', remediationStatus: '无需' },
  离散数学: { status: 'completed', totalScore: 83, examStatus: '通过', remediationStatus: '无需' },
  '大学物理A(1-2)': { status: 'completed', totalScore: 78, examStatus: '通过', remediationStatus: '无需' },
  'C/C++程序设计': { status: 'completed', totalScore: 86, examStatus: '通过', remediationStatus: '无需' },
  Python程序设计: { status: 'completed', totalScore: 95, examStatus: '通过', remediationStatus: '无需' },
  逻辑学导论: { status: 'completed', totalScore: 76, examStatus: '通过', remediationStatus: '无需' },
  人工智能工程导论: { status: 'completed', totalScore: 89, examStatus: '通过', remediationStatus: '无需' },
  计算机组成原理: { status: 'completed', totalScore: 82, examStatus: '通过', remediationStatus: '无需' },
  操作系统原理: { status: 'inProgress' },
  数据结构与算法A: { status: 'completed', totalScore: 87, examStatus: '通过', remediationStatus: '无需' },
  数据库系统原理: { status: 'inProgress' },
  人工智能导论: { status: 'completed', totalScore: 90, examStatus: '通过', remediationStatus: '无需' },
  机器学习: { status: 'completed', totalScore: 88, examStatus: '通过', remediationStatus: '无需' },
  大数据处理技术: { status: 'completed', totalScore: 84, examStatus: '通过', remediationStatus: '无需' },
  深度学习: { status: 'inProgress' },
  神经网络与深度学习: { status: 'inProgress' },
  模式识别: { status: 'completed', totalScore: 58, examStatus: '不及格', remediationStatus: '待重修' },
  数字图像处理: { status: 'completed', totalScore: 89, examStatus: '通过', remediationStatus: '无需' },
  计算语言学: { status: 'inProgress' },
  入学教育: { status: 'completed', totalScore: 90, examStatus: '通过', remediationStatus: '无需' },
  劳动实践: { status: 'inProgress' },
  思政社会实践: { status: 'completed', totalScore: 88, examStatus: '通过', remediationStatus: '无需' },
  '基础课程实验(高数/物理/编程)': { status: 'completed', totalScore: 91, examStatus: '通过', remediationStatus: '无需' },
  'C++程序设计实训': { status: 'completed', totalScore: 86, examStatus: '通过', remediationStatus: '无需' },
  Python程序设计实训: { status: 'completed', totalScore: 94, examStatus: '通过', remediationStatus: '无需' },
  算法设计实训: { status: 'completed', totalScore: 87, examStatus: '通过', remediationStatus: '无需' },
  专业认识实习: { status: 'completed', totalScore: 85, examStatus: '通过', remediationStatus: '无需' },
  创新创业基础: { status: 'inProgress' },
  科研方法论: { status: 'completed', totalScore: 83, examStatus: '通过', remediationStatus: '无需' },
  学术讲座与学术活动: { status: 'inProgress' },
}

const studentStatus: Record<string, Record<string, Partial<StudentCourse>>> = {
  student1,
  student2: Object.fromEntries(Object.entries(student1).map(([name, value]) => [
    name,
    value.status === 'completed' ? { ...value, totalScore: Math.max((value.totalScore ?? 80) - 6, 60) } : value,
  ])),
  student3: Object.fromEntries(Object.entries(student1).map(([name, value]) => [
    name,
    value.status === 'completed' ? { ...value, totalScore: Math.min((value.totalScore ?? 86) + 4, 98) } : { ...value },
  ])),
}

studentStatus.student2.操作系统原理 = { status: 'completed', totalScore: 55, examStatus: '不及格', remediationStatus: '重修中' }
studentStatus.student2.数据库系统原理 = { status: 'completed', totalScore: 72, examStatus: '通过', remediationStatus: '无需' }
studentStatus.student3.模式识别 = { status: 'completed', totalScore: 86, examStatus: '通过', remediationStatus: '无需' }
studentStatus.student3.深度学习 = { status: 'completed', totalScore: 92, examStatus: '通过', remediationStatus: '无需' }
studentStatus.student3.神经网络与深度学习 = { status: 'completed', totalScore: 90, examStatus: '通过', remediationStatus: '无需' }
studentStatus.student3.文本挖掘 = { status: 'inProgress' }

// 演示成绩映射到前三位同学（真实学号：朱云舒 / 李子阳 / 廉宇航），其余同学待真实成绩导入
const demoStudentIds = ['202511173001', '202511173008', '202511173015']

export const initialStudentCourses: StudentCourse[] = demoStudentIds.flatMap((studentId, i) =>
  initialCourses.map(course => {
    const item = studentStatus[`student${i + 1}`]?.[course.name]
    const totalScore = item?.totalScore
    return {
      studentId,
      courseId: course.id,
      status: item?.status ?? 'notStarted',
      regularScore: totalScore !== undefined ? Math.min(totalScore + 2, 100) : undefined,
      finalScore: totalScore !== undefined ? Math.max(totalScore - 2, 0) : undefined,
      totalScore,
      examStatus: item?.examStatus,
      remediationStatus: item?.remediationStatus,
    }
  })
)
