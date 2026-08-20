import type {
  User,
  StudentProfile,
  StudentBasicProfile,
  AssessmentTask,
  Feedback,
  Course,
  StudentCourse,
  CourseTreeNode,
  AssessmentIndicator,
} from './types'
export {
  aiMajorCurriculum,
  curriculumModulePlans,
  initialCourses,
  initialStudentCourses,
} from './curriculum-data'

// 学生名单（学号 = 登录账号，初始密码为学号后六位）
const students = [
  { id: '202511173001', name: '朱云舒' },
  { id: '202511173008', name: '李子阳' },
  { id: '202511173015', name: '廉宇航' },
  { id: '202511173021', name: '黄海芳' },
  { id: '202511173003', name: '何与航' },
  { id: '202511173010', name: '刘晨曦' },
  { id: '202511173017', name: '魏子翔' },
  { id: '202511173025', name: '陈宣融' },
  { id: '202511173016', name: '陶沐杰' },
  { id: '202511173011', name: '杨嘉盛' },
  { id: '202511173005', name: '史莫然' },
  { id: '202511173014', name: '康雨乐' },
  { id: '202511173019', name: '米振宇' },
  { id: '202511173004', name: '杨梓鑫' },
  { id: '202511173020', name: '邓诗越' },
  { id: '202511173024', name: '曹林婷' },
  { id: '202511173013', name: '张天翔' },
  { id: '202511173006', name: '马庆坤' },
  { id: '202511173009', name: '王安桥' },
  { id: '202511173007', name: '张凯' },
  { id: '202511173022', name: '谢佳良' },
  { id: '202511173018', name: '李梓鸣' },
  { id: '202511173002', name: '陶知子' },
  { id: '202511173023', name: '朱思谦' },
]

// 教师名单（工号 = 登录账号；以下工号为占位，待替换真实工号）
const teachers = [
  { id: '100001', name: '陈老师' },
  { id: '100002', name: '王老师' },
  { id: '100003', name: '李老师' },
]

// 预设用户
export const initialUsers: User[] = [
  ...students.map(s => ({
    id: s.id,
    username: s.id,
    role: 'student' as const,
    name: s.name,
    major: '人工智能',
    className: 'AI实验班',
    enrollmentGrade: '2025级',
  })),
  ...teachers.map(t => ({
    id: t.id,
    username: t.id,
    role: 'teacher' as const,
    name: t.name,
  })),
]

// 学生画像数据（新同学暂为空画像，可后续自行完善）
export const initialProfiles: StudentProfile[] = students.map(s => ({
  userId: s.id,
  nickname: '',
  bio: '',
  interests: [],
  skills: [],
  projects: [],
}))

// 学生个人基本资料（学生端使用）
export const defaultExperiences = `曾获全国大学生数学竞赛省级一等奖；
曾作为技术成员参与中国国际大学生创新大赛项目，承担技术架构调研、AI交互方案梳理工作；独立开发学业信息可视化页面、多模态AI交互Demo，探索大模型在文化传播场景的落地应用。
作为班级团委，协调展开班级日常团委活动。
曾担任线下大型演唱会志愿者，负责现场通行管控、人员秩序维护。
已经加入志愿者联合会，参与各类志愿活动组织协调工作。
已经加入CUC桌游社团，一起来玩桌游吧。`

export const initialBasicProfiles: StudentBasicProfile[] = students.map(s => ({
  userId: s.id,
  name: s.name,
  gender: '保密',
  grade: '',
  hometown: '',
  email: '',
  experiences: defaultExperiences,
  strengths: '',
}))

export const assessmentIndicators: AssessmentIndicator[] = [
  {
    id: 'research',
    name: '科研成果',
    description: '论文、专利、软著、课题参与证明等科研成果材料。',
    deadline: '2026-06-30',
  },
  {
    id: 'competition',
    name: '竞赛获奖',
    description: '学科竞赛、创新创业竞赛、算法竞赛等获奖或参赛证明。',
    deadline: '2026-06-30',
  },
  {
    id: 'practice',
    name: '实践报告',
    description: '课程实践、企业实习、社会实践或项目实训报告。',
    deadline: '2026-06-30',
  },
  {
    id: 'lecture',
    name: '学术讲座',
    description: '学术讲座、行业报告、导师沙龙等参与记录或心得。',
    deadline: '2026-06-30',
  },
]

// 考核任务数据
export const initialTasks: AssessmentTask[] = initialUsers
  .filter(user => user.role === 'student')
  .flatMap(student =>
    assessmentIndicators.map((indicator, index) => ({
      id: `${student.id}-${indicator.id}`,
      studentId: student.id,
      indicatorId: indicator.id,
      name: indicator.name,
      course: '学业考核',
      deadline: indicator.deadline,
      status:
        student.id === 'student1' && indicator.id === 'research'
          ? 'passed'
          : student.id === 'student1' && indicator.id === 'practice'
          ? 'reviewing'
          : student.id === 'student2' && indicator.id === 'competition'
          ? 'reviewing'
          : student.id === 'student3' && index < 2
          ? 'passed'
          : 'pending',
      submission:
        student.id === 'student1' && indicator.id === 'research'
          ? '科研成果证明.pdf'
          : student.id === 'student1' && indicator.id === 'practice'
          ? '实践报告.docx'
          : student.id === 'student2' && indicator.id === 'competition'
          ? '竞赛获奖证书.jpg'
          : student.id === 'student3' && indicator.id === 'research'
          ? '论文录用证明.pdf'
          : student.id === 'student3' && indicator.id === 'competition'
          ? '算法竞赛证书.pdf'
          : undefined,
      submittedAt:
        student.id === 'student1' && indicator.id === 'research'
          ? '2026-05-01'
          : student.id === 'student1' && indicator.id === 'practice'
          ? '2026-05-08'
          : student.id === 'student2' && indicator.id === 'competition'
          ? '2026-05-10'
          : student.id === 'student3' && index < 2
          ? '2026-05-03'
          : undefined,
      attachmentName:
        student.id === 'student1' && indicator.id === 'research'
          ? '科研成果证明.pdf'
          : student.id === 'student1' && indicator.id === 'practice'
          ? '实践报告.docx'
          : student.id === 'student2' && indicator.id === 'competition'
          ? '竞赛获奖证书.jpg'
          : student.id === 'student3' && indicator.id === 'research'
          ? '论文录用证明.pdf'
          : student.id === 'student3' && indicator.id === 'competition'
          ? '算法竞赛证书.pdf'
          : undefined,
    } satisfies AssessmentTask))
  )

// 问题反馈数据
export const initialFeedbacks: Feedback[] = [
  {
    id: 'f1',
    studentId: 'student1',
    studentName: '张明',
    assigneeTeacherId: 'teacher',
    assigneeTeacherName: '陈老师',
    category: 'academic',
    subject: '机器学习基础',
    type: 'question',
    title: '实验报告格式',
    content: '请问机器学习实验报告的格式要求是什么？',
    createdAt: '2025-04-05',
    status: 'resolved',
    lastReplyAt: '2025-04-06',
    lastReplyBy: 'teacher',
    unreadForStudent: false,
    unreadForTeacher: false,
  },
  {
    id: 'f2',
    studentId: 'student2',
    studentName: '李华',
    assigneeTeacherId: 'teacher2',
    assigneeTeacherName: '王老师',
    category: 'classAffairs',
    type: 'suggestion',
    title: '增加实践项目机会',
    content: '建议增加更多的实践项目机会，希望能够参与真实企业项目。',
    createdAt: '2025-04-08',
    status: 'pending',
    unreadForStudent: false,
    unreadForTeacher: true,
  },
]

// 生成课程树结构
export function generateCourseTree(studentId: string, courses: Course[], studentCourses: StudentCourse[]): CourseTreeNode[] {
  const studentCourseMap = new Map<string, StudentCourse>()
  studentCourses
    .filter(sc => sc.studentId === studentId)
    .forEach(sc => studentCourseMap.set(sc.courseId, sc))

  const years = [1, 2, 3, 4] as const
  const categoryMap: Record<number, string[]> = {
    1: ['通识课', '专业基础课'],
    2: ['AI核心课', '实践课'],
    3: ['进阶课', '毕业设计/项目'],
    4: ['实践教学模块', '创新创业与素质拓展模块'],
  }

  return years.map(year => {
    const categories = categoryMap[year]
    const categoryNodes: CourseTreeNode[] = categories.map(category => {
      const categoryCourses = courses.filter(c => c.year === year && c.category === category)
      const courseNodes: CourseTreeNode[] = categoryCourses.map(course => {
        const sc = studentCourseMap.get(course.id)
        return {
          id: course.id,
          name: course.name,
          type: 'course' as const,
          course,
          status: sc?.status || 'notStarted',
        }
      })

      const completedCount = courseNodes.filter(n => n.status === 'completed').length
      const progress = courseNodes.length > 0 ? (completedCount / courseNodes.length) * 100 : 0

      return {
        id: `${year}-${category}`,
        name: category,
        type: 'category' as const,
        children: courseNodes,
        progress,
        status: progress === 100 ? 'completed' : progress > 0 ? 'inProgress' : 'notStarted',
      }
    })

    const yearCompletedCount = categoryNodes.filter(n => n.status === 'completed').length
    const yearProgress = categoryNodes.length > 0 ? (yearCompletedCount / categoryNodes.length) * 100 : 0

    return {
      id: `year-${year}`,
      name: `学年 ${year}`,
      type: 'year' as const,
      children: categoryNodes,
      progress: yearProgress,
      status: yearProgress === 100 ? 'completed' : yearProgress > 0 ? 'inProgress' : 'notStarted',
    }
  })
}

