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

// 预设用户
export const initialUsers: User[] = [
  {
    id: 'student1',
    username: 'student1',
    password: '123456',
    role: 'student',
    name: '张明',
    avatar: '/avatars/student1.jpg',
    major: '人工智能',
    className: 'AI实验1班',
    enrollmentGrade: '2024级',
  },
  {
    id: 'student2',
    username: 'student2',
    password: '123456',
    role: 'student',
    name: '李华',
    avatar: '/avatars/student2.jpg',
    major: '人工智能',
    className: 'AI实验1班',
    enrollmentGrade: '2024级',
  },
  {
    id: 'student3',
    username: 'student3',
    password: '123456',
    role: 'student',
    name: '王芳',
    avatar: '/avatars/student3.jpg',
    major: '人工智能',
    className: 'AI实验2班',
    enrollmentGrade: '2024级',
  },
  {
    id: 'teacher',
    username: 'teacher',
    password: '123456',
    role: 'teacher',
    name: '陈老师',
    avatar: '/avatars/teacher.jpg',
  },
  {
    id: 'teacher2',
    username: 'teacher2',
    password: '123456',
    role: 'teacher',
    name: '王老师',
    avatar: '/avatars/teacher2.jpg',
  },
  {
    id: 'teacher3',
    username: 'teacher3',
    password: '123456',
    role: 'teacher',
    name: '李老师',
    avatar: '/avatars/teacher3.jpg',
  },
]

// 学生画像数据
export const initialProfiles: StudentProfile[] = [
  {
    userId: 'student1',
    nickname: '小明',
    bio: '热爱人工智能和机器学习，希望在计算机视觉领域有所突破。目前正在学习深度学习框架，参与多个AI项目实践。',
    interests: ['机器学习', '计算机视觉', '自然语言处理', '游戏开发'],
    skills: ['Python', 'PyTorch', 'TensorFlow', 'OpenCV', 'NumPy'],
    projects: [
      {
        id: 'p1',
        name: '智能图像分类系统',
        description: '基于CNN的图像分类系统，可识别100+类别物体',
        role: '核心开发者',
        period: '2024.09 - 2024.12',
      },
      {
        id: 'p2',
        name: '聊天机器人',
        description: '基于Transformer的对话生成模型',
        role: '项目负责人',
        period: '2025.01 - 2025.03',
      },
    ],
  },
  {
    userId: 'student2',
    nickname: '华仔',
    bio: '对强化学习和智能控制系统充满热情，曾参与机器人竞赛获得省级二等奖。喜欢挑战有难度的技术问题。',
    interests: ['强化学习', '机器人控制', '自动驾驶', '算法竞赛'],
    skills: ['C++', 'Python', 'ROS', 'Gym', 'Stable-Baselines'],
    projects: [
      {
        id: 'p3',
        name: '智能避障机器人',
        description: '使用强化学习训练的自主导航机器人',
        role: '算法工程师',
        period: '2024.06 - 2024.09',
      },
      {
        id: 'p4',
        name: '自动驾驶仿真平台',
        description: '基于CARLA的自动驾驶算法验证平台',
        role: '仿真开发',
        period: '2025.02 - 至今',
      },
    ],
  },
  {
    userId: 'student3',
    nickname: '芳芳',
    bio: '专注于数据科学和机器学习应用，擅长数据分析和可视化。希望将AI技术应用到实际业务场景中。',
    interests: ['数据科学', '推荐系统', '知识图谱', '数据可视化'],
    skills: ['Python', 'SQL', 'Pandas', 'Scikit-learn', 'Tableau'],
    projects: [
      {
        id: 'p5',
        name: '电商推荐系统',
        description: '基于协同过滤的商品推荐引擎',
        role: '数据分析师',
        period: '2024.10 - 2025.01',
      },
      {
        id: 'p6',
        name: '学生画像分析平台',
        description: '基于学习行为数据的学生特征分析系统',
        role: '项目负责人',
        period: '2025.03 - 至今',
      },
    ],
  },
]

// 学生个人基本资料（学生端使用）
export const defaultExperiences = `曾获全国大学生数学竞赛省级一等奖；
曾作为技术成员参与中国国际大学生创新大赛项目，承担技术架构调研、AI交互方案梳理工作；独立开发学业信息可视化页面、多模态AI交互Demo，探索大模型在文化传播场景的落地应用。
作为班级团委，协调展开班级日常团委活动。
曾担任线下大型演唱会志愿者，负责现场通行管控、人员秩序维护。
已经加入志愿者联合会，参与各类志愿活动组织协调工作。
已经加入CUC桌游社团，一起来玩桌游吧。`

export const initialBasicProfiles: StudentBasicProfile[] = [
  {
    userId: 'student1',
    name: '张明',
    gender: '男',
    grade: '大二',
    hometown: '江苏·南京',
    email: 'zhangming@example.com',
    experiences: defaultExperiences,
    strengths: '计算机视觉、Python、动手能力强',
  },
  {
    userId: 'student2',
    name: '李华',
    gender: '男',
    grade: '大二',
    hometown: '广东·深圳',
    email: 'lihua@example.com',
    experiences: defaultExperiences,
    strengths: '强化学习、C++、机器人方向',
  },
  {
    userId: 'student3',
    name: '王芳',
    gender: '女',
    grade: '大二',
    hometown: '四川·成都',
    email: 'wangfang@example.com',
    experiences: defaultExperiences,
    strengths: '数据分析、SQL、可视化表达',
  },
]

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

