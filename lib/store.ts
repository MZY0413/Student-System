'use client'

import type {
  User,
  StudentProfile,
  StudentBasicProfile,
  AssessmentTask,
  Course,
  StudentCourse,
  Feedback,
  FeedbackMessage,
  FeedbackAttachment,
  FeedbackStatusHistory,
  InteractionAnswer,
  InteractionAttachment,
  SharePost,
  ClassTopic,
  InteractionComment,
  StudyTeam,
  TeamMessage,
  StudentFavorite,
  InteractionReport,
  InteractionMuteSetting,
  ContentVisibility,
  StudentContribution,
  Notification,
  HelpAttachment,
  HelpPost,
  HelpComment,
  HelpCollect,
  YearlyGPA,
  AcademicAdvice,
  ClassStats,
  TodoItem,
  TaskStatus,
  FeedbackStatus,
  UserRole,
  AssessmentIndicator,
  AssessmentIndicatorStats,
  AcademicRankings,
  CourseGradeRecord,
  CreditAnalysis,
  ExamStatus,
  GPAScale,
  GPASummary,
  RankingLeaderboard,
  RankingLeaderboardEntry,
  SemesterGPA,
  RankingScope,
  RemediationStatus,
  CourseStudyStatus,
  CurriculumCourseRecord,
  CurriculumCourseStatus,
  CurriculumProgressOverview,
  CurriculumWarning,
} from './types'
import {
  initialUsers,
  initialProfiles,
  initialBasicProfiles,
  defaultExperiences,
  initialTasks,
  initialCourses,
  initialStudentCourses,
  initialFeedbacks,
  assessmentIndicators,
  curriculumModulePlans,
} from './data'

const STORAGE_KEYS = {
  USERS: 'ai_class_users',
  PROFILES: 'ai_class_profiles',
  BASIC_PROFILES: 'ai_class_basic_profiles',
  TASKS: 'ai_class_tasks',
  COURSES: 'ai_class_courses',
  STUDENT_COURSES: 'ai_class_student_courses',
  FEEDBACKS: 'ai_class_feedbacks',
  FEEDBACK_MESSAGES: 'ai_class_feedback_messages',
  FEEDBACK_ATTACHMENTS: 'ai_class_feedback_attachments',
  FEEDBACK_STATUS_HISTORY: 'ai_class_feedback_status_history',
  INTERACTION_ANSWERS: 'ai_class_interaction_answers',
  INTERACTION_ATTACHMENTS: 'ai_class_interaction_attachments',
  SHARE_POSTS: 'ai_class_share_posts',
  CLASS_TOPICS: 'ai_class_class_topics',
  INTERACTION_COMMENTS: 'ai_class_interaction_comments',
  STUDY_TEAMS: 'ai_class_study_teams',
  TEAM_MESSAGES: 'ai_class_team_messages',
  STUDENT_FAVORITES: 'ai_class_student_favorites',
  INTERACTION_REPORTS: 'ai_class_interaction_reports',
  INTERACTION_MUTE_SETTINGS: 'ai_class_interaction_mute_settings',
  HELP_POSTS: 'ai_class_help_posts',
  HELP_COMMENTS: 'ai_class_help_comments',
  HELP_COLLECTS: 'ai_class_help_collects',
  NOTIFICATIONS: 'ai_class_notifications',
  CURRENT_USER: 'ai_class_current_user',
}

// 初始化数据
function initializeData<T>(key: string, initialData: T): T {
  if (typeof window === 'undefined') return initialData
  
  const stored = localStorage.getItem(key)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return initialData
    }
  }
  localStorage.setItem(key, JSON.stringify(initialData))
  return initialData
}

// 获取数据
function getData<T>(key: string, initialData: T): T {
  if (typeof window === 'undefined') return initialData
  
  const stored = localStorage.getItem(key)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return initialData
    }
  }
  return initialData
}

// 保存数据
function saveData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(key, JSON.stringify(data))
}

function dateTimeString(date = new Date()) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// 用户相关
export function getUsers(): User[] {
  return getData(STORAGE_KEYS.USERS, initialUsers)
}

export function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return null
    }
  }
  return null
}

export function setCurrentUser(user: User | null): void {
  if (typeof window === 'undefined') return
  if (user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
  } else {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
  }
}

export function login(username: string, password: string): User | null {
  initializeData(STORAGE_KEYS.USERS, initialUsers)
  initializeData(STORAGE_KEYS.PROFILES, initialProfiles)
  initializeData(STORAGE_KEYS.BASIC_PROFILES, initialBasicProfiles)
  initializeData(STORAGE_KEYS.TASKS, initialTasks)
  initializeData(STORAGE_KEYS.COURSES, initialCourses)
  initializeData(STORAGE_KEYS.STUDENT_COURSES, initialStudentCourses)
  initializeData(STORAGE_KEYS.FEEDBACKS, initialFeedbacks)

  const users = getUsers()
  const user = users.find(u => u.username === username && u.password === password)
  if (user) {
    setCurrentUser(user)
    return user
  }
  return null
}

export function logout(): void {
  setCurrentUser(null)
}

// 学生画像
export function getProfiles(): StudentProfile[] {
  return getData(STORAGE_KEYS.PROFILES, initialProfiles)
}

export function getProfileByUserId(userId: string): StudentProfile | undefined {
  const profiles = getProfiles()
  return profiles.find(p => p.userId === userId)
}

// 学生个人基本资料（学生端）
export function getBasicProfiles(): StudentBasicProfile[] {
  const profiles = getData(STORAGE_KEYS.BASIC_PROFILES, initialBasicProfiles)
  // 迁移：旧数据为空时补充默认代表性经历
  return profiles.map(profile => ({
    ...profile,
    experiences: profile.experiences?.trim() ? profile.experiences : defaultExperiences,
  }))
}

export function getBasicProfileByUserId(userId: string): StudentBasicProfile | undefined {
  const profiles = getBasicProfiles()
  return profiles.find(p => p.userId === userId)
}

export function upsertBasicProfile(next: StudentBasicProfile): void {
  const profiles = getBasicProfiles()
  const idx = profiles.findIndex(p => p.userId === next.userId)
  if (idx >= 0) profiles[idx] = next
  else profiles.push(next)
  saveData(STORAGE_KEYS.BASIC_PROFILES, profiles)
}

// 考核任务
function normalizeAssessmentTasks(tasks: AssessmentTask[]): AssessmentTask[] {
  const students = getUsers().filter(user => user.role === 'student')
  const taskMap = new Map<string, AssessmentTask>()

  tasks.forEach(task => {
    const matchedIndicator = assessmentIndicators.find(
      indicator => indicator.id === task.indicatorId || indicator.name === task.name
    )
    if (!matchedIndicator) return

    const normalized: AssessmentTask = {
      ...task,
      id: `${task.studentId}-${matchedIndicator.id}`,
      indicatorId: matchedIndicator.id,
      name: matchedIndicator.name,
      course: '学业考核',
      deadline: matchedIndicator.deadline,
      submission: task.submission ?? task.attachmentName,
      attachmentName: task.attachmentName ?? task.submission,
    }
    taskMap.set(`${normalized.studentId}-${matchedIndicator.id}`, normalized)
  })

  students.forEach(student => {
    assessmentIndicators.forEach(indicator => {
      const key = `${student.id}-${indicator.id}`
      if (!taskMap.has(key)) {
        taskMap.set(key, {
          id: key,
          studentId: student.id,
          indicatorId: indicator.id,
          name: indicator.name,
          course: '学业考核',
          deadline: indicator.deadline,
          status: 'pending',
        })
      }
    })
  })

  return Array.from(taskMap.values()).sort((a, b) => {
    const studentOrder = students.findIndex(student => student.id === a.studentId) - students.findIndex(student => student.id === b.studentId)
    if (studentOrder !== 0) return studentOrder
    return assessmentIndicators.findIndex(indicator => indicator.id === a.indicatorId) - assessmentIndicators.findIndex(indicator => indicator.id === b.indicatorId)
  })
}

export function getTasks(): AssessmentTask[] {
  const tasks = normalizeAssessmentTasks(getData(STORAGE_KEYS.TASKS, initialTasks))
  saveData(STORAGE_KEYS.TASKS, tasks)
  return tasks
}

export function getTasksByStudentId(studentId: string): AssessmentTask[] {
  const tasks = getTasks()
  return tasks.filter(t => t.studentId === studentId)
}

export function getAssessmentIndicators(): AssessmentIndicator[] {
  return assessmentIndicators
}

export function getAssessmentIndicatorStats(): AssessmentIndicatorStats[] {
  const students = getUsers().filter(user => user.role === 'student')
  const tasks = getTasks()
  return assessmentIndicators.map(indicator => ({
    indicatorId: indicator.id,
    name: indicator.name,
    passedCount: tasks.filter(task => task.indicatorId === indicator.id && task.status === 'passed').length,
    totalStudents: students.length,
  }))
}

export function updateTaskStatus(taskId: string, status: TaskStatus, score?: number): void {
  const tasks = getTasks()
  const taskIndex = tasks.findIndex(t => t.id === taskId)
  if (taskIndex !== -1) {
    tasks[taskIndex].status = status
    if (score !== undefined) {
      tasks[taskIndex].score = score
    }
    saveData(STORAGE_KEYS.TASKS, tasks)
  }
}

export function reviewAssessmentTask(taskId: string, status: 'passed' | 'failed', teacher: User): void {
  const tasks = getTasks()
  const taskIndex = tasks.findIndex(t => t.id === taskId)
  if (taskIndex !== -1) {
    tasks[taskIndex].status = status
    tasks[taskIndex].reviewedAt = todayString()
    tasks[taskIndex].reviewedBy = teacher.id
    tasks[taskIndex].reviewedByName = teacher.name
    saveData(STORAGE_KEYS.TASKS, tasks)
  }
}

export function submitTask(taskId: string, submission: string): void {
  const tasks = getTasks()
  const taskIndex = tasks.findIndex(t => t.id === taskId)
  if (taskIndex !== -1) {
    tasks[taskIndex].status = 'reviewing'
    tasks[taskIndex].submission = submission
    tasks[taskIndex].submittedAt = new Date().toISOString().split('T')[0]
    saveData(STORAGE_KEYS.TASKS, tasks)
  }
}

export function submitAssessmentAttachment(taskId: string, file: {
  name: string
  type: string
  size: number
  dataUrl: string
}): void {
  const tasks = getTasks()
  const taskIndex = tasks.findIndex(t => t.id === taskId)
  if (taskIndex !== -1) {
    tasks[taskIndex].status = 'reviewing'
    tasks[taskIndex].submission = file.name
    tasks[taskIndex].submittedAt = todayString()
    tasks[taskIndex].attachmentName = file.name
    tasks[taskIndex].attachmentType = file.type
    tasks[taskIndex].attachmentSize = file.size
    tasks[taskIndex].attachmentDataUrl = file.dataUrl
    tasks[taskIndex].reviewedAt = undefined
    tasks[taskIndex].reviewedBy = undefined
    tasks[taskIndex].reviewedByName = undefined
    saveData(STORAGE_KEYS.TASKS, tasks)
  }
}

// 课程
function normalizeCourses(courses: Course[]): Course[] {
  const initialById = new Map(initialCourses.map(course => [course.id, course]))
  const normalized = courses.map(course => {
    const fallback = initialById.get(course.id)
    return {
      ...course,
      academicYear: course.academicYear ?? fallback?.academicYear ?? '2025-2026学年',
      semester: course.semester ?? fallback?.semester ?? '第二学期',
      courseAttribute: course.courseAttribute ?? fallback?.courseAttribute ?? '专业课',
      creditRequirement: course.creditRequirement ?? fallback?.creditRequirement ?? '必修',
      moduleId: course.moduleId ?? fallback?.moduleId ?? 0,
      module: course.module ?? fallback?.module ?? '专业教育模块',
      category: course.category ?? fallback?.category ?? '专业课',
      suggestedSemester: course.suggestedSemester ?? fallback?.suggestedSemester ?? '按培养方案修读',
      isCore: course.isCore ?? fallback?.isCore ?? false,
    }
  })

  const existingIds = new Set(normalized.map(course => course.id))
  initialCourses.forEach(course => {
    if (!existingIds.has(course.id)) normalized.push(course)
  })
  return normalized
}

type LegacyStudentCourse = StudentCourse & { score?: number }

function normalizeStudentCourses(items: LegacyStudentCourse[]): StudentCourse[] {
  const initialByKey = new Map(initialStudentCourses.map(item => [`${item.studentId}-${item.courseId}`, item]))
  const normalized: StudentCourse[] = items.map(item => {
    const fallback = initialByKey.get(`${item.studentId}-${item.courseId}`)
    const totalScore = item.totalScore ?? item.score ?? fallback?.totalScore
    const examStatus = item.examStatus ?? fallback?.examStatus ?? (totalScore === undefined ? undefined : totalScore >= 60 ? '通过' : '不及格')

    const normalizedItem: StudentCourse = {
      ...item,
      regularScore: item.regularScore ?? fallback?.regularScore,
      finalScore: item.finalScore ?? fallback?.finalScore,
      totalScore,
      examStatus,
      remediationStatus:
        item.remediationStatus ??
        fallback?.remediationStatus ??
        (examStatus === '通过' ? '无需' : examStatus === '缓考' ? '缓考安排中' : examStatus ? '待补考' : undefined),
    }
    return normalizedItem
  })

  const existingKeys = new Set(normalized.map(item => `${item.studentId}-${item.courseId}`))
  initialStudentCourses.forEach(item => {
    const key = `${item.studentId}-${item.courseId}`
    if (!existingKeys.has(key)) normalized.push(item)
  })
  return normalized
}

export function getCourses(): Course[] {
  const courses = normalizeCourses(getData(STORAGE_KEYS.COURSES, initialCourses))
  saveData(STORAGE_KEYS.COURSES, courses)
  return courses
}

export function getStudentCourses(): StudentCourse[] {
  const studentCourses = normalizeStudentCourses(getData(STORAGE_KEYS.STUDENT_COURSES, initialStudentCourses))
  saveData(STORAGE_KEYS.STUDENT_COURSES, studentCourses)
  return studentCourses
}

export function getStudentCoursesByStudentId(studentId: string): StudentCourse[] {
  const studentCourses = getStudentCourses()
  return studentCourses.filter(sc => sc.studentId === studentId)
}

// 绩点计算
const CURRENT_ACADEMIC_YEAR = '2025-2026学年'
const CURRENT_SEMESTER = '第二学期'
const GRADUATION_REQUIRED_CREDITS = 185
const REQUIRED_TARGET_CREDITS = 145
const ELECTIVE_TARGET_CREDITS = 40

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

export function scoreToGPA(score: number | undefined, scale: GPAScale = 'four'): number {
  if (score === undefined) return 0
  if (scale === 'hundred') return round2(score)
  if (scale === 'five') {
    if (score >= 90) return 5
    if (score >= 85) return 4.5
    if (score >= 80) return 4
    if (score >= 75) return 3.5
    if (score >= 70) return 3
    if (score >= 65) return 2.5
    if (score >= 60) return 2
    return 0
  }

  if (score >= 90) return 4
  if (score >= 85) return 3.7
  if (score >= 82) return 3.3
  if (score >= 78) return 3
  if (score >= 75) return 2.7
  if (score >= 72) return 2.3
  if (score >= 68) return 2
  if (score >= 64) return 1.5
  if (score >= 60) return 1
  return 0
}

function getCourseGradeValue(record: StudentCourse): number | undefined {
  return record.totalScore
}

function isPassedGrade(record: StudentCourse): boolean {
  const totalScore = getCourseGradeValue(record)
  return record.status === 'completed' && record.examStatus === '通过' && totalScore !== undefined && totalScore >= 60
}

function weightedGPA(records: CourseGradeRecord[], scale: GPAScale = 'four'): number {
  const eligible = records.filter(record => record.status === 'completed' && record.totalScore !== undefined && record.examStatus !== '缓考')
  const totalCredits = eligible.reduce((sum, record) => sum + record.credit, 0)
  if (totalCredits === 0) return 0

  const weighted = eligible.reduce((sum, record) => (
    sum + scoreToGPA(record.totalScore, scale) * record.credit
  ), 0)
  return round2(weighted / totalCredits)
}

export function getCourseGradeRecords(studentId: string): CourseGradeRecord[] {
  const courses = getCourses()
  const studentCourses = getStudentCoursesByStudentId(studentId)

  const records: CourseGradeRecord[] = []

  studentCourses.forEach(studentCourse => {
    const course = courses.find(item => item.id === studentCourse.courseId)
    if (!course) return

    const totalScore = getCourseGradeValue(studentCourse)
    const examStatus: ExamStatus =
      studentCourse.examStatus ??
      (totalScore === undefined ? '缓考' : totalScore >= 60 ? '通过' : '不及格')
    const remediationStatus: RemediationStatus =
      studentCourse.remediationStatus ??
      (examStatus === '通过' ? '无需' : examStatus === '缓考' ? '缓考安排中' : '待补考')

    records.push({
      studentId,
      courseId: course.id,
      courseName: course.name,
      courseAttribute: course.courseAttribute,
      creditRequirement: course.creditRequirement,
      credit: course.credit,
      year: course.year,
      module: course.module,
      academicYear: course.academicYear,
      semester: course.semester,
      suggestedSemester: course.suggestedSemester,
      isCore: course.isCore,
      regularScore: studentCourse.regularScore,
      finalScore: studentCourse.finalScore,
      totalScore,
      examStatus,
      remediationStatus,
      status: studentCourse.status,
    })
  })

  return records.sort((a, b) => (
      a.academicYear.localeCompare(b.academicYear) ||
      a.semester.localeCompare(b.semester) ||
      a.courseId.localeCompare(b.courseId)
  ))
}

export function calculateGPA(studentId: string, scale: GPAScale = 'four'): GPASummary {
  const records = getCourseGradeRecords(studentId)
  const yearlyData: Record<number, { records: CourseGradeRecord[]; academicYear?: string }> = {
    1: { records: [] },
    2: { records: [] },
    3: { records: [] },
    4: { records: [] },
  }

  records.forEach(record => {
    yearlyData[record.year].records.push(record)
    yearlyData[record.year].academicYear = record.academicYear
  })

  const yearlyGPAs: YearlyGPA[] = [1, 2, 3, 4].map(year => ({
    year,
    academicYear: yearlyData[year].academicYear,
    gpa: weightedGPA(yearlyData[year].records, scale),
    totalCredits: yearlyData[year].records
      .filter(record => {
        const source = getStudentCoursesByStudentId(studentId).find(item => item.courseId === record.courseId)
        return source ? isPassedGrade(source) : record.examStatus === '通过'
      })
      .reduce((sum, record) => sum + record.credit, 0),
  }))

  const totalGPA = weightedGPA(records, scale)
  const currentTermGPA = weightedGPA(
    records.filter(record => record.academicYear === CURRENT_ACADEMIC_YEAR && record.semester === CURRENT_SEMESTER),
    scale
  )
  const academicYearGPA = weightedGPA(
    records.filter(record => record.academicYear === CURRENT_ACADEMIC_YEAR),
    scale
  )
  const passedCredits = records
    .filter(record => record.examStatus === '通过' && record.totalScore !== undefined && record.totalScore >= 60)
    .reduce((sum, record) => sum + record.credit, 0)

  return {
    yearlyGPAs,
    totalGPA,
    comprehensiveGPA: totalGPA,
    currentTermGPA,
    academicYearGPA,
    cumulativeGPA: totalGPA,
    totalCredits: passedCredits,
  }
}

export function getAcademicRankings(studentId: string, scope: RankingScope = 'cumulative', scale: GPAScale = 'four'): AcademicRankings {
  const students = getUsers().filter(user => user.role === 'student')
  const current = students.find(student => student.id === studentId)

  const getScopeGPA = (targetStudentId: string) => {
    const summary = calculateGPA(targetStudentId, scale)
    if (scope === 'term') return summary.currentTermGPA
    if (scope === 'year') return summary.academicYearGPA
    return summary.cumulativeGPA
  }

  const buildRank = (items: User[]) => {
    const ranked = items
      .map(student => ({ studentId: student.id, studentName: student.name, gpa: getScopeGPA(student.id) }))
      .sort((a, b) => b.gpa - a.gpa || a.studentName.localeCompare(b.studentName))
    const index = ranked.findIndex(item => item.studentId === studentId)
    return {
      rank: index >= 0 ? index + 1 : 0,
      total: ranked.length,
      gpa: ranked.find(item => item.studentId === studentId)?.gpa ?? 0,
    }
  }

  const major = buildRank(students.filter(student => student.major === current?.major))
  const classRank = buildRank(students.filter(student => student.className === current?.className))
  const grade = buildRank(students.filter(student => student.enrollmentGrade === current?.enrollmentGrade))

  return {
    majorRank: major.rank,
    majorTotal: major.total,
    classRank: classRank.rank,
    classTotal: classRank.total,
    gradeRank: grade.rank,
    gradeTotal: grade.total,
    scopeGPA: major.gpa,
  }
}

export function getCurrentSemesterKey(): string {
  return `${CURRENT_ACADEMIC_YEAR}-${CURRENT_SEMESTER}`
}

export function getStudentSemesterGPAs(studentId: string): SemesterGPA[] {
  const records = getCourseGradeRecords(studentId).filter(record => record.status === 'completed')
  const groups = new Map<string, CourseGradeRecord[]>()
  records.forEach(record => {
    const key = `${record.academicYear}-${record.semester}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(record)
  })

  return Array.from(groups.entries())
    .map(([key, list]) => {
      const eligible = list.filter(record => record.totalScore !== undefined && record.examStatus !== '缓考')
      const totalCredits = eligible.reduce((sum, record) => sum + record.credit, 0)
      const gpa = totalCredits === 0
        ? 0
        : round2(eligible.reduce((sum, record) => sum + scoreToGPA(record.totalScore, 'four') * record.credit, 0) / totalCredits)
      return {
        key,
        academicYear: list[0].academicYear,
        semester: list[0].semester,
        gpa,
        credits: totalCredits,
        courseCount: eligible.length,
      }
    })
    .sort((a, b) => a.key.localeCompare(b.key))
}

export function getAllSemesters(): { key: string; academicYear: string; semester: string }[] {
  const students = getUsers().filter(user => user.role === 'student')
  const map = new Map<string, { key: string; academicYear: string; semester: string }>()
  students.forEach(student => {
    getStudentSemesterGPAs(student.id).forEach(sgpa => {
      if (!map.has(sgpa.key)) {
        map.set(sgpa.key, { key: sgpa.key, academicYear: sgpa.academicYear, semester: sgpa.semester })
      }
    })
  })
  return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key))
}

export function getSemesterRanking(semesterKey: string): RankingLeaderboardEntry[] {
  const students = getUsers().filter(user => user.role === 'student')
  const date = todayString()
  return students
    .map(student => {
      const sgpa = getStudentSemesterGPAs(student.id).find(item => item.key === semesterKey)
      return {
        studentId: student.id,
        studentName: student.name,
        gpa: sgpa?.gpa ?? 0,
        date,
      }
    })
    .sort((a, b) => b.gpa - a.gpa || a.studentName.localeCompare(b.studentName))
}

export function getRankingLeaderboard(studentId: string, semesterKey?: string): RankingLeaderboard {
  const key = semesterKey ?? getCurrentSemesterKey()
  const entries = getSemesterRanking(key)

  const myIndex = entries.findIndex(entry => entry.studentId === studentId)
  const myRank = myIndex >= 0 ? myIndex + 1 : 0
  const myGPA = myIndex >= 0 ? entries[myIndex].gpa : 0
  const total = entries.length

  const validGPAs = entries.map(entry => entry.gpa).filter(gpa => gpa > 0)
  const highestGPA = validGPAs.length ? Math.max(...validGPAs) : 0
  const lowestGPA = validGPAs.length ? Math.min(...validGPAs) : 0
  const averageGPA = validGPAs.length ? round2(validGPAs.reduce((sum, gpa) => sum + gpa, 0) / validGPAs.length) : 0

  // 超过本专业多少比例的同学
  const percentAbove = total > 1 && myRank > 0
    ? Math.round(((total - myRank) / (total - 1)) * 100)
    : myRank === 1 && total > 0 ? 100 : 0

  return {
    entries,
    myRank,
    myGPA,
    total,
    highestGPA,
    lowestGPA,
    averageGPA,
    percentAbove,
  }
}

export function getCreditAnalysis(studentId: string): CreditAnalysis {
  const records = getCourseGradeRecords(studentId)
  const passedRecords = records.filter(record => record.examStatus === '通过' && record.totalScore !== undefined && record.totalScore >= 60)
  const completedCredits = passedRecords.reduce((sum, record) => sum + record.credit, 0)
  const requiredCredits = passedRecords
    .filter(record => record.creditRequirement === '必修')
    .reduce((sum, record) => sum + record.credit, 0)
  const electiveCredits = passedRecords
    .filter(record => record.creditRequirement === '选修')
    .reduce((sum, record) => sum + record.credit, 0)

  return {
    completedCredits,
    remainingGraduationCredits: Math.max(GRADUATION_REQUIRED_CREDITS - completedCredits, 0),
    graduationRequiredCredits: GRADUATION_REQUIRED_CREDITS,
    requiredCredits,
    requiredTargetCredits: REQUIRED_TARGET_CREDITS,
    requiredMet: requiredCredits >= REQUIRED_TARGET_CREDITS,
    electiveCredits,
    electiveTargetCredits: ELECTIVE_TARGET_CREDITS,
    electiveMet: electiveCredits >= ELECTIVE_TARGET_CREDITS,
  }
}

function toCurriculumStatus(record: StudentCourse): CurriculumCourseStatus {
  if (record.status === 'inProgress') return 'studying'
  if (record.status === 'notStarted') return 'notStarted'
  if (record.examStatus === '通过' && (record.totalScore ?? 0) >= 60) return 'passed'
  return 'retaking'
}

function calcPercent(completed: number, required: number) {
  if (required <= 0) return 100
  return Math.min(Math.round((completed / required) * 100), 100)
}

function getCurrentSemesterByGrade(grade?: string) {
  if (grade?.includes('大四')) return 8
  if (grade?.includes('大三')) return 6
  if (grade?.includes('大二')) return 4
  return 2
}

export function getCurriculumProgressOverview(studentId: string): CurriculumProgressOverview {
  const users = getUsers()
  const student = users.find(user => user.id === studentId)
  const basicProfile = getBasicProfileByUserId(studentId)
  const currentSemester = getCurrentSemesterByGrade(basicProfile?.grade)
  const courses = getCourses()
  const studentCourseMap = new Map(getStudentCoursesByStudentId(studentId).map(item => [item.courseId, item]))

  const modules = curriculumModulePlans.map(plan => {
    const moduleCourses = courses.filter(course => course.moduleId === plan.moduleId)
    const courseRecords: CurriculumCourseRecord[] = moduleCourses.map(course => {
      const studentCourse = studentCourseMap.get(course.id) ?? { studentId, courseId: course.id, status: 'notStarted' as CourseStudyStatus }
      const status = toCurriculumStatus(studentCourse)
      return {
        courseId: course.id,
        courseName: course.name,
        moduleId: course.moduleId,
        module: course.module,
        courseAttribute: course.creditRequirement,
        credit: course.credit,
        suggestedSemester: course.suggestedSemester,
        isCore: course.isCore,
        status,
        totalScore: studentCourse.totalScore,
        examStatus: studentCourse.examStatus,
        remediationStatus: studentCourse.remediationStatus,
      }
    })

    const completedByAttribute = (attribute: '必修' | '选修') => courseRecords
      .filter(course => course.courseAttribute === attribute && course.status === 'passed')
      .reduce((sum, course) => sum + course.credit, 0)
    const requiredCompleted = completedByAttribute('必修')
    const electiveCompleted = completedByAttribute('选修')
    const completedCredits = Math.min(requiredCompleted, plan.requiredCredits) + Math.min(electiveCompleted, plan.electiveCredits)
    const requiredCredits = plan.requiredCredits + plan.electiveCredits
    const statusCredits = courseRecords.reduce<Record<CurriculumCourseStatus, number>>((acc, course) => {
      acc[course.status] += course.credit
      return acc
    }, { passed: 0, studying: 0, notStarted: 0, retaking: 0 })

    return {
      moduleId: plan.moduleId,
      name: plan.name,
      requiredCredits,
      completedCredits,
      percent: calcPercent(completedCredits, requiredCredits),
      required: {
        courseAttribute: '必修' as const,
        requiredCredits: plan.requiredCredits,
        completedCredits: requiredCompleted,
        percent: calcPercent(requiredCompleted, plan.requiredCredits),
        isInsufficient: requiredCompleted < plan.requiredCredits,
      },
      elective: {
        courseAttribute: '选修' as const,
        requiredCredits: plan.electiveCredits,
        completedCredits: electiveCompleted,
        percent: calcPercent(electiveCompleted, plan.electiveCredits),
        isInsufficient: electiveCompleted < plan.electiveCredits,
      },
      courses: courseRecords,
      statusCredits,
    }
  })

  const totalRequiredCredits = modules.reduce((sum, module) => sum + module.requiredCredits, 0)
  const totalCompletedCredits = modules.reduce((sum, module) => sum + module.completedCredits, 0)
  const remainingRequiredCredits = modules.reduce((sum, module) => (
    sum + Math.max(module.required.requiredCredits - module.required.completedCredits, 0)
  ), 0)
  const remainingElectiveCredits = modules.reduce((sum, module) => (
    sum + Math.max(module.elective.requiredCredits - module.elective.completedCredits, 0)
  ), 0)
  const expectedPercent = calcPercent(currentSemester, 8)
  const totalPercent = calcPercent(totalCompletedCredits, totalRequiredCredits)
  const warnings: CurriculumWarning[] = []

  modules.forEach(module => {
    module.courses.forEach(course => {
      const firstSemester = Number(course.suggestedSemester.split('-')[0])
      if (course.courseAttribute === '必修' && course.status === 'retaking') {
        warnings.push({
          id: `required-failed-${course.courseId}`,
          type: 'requiredMissing',
          level: 'red',
          message: `${course.courseName} 为必修课且未通过，请尽快重修或补考。`,
        })
      }
      if (course.courseAttribute === '必修' && course.status === 'notStarted' && firstSemester <= currentSemester) {
        warnings.push({
          id: `term-missing-${course.courseId}`,
          type: 'termMissing',
          level: 'yellow',
          message: `${course.courseName} 建议第 ${course.suggestedSemester} 学期修读，当前尚未修读。`,
        })
      }
    })

    if (module.elective.requiredCredits > 0 && module.elective.isInsufficient) {
      warnings.push({
        id: `elective-${module.moduleId}`,
        type: 'creditInsufficient',
        level: 'yellow',
        message: `${module.name} 选修学分不足，还差 ${module.elective.requiredCredits - module.elective.completedCredits} 学分。`,
      })
    }
  })

  const practiceModule = modules.find(module => module.name === '实践教学模块')
  const seniorPracticeIncomplete = practiceModule?.courses.some(course =>
    ['生产实习', '企业项目实训', '毕业实习', '毕业设计(论文)'].includes(course.courseName) && course.status !== 'passed'
  )
  if (currentSemester >= 7 && seniorPracticeIncomplete) {
    warnings.push({
      id: 'senior-practice',
      type: 'practiceIncomplete',
      level: 'red',
      message: '大四实践、实习或毕业设计仍未完成，请优先处理实践教学模块。 ',
    })
  }

  if (totalCompletedCredits < totalRequiredCredits) {
    warnings.push({
      id: 'graduation-credit',
      type: 'creditInsufficient',
      level: 'red',
      message: `毕业总学分不足，还差 ${totalRequiredCredits - totalCompletedCredits} 学分。`,
    })
  }

  if (totalPercent + 5 < expectedPercent) {
    warnings.push({
      id: 'progress-lagging',
      type: 'progressLagging',
      level: 'yellow',
      message: `当前年级应完成约 ${expectedPercent}% 进度，实际为 ${totalPercent}%，存在进度掉队风险。`,
    })
  }

  const hasRedWarning = warnings.some(warning => warning.level === 'red')
  const graduationStatus = totalPercent >= 100 && !hasRedWarning
    ? '已达标'
    : hasRedWarning
      ? '存在风险'
      : '进度正常'

  return {
    major: student?.major ?? '人工智能',
    currentGrade: basicProfile?.grade ?? '大二',
    expectedPercent,
    totalRequiredCredits,
    totalCompletedCredits,
    totalPercent,
    remainingRequiredCredits,
    remainingElectiveCredits,
    graduationStatus,
    modules,
    warnings,
  }
}

// 学业建议生成
export function generateAdvice(studentId: string): AcademicAdvice[] {
  const tasks = getTasksByStudentId(studentId)
  const { totalGPA } = calculateGPA(studentId)
  const advice: AcademicAdvice[] = []

  // 检查未完成任务
  const pendingTasks = tasks.filter(t => t.status === 'pending')
  if (pendingTasks.length > 0) {
    advice.push({
      id: 'a1',
      type: 'warning',
      message: `你有 ${pendingTasks.length} 项任务待完成，请尽快处理，避免影响学业进度。`,
    })
  }

  // 检查待审核任务
  const reviewingTasks = tasks.filter(t => t.status === 'reviewing')
  if (reviewingTasks.length > 0) {
    advice.push({
      id: 'a2',
      type: 'info',
      message: `你有 ${reviewingTasks.length} 项任务正在审核中，请耐心等待结果。`,
    })
  }

  // 检查未通过任务
  const failedTasks = tasks.filter(t => t.status === 'failed')
  if (failedTasks.length > 0) {
    advice.push({
      id: 'a3',
      type: 'warning',
      message: `你有 ${failedTasks.length} 项任务未通过，建议联系老师了解具体情况并补交。`,
    })
  }

  // 绩点建议
  if (totalGPA >= 90) {
    advice.push({
      id: 'a4',
      type: 'success',
      message: `你的加权平均成绩为 ${totalGPA} 分，表现优秀！建议继续保持并考虑参与更多实践项目。`,
    })
  } else if (totalGPA >= 80) {
    advice.push({
      id: 'a5',
      type: 'info',
      message: `你的加权平均成绩为 ${totalGPA} 分，表现良好。可以在薄弱科目上多投入精力。`,
    })
  } else if (totalGPA > 0) {
    advice.push({
      id: 'a6',
      type: 'warning',
      message: `你的加权平均成绩为 ${totalGPA} 分，建议制定学习计划，提升专业课成绩。`,
    })
  }

  // 已完成任务
  const passedTasks = tasks.filter(t => t.status === 'passed')
  if (passedTasks.length > 0) {
    advice.push({
      id: 'a7',
      type: 'success',
      message: `你已完成 ${passedTasks.length} 项考核任务，继续努力！`,
    })
  }

  return advice
}

// 班级学情统计
export function getClassStats(): ClassStats {
  const users = getUsers().filter(u => u.role === 'student')
  const totalStudents = users.length

  let totalGPASum = 0
  let totalCompletedTasks = 0
  let totalTasks = 0
  let totalPassedTasks = 0

  users.forEach(user => {
    const { totalGPA } = calculateGPA(user.id)
    totalGPASum += totalGPA

    const tasks = getTasksByStudentId(user.id)
    totalTasks += tasks.length
    totalCompletedTasks += tasks.filter(t => t.status !== 'pending').length
    totalPassedTasks += tasks.filter(t => t.status === 'passed').length
  })

  return {
    totalStudents,
    averageGPA: totalStudents > 0 ? Math.round((totalGPASum / totalStudents) * 100) / 100 : 0,
    completionRate: totalTasks > 0 ? Math.round((totalCompletedTasks / totalTasks) * 100) : 0,
    passRate: totalCompletedTasks > 0 ? Math.round((totalPassedTasks / totalCompletedTasks) * 100) : 0,
  }
}

// 待办事项
export function getTodoItems(studentId: string): TodoItem[] {
  const tasks = getTasksByStudentId(studentId)
  const pendingTasks = tasks.filter(t => t.status === 'pending')

  return pendingTasks.map(task => {
    const deadline = new Date(task.deadline)
    const today = new Date()
    const daysLeft = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    let priority: 'high' | 'medium' | 'low' = 'low'
    if (daysLeft <= 3) priority = 'high'
    else if (daysLeft <= 7) priority = 'medium'

    return {
      id: task.id,
      taskId: task.id,
      taskName: task.name,
      deadline: task.deadline,
      course: task.course,
      priority,
    }
  }).sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
}

// 问题反馈
export function getFeedbacks(): Feedback[] {
  return getData(STORAGE_KEYS.FEEDBACKS, initialFeedbacks)
}

export function getFeedbackMessages(): FeedbackMessage[] {
  return getData(STORAGE_KEYS.FEEDBACK_MESSAGES, [] as FeedbackMessage[])
}

function saveFeedbackMessages(messages: FeedbackMessage[]) {
  saveData(STORAGE_KEYS.FEEDBACK_MESSAGES, messages)
}

export function getFeedbackAttachments(): FeedbackAttachment[] {
  return getData(STORAGE_KEYS.FEEDBACK_ATTACHMENTS, [] as FeedbackAttachment[])
}

function saveFeedbackAttachments(items: FeedbackAttachment[]) {
  saveData(STORAGE_KEYS.FEEDBACK_ATTACHMENTS, items)
}

export function getFeedbackStatusHistory(): FeedbackStatusHistory[] {
  return getData(STORAGE_KEYS.FEEDBACK_STATUS_HISTORY, [] as FeedbackStatusHistory[])
}

function saveFeedbackStatusHistory(items: FeedbackStatusHistory[]) {
  saveData(STORAGE_KEYS.FEEDBACK_STATUS_HISTORY, items)
}

function todayString() {
  return new Date().toISOString().split('T')[0]
}

function pushNotification(item: Notification) {
  const notifications = getNotifications()
  notifications.push(item)
  saveNotifications(notifications)
}

function appendStatusHistory(item: FeedbackStatusHistory) {
  const history = getFeedbackStatusHistory()
  history.push(item)
  saveFeedbackStatusHistory(history)
}

function appendFeedbackMessage(message: FeedbackMessage) {
  const messages = getFeedbackMessages()
  messages.push(message)
  saveFeedbackMessages(messages)
}

function appendSystemMessage(params: {
  feedbackId: string
  senderId: string
  content: string
  createdAt?: string
}) {
  appendFeedbackMessage({
    id: `fm${Date.now()}${Math.random().toString(16).slice(2, 6)}`,
    feedbackId: params.feedbackId,
    senderRole: 'system',
    senderId: params.senderId,
    content: params.content,
    createdAt: params.createdAt ?? todayString(),
  })
}

function addStatusHistory(params: {
  feedbackId: string
  status: FeedbackStatus
  operatorRole: 'student' | 'teacher' | 'system'
  operatorId: string
  operatorName: string
  note?: string
  createdAt?: string
}) {
  appendStatusHistory({
    id: `fsh${Date.now()}${Math.random().toString(16).slice(2, 6)}`,
    feedbackId: params.feedbackId,
    status: params.status,
    operatorRole: params.operatorRole,
    operatorId: params.operatorId,
    operatorName: params.operatorName,
    note: params.note,
    createdAt: params.createdAt ?? todayString(),
  })
}

export function addFeedbackAttachment(params: {
  feedbackId: string
  uploaderRole: 'student' | 'teacher'
  uploaderId: string
  fileName: string
  mimeType: string
  size: number
  dataUrl: string
}): void {
  const today = todayString()
  const items = getFeedbackAttachments()
  const feedbacks = getFeedbacks()
  const feedback = feedbacks.find(item => item.id === params.feedbackId)
  if (!feedback) return

  items.push({
    id: `fa${Date.now()}`,
    feedbackId: params.feedbackId,
    uploaderRole: params.uploaderRole,
    uploaderId: params.uploaderId,
    fileName: params.fileName,
    mimeType: params.mimeType,
    size: params.size,
    dataUrl: params.dataUrl,
    createdAt: today,
  })
  saveFeedbackAttachments(items)

  appendSystemMessage({
    feedbackId: params.feedbackId,
    senderId: params.uploaderId,
    content: `${params.uploaderRole === 'teacher' ? '老师' : '学生'}上传了附件：${params.fileName}`,
    createdAt: today,
  })

  const recipientId = params.uploaderRole === 'teacher' ? feedback.studentId : feedback.assigneeTeacherId
  const recipientRole = params.uploaderRole === 'teacher' ? 'student' : 'teacher'
  pushNotification({
    id: `n${Date.now()}${Math.random().toString(16).slice(2, 6)}`,
    recipientId,
    recipientRole,
    type: 'feedback_attachment_added',
    feedbackId: feedback.id,
    title: '反馈新增附件',
    content: `${params.uploaderRole === 'teacher' ? '老师' : '学生'}在「${feedback.title}」中上传了附件：${params.fileName}`,
    createdAt: today,
    isRead: false,
  })
}

export function getNotifications(): Notification[] {
  return getData(STORAGE_KEYS.NOTIFICATIONS, [] as Notification[])
}

function saveNotifications(items: Notification[]) {
  saveData(STORAGE_KEYS.NOTIFICATIONS, items)
}

export function getUnreadNotifications(recipientId: string): Notification[] {
  return getNotifications()
    .filter(n => n.recipientId === recipientId && !n.isRead)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export function markNotificationRead(notificationId: string, recipientId: string): void {
  const items = getNotifications()
  const next = items.map(n => {
    if (n.id === notificationId && n.recipientId === recipientId) return { ...n, isRead: true }
    return n
  })
  saveNotifications(next)
}

export function markAllNotificationsRead(recipientId: string): void {
  const items = getNotifications()
  const next = items.map(n => (n.recipientId === recipientId ? { ...n, isRead: true } : n))
  saveNotifications(next)
}

export function markAllHelpNotificationsRead(recipientId: string): void {
  const items = getNotifications()
  const next = items.map(n => (
    n.recipientId === recipientId && (n.type === 'help_post_answered' || n.type === 'help_mentioned')
      ? { ...n, isRead: true }
      : n
  ))
  saveNotifications(next)
}

export function getHelpPosts(): HelpPost[] {
  return getData(STORAGE_KEYS.HELP_POSTS, [] as HelpPost[])
}

function saveHelpPosts(items: HelpPost[]) {
  saveData(STORAGE_KEYS.HELP_POSTS, items)
}

export function getHelpComments(postId?: string): HelpComment[] {
  const items = getData(STORAGE_KEYS.HELP_COMMENTS, [] as HelpComment[])
  return postId ? items.filter(item => item.postId === postId) : items
}

function saveHelpComments(items: HelpComment[]) {
  saveData(STORAGE_KEYS.HELP_COMMENTS, items)
}

export function getHelpCollects(userId?: string): HelpCollect[] {
  const items = getData(STORAGE_KEYS.HELP_COLLECTS, [] as HelpCollect[])
  return userId ? items.filter(item => item.userId === userId) : items
}

function saveHelpCollects(items: HelpCollect[]) {
  saveData(STORAGE_KEYS.HELP_COLLECTS, items)
}

export function getHelpPostById(postId: string): HelpPost | undefined {
  return getHelpPosts().find(item => item.id === postId)
}

export function createHelpPost(params: {
  userId: string
  title: string
  content: string
  isAnonymous: boolean
  attachments: HelpAttachment[]
}): HelpPost {
  const now = dateTimeString()
  const post: HelpPost = {
    id: `hp${Date.now()}${Math.random().toString(16).slice(2, 6)}`,
    userId: params.userId,
    title: params.title,
    content: params.content,
    isAnonymous: params.isAnonymous,
    likeCount: 0,
    commentCount: 0,
    collectCount: 0,
    createdAt: now,
    updatedAt: now,
    attachments: params.attachments,
    likedUserIds: [],
  }
  saveHelpPosts([post, ...getHelpPosts()])
  return post
}

export function toggleHelpPostLike(postId: string, userId: string): boolean {
  const posts = getHelpPosts()
  let liked = false
  const next = posts.map(post => {
    if (post.id !== postId) return post
    liked = !post.likedUserIds.includes(userId)
    const likedUserIds = liked
      ? [...post.likedUserIds, userId]
      : post.likedUserIds.filter(id => id !== userId)
    return { ...post, likedUserIds, likeCount: likedUserIds.length }
  })
  saveHelpPosts(next)
  return liked
}

export function toggleHelpCollect(postId: string, userId: string): boolean {
  const collects = getHelpCollects()
  const existing = collects.find(item => item.postId === postId && item.userId === userId)
  const nextCollects = existing
    ? collects.filter(item => item.id !== existing.id)
    : [...collects, { id: `hc${Date.now()}${Math.random().toString(16).slice(2, 6)}`, postId, userId, createdAt: dateTimeString() }]
  saveHelpCollects(nextCollects)

  const collectCount = nextCollects.filter(item => item.postId === postId).length
  saveHelpPosts(getHelpPosts().map(post => post.id === postId ? { ...post, collectCount } : post))
  return !existing
}

function extractMentionedUserIds(content: string): string[] {
  const users = getUsers()
  return Array.from(new Set(users
    .filter(user => content.includes(`@${user.name}`))
    .map(user => user.id)))
}

export function addHelpComment(params: {
  postId: string
  userId: string
  content: string
}): HelpComment | null {
  const posts = getHelpPosts()
  const post = posts.find(item => item.id === params.postId)
  if (!post) return null

  const user = getUsers().find(item => item.id === params.userId)
  const now = dateTimeString()
  const comment: HelpComment = {
    id: `hcm${Date.now()}${Math.random().toString(16).slice(2, 6)}`,
    postId: params.postId,
    userId: params.userId,
    content: params.content,
    isOfficial: user?.role === 'teacher',
    likeCount: 0,
    createdAt: now,
    likedUserIds: [],
  }

  const comments = getHelpComments()
  comments.push(comment)
  saveHelpComments(comments)
  saveHelpPosts(posts.map(item => item.id === params.postId ? { ...item, commentCount: item.commentCount + 1 } : item))

  if (post.userId !== params.userId) {
    pushNotification({
      id: `n${Date.now()}help-answer`,
      recipientId: post.userId,
      recipientRole: getUsers().find(item => item.id === post.userId)?.role ?? 'student',
      type: 'help_post_answered',
      targetPath: `/dashboard/help/${post.id}`,
      title: '有人回答了你的提问',
      content: `${user?.name ?? '用户'} 回答了「${post.title}」`,
      createdAt: now,
      isRead: false,
    })
  }

  extractMentionedUserIds(params.content)
    .filter(userId => userId !== params.userId)
    .forEach(userId => {
      pushNotification({
        id: `n${Date.now()}mention${userId}`,
        recipientId: userId,
        recipientRole: getUsers().find(item => item.id === userId)?.role ?? 'student',
        type: 'help_mentioned',
        targetPath: `/dashboard/help/${post.id}`,
        title: '有人在回答中@了你',
        content: `${user?.name ?? '用户'} 在「${post.title}」中@了你`,
        createdAt: now,
        isRead: false,
      })
    })

  return comment
}

export function toggleHelpCommentLike(commentId: string, userId: string): boolean {
  const comments = getHelpComments()
  let liked = false
  const next = comments.map(comment => {
    if (comment.id !== commentId) return comment
    liked = !comment.likedUserIds.includes(userId)
    const likedUserIds = liked
      ? [...comment.likedUserIds, userId]
      : comment.likedUserIds.filter(id => id !== userId)
    return { ...comment, likedUserIds, likeCount: likedUserIds.length }
  })
  saveHelpComments(next)
  return liked
}

export function getUserHelpActivity(userId: string) {
  const posts = getHelpPosts()
  const comments = getHelpComments()
  const collects = getHelpCollects(userId)
  return {
    posts: posts.filter(post => post.userId === userId),
    collectedPosts: collects
      .map(collect => posts.find(post => post.id === collect.postId))
      .filter((post): post is HelpPost => Boolean(post)),
    answeredPosts: comments
      .filter(comment => comment.userId === userId)
      .map(comment => posts.find(post => post.id === comment.postId))
      .filter((post): post is HelpPost => Boolean(post))
      .filter((post, index, arr) => arr.findIndex(item => item.id === post.id) === index),
  }
}

export function getFeedbackById(feedbackId: string): Feedback | undefined {
  return getFeedbacks().find(f => f.id === feedbackId)
}

export function updateFeedbackByStudent(params: {
  feedbackId: string
  studentId: string
  patch: Pick<Feedback, 'category' | 'type' | 'title' | 'content'> & { subject?: string; assigneeTeacherId: string; assigneeTeacherName: string }
}): boolean {
  const { feedbackId, studentId, patch } = params
  const feedbacks = getFeedbacks()
  const idx = feedbacks.findIndex(f => f.id === feedbackId)
  if (idx === -1) return false
  const fb = feedbacks[idx]
  if (fb.studentId !== studentId) return false
  if (fb.status !== 'pending') return false

  const oldTeacherId = fb.assigneeTeacherId
  const oldTeacherName = fb.assigneeTeacherName
  const today = todayString()

  feedbacks[idx] = {
    ...fb,
    category: patch.category,
    subject: patch.subject,
    type: patch.type,
    title: patch.title.slice(0, 100),
    content: patch.content,
    assigneeTeacherId: patch.assigneeTeacherId,
    assigneeTeacherName: patch.assigneeTeacherName,
    statusUpdatedAt: today,
    unreadForTeacher: true,
    unreadForStudent: false,
  }
  saveData(STORAGE_KEYS.FEEDBACKS, feedbacks)

  appendSystemMessage({
    feedbackId,
    senderId: studentId,
    content:
      oldTeacherId !== patch.assigneeTeacherId
        ? `学生更新了反馈内容，并将反馈对象从 ${oldTeacherName} 调整为 ${patch.assigneeTeacherName}`
        : '学生更新了反馈内容',
    createdAt: today,
  })

  if (oldTeacherId !== patch.assigneeTeacherId) {
    pushNotification({
      id: `n${Date.now()}a`,
      recipientId: patch.assigneeTeacherId,
      recipientRole: 'teacher',
      type: 'feedback_updated',
      feedbackId,
      title: '有新的学生反馈转给你',
      content: `${fb.studentName} 将反馈「${patch.title.slice(0, 100)}」指定给你处理`,
      createdAt: today,
      isRead: false,
    })
  } else {
    pushNotification({
      id: `n${Date.now()}b`,
      recipientId: patch.assigneeTeacherId,
      recipientRole: 'teacher',
      type: 'feedback_updated',
      feedbackId,
      title: '学生更新了反馈内容',
      content: `${fb.studentName} 更新了反馈「${patch.title.slice(0, 100)}」`,
      createdAt: today,
      isRead: false,
    })
  }

  return true
}

export function deleteFeedbackByStudent(params: { feedbackId: string; studentId: string }): boolean {
  const { feedbackId, studentId } = params
  const feedbacks = getFeedbacks()
  const target = feedbacks.find(f => f.id === feedbackId)
  if (!target) return false
  if (target.studentId !== studentId) return false
  if (target.status !== 'pending') return false

  saveData(STORAGE_KEYS.FEEDBACKS, feedbacks.filter(f => f.id !== feedbackId))
  saveFeedbackMessages(getFeedbackMessages().filter(m => m.feedbackId !== feedbackId))
  saveFeedbackAttachments(getFeedbackAttachments().filter(a => a.feedbackId !== feedbackId))
  // 通知不做硬删，保留历史
  return true
}

export function addFeedback(
  feedback: Omit<
    Feedback,
    | 'id'
    | 'createdAt'
    | 'status'
    | 'unreadForStudent'
    | 'unreadForTeacher'
    | 'lastReplyAt'
    | 'lastReplyBy'
  >
): Feedback {
  const feedbacks = getFeedbacks()
  const createdAt = todayString()
  const newFeedback: Feedback = {
    ...feedback,
    visibility: feedback.visibility ?? 'private',
    isPublicQuestion: feedback.isPublicQuestion ?? false,
    publicReplyCount: feedback.publicReplyCount ?? 0,
    likeCount: feedback.likeCount ?? 0,
    id: `f${Date.now()}`,
    createdAt,
    status: 'pending',
    statusUpdatedAt: createdAt,
    unreadForStudent: false,
    unreadForTeacher: true,
  }
  feedbacks.push(newFeedback)
  saveData(STORAGE_KEYS.FEEDBACKS, feedbacks)

  appendFeedbackMessage({
    id: `fm${Date.now()}`,
    feedbackId: newFeedback.id,
    senderRole: 'student',
    senderId: newFeedback.studentId,
    content: newFeedback.content,
    createdAt: newFeedback.createdAt,
  })
  addStatusHistory({
    feedbackId: newFeedback.id,
    status: 'pending',
    operatorRole: 'student',
    operatorId: newFeedback.studentId,
    operatorName: newFeedback.studentName,
    note: `反馈已提交给 ${newFeedback.assigneeTeacherName}`,
    createdAt,
  })

  pushNotification({
    id: `n${Date.now()}`,
    recipientId: newFeedback.assigneeTeacherId,
    recipientRole: 'teacher',
    type: 'feedback_created',
    feedbackId: newFeedback.id,
    title: '收到新的学生反馈',
    content: `${newFeedback.studentName} 提交了反馈：${newFeedback.title}`,
    createdAt: newFeedback.createdAt,
    isRead: false,
  })

  return newFeedback
}

export function resolveFeedback(params: {
  feedbackId: string
  teacherId: string
  teacherName: string
  note?: string
}): boolean {
  const feedbacks = getFeedbacks()
  const index = feedbacks.findIndex(f => f.id === params.feedbackId)
  if (index === -1) return false

  const target = feedbacks[index]
  if (target.assigneeTeacherId !== params.teacherId) return false

  const today = todayString()
  feedbacks[index] = {
    ...target,
    status: 'resolved',
    statusUpdatedAt: today,
    latestStatusNote: params.note,
    unreadForStudent: true,
    unreadForTeacher: false,
    lastReplyAt: today,
    lastReplyBy: 'teacher',
  }
  saveData(STORAGE_KEYS.FEEDBACKS, feedbacks)

  addStatusHistory({
    feedbackId: params.feedbackId,
    status: 'resolved',
    operatorRole: 'teacher',
    operatorId: params.teacherId,
    operatorName: params.teacherName,
    note: params.note || '老师已标记为已解决',
    createdAt: today,
  })

  pushNotification({
    id: `n${Date.now()}`,
    recipientId: target.studentId,
    recipientRole: 'student',
    type: 'feedback_status_changed',
    feedbackId: params.feedbackId,
    title: '反馈状态已更新',
    content: `你的反馈「${target.title}」已标记为已解决`,
    createdAt: today,
    isRead: false,
  })

  pushNotification({
    id: `n${Date.now()}t`,
    recipientId: target.assigneeTeacherId,
    recipientRole: 'teacher',
    type: 'feedback_status_changed',
    feedbackId: params.feedbackId,
    title: '反馈状态已同步',
    content: `你已将反馈「${target.title}」标记为已解决`,
    createdAt: today,
    isRead: false,
  })

  return true
}

export function replyToFeedback(params: {
  feedbackId: string
  teacherId: string
  teacherName: string
  content: string
  nextStatus?: FeedbackStatus
}): boolean {
  const { feedbackId, teacherId, teacherName, content, nextStatus } = params
  const feedbacks = getFeedbacks()
  const idx = feedbacks.findIndex(f => f.id === feedbackId)
  if (idx === -1) return false
  const fb = feedbacks[idx]

  // 权限隔离：只能回复分配给自己的
  if (fb.assigneeTeacherId !== teacherId) return false

  const today = todayString()
  appendFeedbackMessage({
    id: `fm${Date.now()}`,
    feedbackId,
    senderRole: 'teacher',
    senderId: teacherId,
    content,
    createdAt: today,
  })

  const next = nextStatus ?? (fb.status === 'pending' ? 'replied' : fb.status)

  feedbacks[idx] = {
    ...fb,
    status: next,
    lastReplyAt: today,
    lastReplyBy: 'teacher',
    statusUpdatedAt: today,
    latestStatusNote: content,
    unreadForStudent: true,
    unreadForTeacher: false,
  }
  saveData(STORAGE_KEYS.FEEDBACKS, feedbacks)

  addStatusHistory({
    feedbackId,
    status: next,
    operatorRole: 'teacher',
    operatorId: teacherId,
    operatorName: teacherName,
    note: content,
    createdAt: today,
  })

  pushNotification({
    id: `n${Date.now()}`,
    recipientId: fb.studentId,
    recipientRole: 'student',
    type: 'feedback_replied',
    feedbackId,
    title: '老师已回复你的反馈',
    content: `${teacherName} 回复了「${fb.title}」`,
    createdAt: today,
    isRead: false,
  })

  if (next !== fb.status) {
    pushNotification({
      id: `n${Date.now()}s`,
      recipientId: fb.studentId,
      recipientRole: 'student',
      type: 'feedback_status_changed',
      feedbackId,
      title: '反馈状态已更新',
      content: `你的反馈「${fb.title}」状态更新为${next === 'resolved' ? '已解决' : next === 'replied' ? '已回复' : next === 'closed' ? '已关闭' : '待处理'}`,
      createdAt: today,
      isRead: false,
    })
  }

  return true
}

export function closeFeedbackByTeacher(params: {
  feedbackId: string
  teacherId: string
  teacherName: string
  note?: string
}): boolean {
  const feedbacks = getFeedbacks()
  const idx = feedbacks.findIndex(f => f.id === params.feedbackId)
  if (idx === -1) return false

  const feedback = feedbacks[idx]
  if (feedback.assigneeTeacherId !== params.teacherId) return false

  const today = todayString()
  feedbacks[idx] = {
    ...feedback,
    status: 'closed',
    statusUpdatedAt: today,
    latestStatusNote: params.note || '无需再跟进',
    unreadForStudent: true,
    unreadForTeacher: false,
    lastReplyAt: today,
    lastReplyBy: 'teacher',
  }
  saveData(STORAGE_KEYS.FEEDBACKS, feedbacks)

  addStatusHistory({
    feedbackId: params.feedbackId,
    status: 'closed',
    operatorRole: 'teacher',
    operatorId: params.teacherId,
    operatorName: params.teacherName,
    note: params.note || '无需再跟进',
    createdAt: today,
  })

  pushNotification({
    id: `n${Date.now()}c`,
    recipientId: feedback.studentId,
    recipientRole: 'student',
    type: 'feedback_status_changed',
    feedbackId: params.feedbackId,
    title: '反馈已关闭',
    content: `你的反馈「${feedback.title}」已被标记为无需再跟进`,
    createdAt: today,
    isRead: false,
  })

  return true
}

export function markFeedbackRead(params: { feedbackId: string; role: UserRole; userId: string }): void {
  const { feedbackId, role, userId } = params
  const feedbacks = getFeedbacks()
  const idx = feedbacks.findIndex(f => f.id === feedbackId)
  if (idx === -1) return
  const fb = feedbacks[idx]

  if (role === 'student') {
    if (fb.studentId !== userId) return
    feedbacks[idx] = { ...fb, unreadForStudent: false }
  } else {
    if (fb.assigneeTeacherId !== userId) return
    feedbacks[idx] = { ...fb, unreadForTeacher: false }
  }
  saveData(STORAGE_KEYS.FEEDBACKS, feedbacks)
}

export function getFeedbackStatusHistoryByFeedbackId(feedbackId: string): FeedbackStatusHistory[] {
  return getFeedbackStatusHistory()
    .filter(item => item.feedbackId === feedbackId)
    .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
}

export function getTeacherFeedbackStats(teacherId: string) {
  const items = getFeedbacks().filter(item => item.assigneeTeacherId === teacherId)
  const total = items.length
  const pending = items.filter(item => item.status === 'pending').length
  const replied = items.filter(item => item.status === 'replied').length
  const resolved = items.filter(item => item.status === 'resolved').length
  const closed = items.filter(item => item.status === 'closed').length
  const unread = items.filter(item => item.unreadForTeacher).length
  const processed = replied + resolved + closed

  const categoryDistribution = [
    { key: 'academic', label: '学业问题', value: items.filter(item => item.category === 'academic').length, fill: 'var(--color-academic)' },
    { key: 'life', label: '生活问题', value: items.filter(item => item.category === 'life').length, fill: 'var(--color-life)' },
    { key: 'classAffairs', label: '班级事务', value: items.filter(item => item.category === 'classAffairs').length, fill: 'var(--color-classAffairs)' },
    { key: 'system', label: '系统建议', value: items.filter(item => item.category === 'system').length, fill: 'var(--color-system)' },
  ]

  const statusDistribution = [
    { key: 'pending', label: '待处理', value: pending, fill: 'var(--color-pending)' },
    { key: 'replied', label: '已回复', value: replied, fill: 'var(--color-replied)' },
    { key: 'resolved', label: '已解决', value: resolved, fill: 'var(--color-resolved)' },
    { key: 'closed', label: '已关闭', value: closed, fill: 'var(--color-closed)' },
  ]

  return {
    total,
    pending,
    replied,
    resolved,
    closed,
    unread,
    processingRate: total === 0 ? 0 : Math.round((processed / total) * 100),
    categoryDistribution,
    statusDistribution,
  }
}

export function getTeacherAssigneeGroupsForStudent(studentId: string): Array<{
  group: string
  teachers: Array<{ id: string; name: string }>
}> {
  // 简化实现：按“角色/学科”硬编码分组（后续可替换为课程/班级映射）
  const users = getUsers().filter(u => u.role === 'teacher')
  const headTeacher = users.find(u => u.id === 'teacher')
  const mlTeacher = users.find(u => u.id === 'teacher2')
  const mathTeacher = users.find(u => u.id === 'teacher3')

  return [
    {
      group: '班主任',
      teachers: headTeacher ? [{ id: headTeacher.id, name: headTeacher.name }] : [],
    },
    {
      group: 'AI核心课',
      teachers: mlTeacher ? [{ id: mlTeacher.id, name: mlTeacher.name }] : [],
    },
    {
      group: '通识课',
      teachers: mathTeacher ? [{ id: mathTeacher.id, name: mathTeacher.name }] : [],
    },
  ].filter(g => g.teachers.length > 0)
}

// Student interaction layer. It is stored separately from directed teacher feedback so
// private feedback remains invisible to classmates.
function canViewVisibility(item: { visibility?: ContentVisibility; studentId?: string; authorId?: string; ownerId?: string }, userId: string) {
  const ownerId = item.studentId ?? item.authorId ?? item.ownerId
  if ((item.visibility ?? 'public') === 'public') return true
  return ownerId === userId
}

function isMutedNow(userId: string) {
  const setting = getInteractionMuteSettings().find(item => item.userId === userId)
  if (!setting?.enabled) return false
  const now = new Date()
  const current = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  if (setting.startTime <= setting.endTime) return current >= setting.startTime && current <= setting.endTime
  return current >= setting.startTime || current <= setting.endTime
}

function notifyInteraction(item: Notification) {
  if (isMutedNow(item.recipientId)) return
  pushNotification(item)
}

export function getPublicQuestions(userId?: string, sort: 'hot' | 'time' = 'hot', subject = 'all'): Feedback[] {
  const items = getFeedbacks().filter(item => {
    const publicQuestion = item.category === 'academic' && item.type === 'question' && item.isPublicQuestion && item.visibility === 'public'
    if (!publicQuestion) return false
    if (userId && !canViewVisibility(item, userId)) return false
    if (subject !== 'all' && item.subject !== subject) return false
    return true
  })

  return items.sort((a, b) => {
    if (sort === 'time') return a.createdAt < b.createdAt ? 1 : -1
    const aHot = (a.publicReplyCount ?? 0) * 3 + (a.likeCount ?? 0)
    const bHot = (b.publicReplyCount ?? 0) * 3 + (b.likeCount ?? 0)
    return bHot - aHot || (a.createdAt < b.createdAt ? 1 : -1)
  })
}

export function setFeedbackVisibility(params: { feedbackId: string; studentId: string; visibility: ContentVisibility; isPublicQuestion?: boolean }): boolean {
  const feedbacks = getFeedbacks()
  const idx = feedbacks.findIndex(item => item.id === params.feedbackId)
  if (idx === -1) return false
  const target = feedbacks[idx]
  if (target.studentId !== params.studentId) return false
  feedbacks[idx] = {
    ...target,
    visibility: params.visibility,
    isPublicQuestion: params.isPublicQuestion ?? (params.visibility === 'public' && target.category === 'academic' && target.type === 'question'),
  }
  saveData(STORAGE_KEYS.FEEDBACKS, feedbacks)
  return true
}

export function getInteractionAnswers(feedbackId?: string): InteractionAnswer[] {
  const items = getData(STORAGE_KEYS.INTERACTION_ANSWERS, [] as InteractionAnswer[])
  return (feedbackId ? items.filter(item => item.feedbackId === feedbackId) : items)
    .sort((a, b) => Number(b.isAccepted) - Number(a.isAccepted) || b.likeUserIds.length - a.likeUserIds.length)
}

function saveInteractionAnswers(items: InteractionAnswer[]) {
  saveData(STORAGE_KEYS.INTERACTION_ANSWERS, items)
}

export function addInteractionAnswer(params: { feedbackId: string; studentId: string; studentName: string; content: string }): InteractionAnswer | null {
  const feedbacks = getFeedbacks()
  const idx = feedbacks.findIndex(item => item.id === params.feedbackId)
  if (idx === -1) return null
  const question = feedbacks[idx]
  if (!question.isPublicQuestion || question.visibility !== 'public') return null

  const createdAt = todayString()
  const answer: InteractionAnswer = {
    id: `ia${Date.now()}${Math.random().toString(16).slice(2, 6)}`,
    feedbackId: params.feedbackId,
    studentId: params.studentId,
    studentName: params.studentName,
    content: params.content,
    likeUserIds: [],
    isAccepted: false,
    reports: 0,
    createdAt,
  }
  const answers = getInteractionAnswers()
  answers.push(answer)
  saveInteractionAnswers(answers)

  feedbacks[idx] = { ...question, publicReplyCount: (question.publicReplyCount ?? 0) + 1 }
  saveData(STORAGE_KEYS.FEEDBACKS, feedbacks)

  if (question.studentId !== params.studentId) {
    notifyInteraction({
      id: `n${Date.now()}qa`,
      recipientId: question.studentId,
      recipientRole: 'student',
      type: 'interaction_answered',
      targetPath: '/dashboard/feedback?tab=qa',
      title: '同学回答了你的公开问题',
      content: `${params.studentName} 回答了「${question.title}」`,
      createdAt,
      isRead: false,
    })
  }
  return answer
}

export function toggleAnswerLike(answerId: string, userId: string): boolean {
  const answers = getInteractionAnswers()
  const idx = answers.findIndex(item => item.id === answerId)
  if (idx === -1) return false
  const target = answers[idx]
  const liked = target.likeUserIds.includes(userId)
  answers[idx] = {
    ...target,
    likeUserIds: liked ? target.likeUserIds.filter(id => id !== userId) : [...target.likeUserIds, userId],
  }
  saveInteractionAnswers(answers)
  return !liked
}

export function acceptInteractionAnswer(params: { feedbackId: string; answerId: string; studentId: string }): boolean {
  const question = getFeedbackById(params.feedbackId)
  if (!question || question.studentId !== params.studentId) return false
  const answers = getInteractionAnswers()
  const answer = answers.find(item => item.id === params.answerId && item.feedbackId === params.feedbackId)
  if (!answer) return false
  saveInteractionAnswers(answers.map(item => (
    item.feedbackId === params.feedbackId ? { ...item, isAccepted: item.id === params.answerId } : item
  )))
  setFeedbackVisibility({ feedbackId: params.feedbackId, studentId: params.studentId, visibility: question.visibility ?? 'public', isPublicQuestion: true })
  const feedbacks = getFeedbacks()
  const idx = feedbacks.findIndex(item => item.id === params.feedbackId)
  if (idx >= 0) {
    feedbacks[idx] = { ...feedbacks[idx], acceptedAnswerId: params.answerId }
    saveData(STORAGE_KEYS.FEEDBACKS, feedbacks)
  }
  return true
}

export function getSharePosts(userId?: string): SharePost[] {
  return getData(STORAGE_KEYS.SHARE_POSTS, [] as SharePost[])
    .filter(item => !userId || canViewVisibility(item, userId))
    .sort((a, b) => b.likeUserIds.length + b.favoriteUserIds.length - (a.likeUserIds.length + a.favoriteUserIds.length))
}

export function addSharePost(params: { authorId: string; authorName: string; title: string; subject: string; content: string; visibility: ContentVisibility }): SharePost {
  const items = getSharePosts()
  const post: SharePost = {
    id: `sp${Date.now()}`,
    authorId: params.authorId,
    authorName: params.authorName,
    title: params.title,
    subject: params.subject,
    content: params.content,
    visibility: params.visibility,
    likeUserIds: [],
    favoriteUserIds: [],
    commentCount: 0,
    downloadCount: 0,
    createdAt: todayString(),
  }
  items.push(post)
  saveData(STORAGE_KEYS.SHARE_POSTS, items)
  return post
}

export function toggleShareLike(postId: string, userId: string): boolean {
  const items = getData(STORAGE_KEYS.SHARE_POSTS, [] as SharePost[])
  const idx = items.findIndex(item => item.id === postId)
  if (idx === -1) return false
  const target = items[idx]
  const liked = target.likeUserIds.includes(userId)
  items[idx] = { ...target, likeUserIds: liked ? target.likeUserIds.filter(id => id !== userId) : [...target.likeUserIds, userId] }
  saveData(STORAGE_KEYS.SHARE_POSTS, items)
  return !liked
}

export function getClassTopics(userId?: string): ClassTopic[] {
  return getData(STORAGE_KEYS.CLASS_TOPICS, [] as ClassTopic[])
    .filter(item => !userId || canViewVisibility(item, userId))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.likeUserIds.length + b.commentCount - (a.likeUserIds.length + a.commentCount))
}

export function addClassTopic(params: { authorId: string; authorName: string; authorRole: 'student' | 'teacher'; title: string; content: string; visibility: ContentVisibility; pinned?: boolean }): ClassTopic {
  const items = getClassTopics()
  const topic: ClassTopic = {
    id: `ct${Date.now()}`,
    authorId: params.authorId,
    authorName: params.authorName,
    authorRole: params.authorRole,
    title: params.title,
    content: params.content,
    visibility: params.visibility,
    pinned: params.pinned ?? false,
    likeUserIds: [],
    commentCount: 0,
    createdAt: todayString(),
  }
  items.push(topic)
  saveData(STORAGE_KEYS.CLASS_TOPICS, items)
  return topic
}

export function getInteractionComments(targetType?: 'share' | 'topic', targetId?: string): InteractionComment[] {
  return getData(STORAGE_KEYS.INTERACTION_COMMENTS, [] as InteractionComment[])
    .filter(item => (!targetType || item.targetType === targetType) && (!targetId || item.targetId === targetId))
    .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
}

export function addInteractionComment(params: { targetType: 'share' | 'topic'; targetId: string; studentId: string; studentName: string; content: string; parentId?: string }): InteractionComment {
  const comment: InteractionComment = {
    id: `ic${Date.now()}${Math.random().toString(16).slice(2, 6)}`,
    targetType: params.targetType,
    targetId: params.targetId,
    parentId: params.parentId,
    studentId: params.studentId,
    studentName: params.studentName,
    content: params.content,
    mentions: Array.from(params.content.matchAll(/@([\u4e00-\u9fa5A-Za-z0-9_]+)/g)).map(match => match[1]),
    likeUserIds: [],
    reports: 0,
    createdAt: todayString(),
  }
  const comments = getInteractionComments()
  comments.push(comment)
  saveData(STORAGE_KEYS.INTERACTION_COMMENTS, comments)

  if (params.targetType === 'share') {
    const posts = getData(STORAGE_KEYS.SHARE_POSTS, [] as SharePost[])
    saveData(STORAGE_KEYS.SHARE_POSTS, posts.map(item => item.id === params.targetId ? { ...item, commentCount: item.commentCount + 1 } : item))
  } else {
    const topics = getData(STORAGE_KEYS.CLASS_TOPICS, [] as ClassTopic[])
    saveData(STORAGE_KEYS.CLASS_TOPICS, topics.map(item => item.id === params.targetId ? { ...item, commentCount: item.commentCount + 1 } : item))
  }
  return comment
}

export function getStudyTeams(userId?: string): StudyTeam[] {
  return getData(STORAGE_KEYS.STUDY_TEAMS, [] as StudyTeam[])
    .filter(item => !userId || canViewVisibility(item, userId) || item.memberIds.includes(userId) || item.applicantIds.includes(userId))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export function addStudyTeam(params: { ownerId: string; ownerName: string; title: string; purpose: string; subject: string; maxMembers: number; visibility: ContentVisibility }): StudyTeam {
  const teams = getStudyTeams()
  const team: StudyTeam = {
    id: `st${Date.now()}`,
    ownerId: params.ownerId,
    ownerName: params.ownerName,
    title: params.title,
    purpose: params.purpose,
    subject: params.subject,
    maxMembers: params.maxMembers,
    visibility: params.visibility,
    memberIds: [params.ownerId],
    applicantIds: [],
    status: 'open',
    createdAt: todayString(),
  }
  teams.push(team)
  saveData(STORAGE_KEYS.STUDY_TEAMS, teams)
  return team
}

export function applyToStudyTeam(params: { teamId: string; studentId: string; studentName: string }): boolean {
  const teams = getData(STORAGE_KEYS.STUDY_TEAMS, [] as StudyTeam[])
  const idx = teams.findIndex(item => item.id === params.teamId)
  if (idx === -1) return false
  const team = teams[idx]
  if (team.memberIds.includes(params.studentId) || team.applicantIds.includes(params.studentId)) return false
  teams[idx] = { ...team, applicantIds: [...team.applicantIds, params.studentId] }
  saveData(STORAGE_KEYS.STUDY_TEAMS, teams)
  notifyInteraction({
    id: `n${Date.now()}team`,
    recipientId: team.ownerId,
    recipientRole: 'student',
    type: 'interaction_team_requested',
    targetPath: '/dashboard/feedback?tab=teams',
    title: '收到新的组队申请',
    content: `${params.studentName} 申请加入「${team.title}」`,
    createdAt: todayString(),
    isRead: false,
  })
  return true
}

export function approveStudyTeamApplicant(params: { teamId: string; ownerId: string; applicantId: string }): boolean {
  const teams = getData(STORAGE_KEYS.STUDY_TEAMS, [] as StudyTeam[])
  const idx = teams.findIndex(item => item.id === params.teamId)
  if (idx === -1) return false
  const team = teams[idx]
  if (team.ownerId !== params.ownerId || !team.applicantIds.includes(params.applicantId)) return false
  const memberIds = [...team.memberIds, params.applicantId]
  teams[idx] = {
    ...team,
    memberIds,
    applicantIds: team.applicantIds.filter(id => id !== params.applicantId),
    status: memberIds.length >= team.maxMembers ? 'formed' : team.status,
  }
  saveData(STORAGE_KEYS.STUDY_TEAMS, teams)
  notifyInteraction({
    id: `n${Date.now()}approved`,
    recipientId: params.applicantId,
    recipientRole: 'student',
    type: 'interaction_team_approved',
    targetPath: '/dashboard/feedback?tab=teams',
    title: '组队申请已通过',
    content: `你已加入「${team.title}」`,
    createdAt: todayString(),
    isRead: false,
  })
  return true
}

export function getTeamMessages(teamId: string): TeamMessage[] {
  return getData(STORAGE_KEYS.TEAM_MESSAGES, [] as TeamMessage[])
    .filter(item => item.teamId === teamId)
    .sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
}

export function addTeamMessage(params: { teamId: string; senderId: string; senderName: string; content: string }): TeamMessage | null {
  const team = getStudyTeams(params.senderId).find(item => item.id === params.teamId)
  if (!team || !team.memberIds.includes(params.senderId)) return null
  const messages = getData(STORAGE_KEYS.TEAM_MESSAGES, [] as TeamMessage[])
  const message: TeamMessage = {
    id: `tm${Date.now()}`,
    teamId: params.teamId,
    senderId: params.senderId,
    senderName: params.senderName,
    content: params.content,
    createdAt: todayString(),
  }
  messages.push(message)
  saveData(STORAGE_KEYS.TEAM_MESSAGES, messages)
  return message
}

export function getStudentFavorites(studentId: string): StudentFavorite[] {
  return getData(STORAGE_KEYS.STUDENT_FAVORITES, [] as StudentFavorite[]).filter(item => item.studentId === studentId)
}

export function toggleFavorite(params: { studentId: string; targetType: 'question' | 'share'; targetId: string }): boolean {
  const items = getData(STORAGE_KEYS.STUDENT_FAVORITES, [] as StudentFavorite[])
  const existing = items.find(item => item.studentId === params.studentId && item.targetType === params.targetType && item.targetId === params.targetId)
  if (existing) {
    saveData(STORAGE_KEYS.STUDENT_FAVORITES, items.filter(item => item.id !== existing.id))
    return false
  }
  items.push({ id: `fav${Date.now()}`, ...params, createdAt: todayString() })
  saveData(STORAGE_KEYS.STUDENT_FAVORITES, items)
  if (params.targetType === 'share') {
    const posts = getData(STORAGE_KEYS.SHARE_POSTS, [] as SharePost[])
    saveData(STORAGE_KEYS.SHARE_POSTS, posts.map(item => item.id === params.targetId ? { ...item, favoriteUserIds: [...new Set([...item.favoriteUserIds, params.studentId])] } : item))
  }
  return true
}

export function addInteractionAttachment(params: Omit<InteractionAttachment, 'id' | 'downloadCount' | 'createdAt'>): void {
  const items = getData(STORAGE_KEYS.INTERACTION_ATTACHMENTS, [] as InteractionAttachment[])
  items.push({
    ...params,
    id: `iat${Date.now()}`,
    downloadCount: 0,
    createdAt: todayString(),
  })
  saveData(STORAGE_KEYS.INTERACTION_ATTACHMENTS, items)
}

export function getInteractionAttachments(ownerType?: string, ownerId?: string): InteractionAttachment[] {
  return getData(STORAGE_KEYS.INTERACTION_ATTACHMENTS, [] as InteractionAttachment[])
    .filter(item => (!ownerType || item.ownerType === ownerType) && (!ownerId || item.ownerId === ownerId))
}

export function addInteractionReport(params: { reporterId: string; reporterName: string; targetType: 'answer' | 'discussion' | 'share' | 'topic' | 'team_message'; targetId: string; reason: string }): InteractionReport {
  const items = getData(STORAGE_KEYS.INTERACTION_REPORTS, [] as InteractionReport[])
  const report: InteractionReport = {
    id: `ir${Date.now()}`,
    reporterId: params.reporterId,
    reporterName: params.reporterName,
    targetType: params.targetType,
    targetId: params.targetId,
    reason: params.reason,
    status: 'pending',
    createdAt: todayString(),
  }
  items.push(report)
  saveData(STORAGE_KEYS.INTERACTION_REPORTS, items)
  return report
}

export function getInteractionReports(): InteractionReport[] {
  return getData(STORAGE_KEYS.INTERACTION_REPORTS, [] as InteractionReport[]).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
}

export function reviewInteractionReport(params: { reportId: string; reviewerId: string; reviewerName: string; status: 'resolved' | 'rejected' }): boolean {
  const items = getInteractionReports()
  const idx = items.findIndex(item => item.id === params.reportId)
  if (idx === -1) return false
  items[idx] = { ...items[idx], status: params.status, reviewerId: params.reviewerId, reviewerName: params.reviewerName, reviewedAt: todayString() }
  saveData(STORAGE_KEYS.INTERACTION_REPORTS, items)
  return true
}

export function getInteractionMuteSettings(): InteractionMuteSetting[] {
  return getData(STORAGE_KEYS.INTERACTION_MUTE_SETTINGS, [] as InteractionMuteSetting[])
}

export function upsertInteractionMuteSetting(setting: InteractionMuteSetting): void {
  const items = getInteractionMuteSettings()
  const idx = items.findIndex(item => item.userId === setting.userId)
  if (idx >= 0) items[idx] = setting
  else items.push(setting)
  saveData(STORAGE_KEYS.INTERACTION_MUTE_SETTINGS, items)
}

export function getStudentContributions(): StudentContribution[] {
  const students = getUsers().filter(item => item.role === 'student')
  const answers = getInteractionAnswers()
  const shares = getData(STORAGE_KEYS.SHARE_POSTS, [] as SharePost[])
  return students.map(student => {
    const studentAnswers = answers.filter(item => item.studentId === student.id)
    const acceptedAnswers = studentAnswers.filter(item => item.isAccepted).length
    const answerLikes = studentAnswers.reduce((sum, item) => sum + item.likeUserIds.length, 0)
    const studentShares = shares.filter(item => item.authorId === student.id)
    const favorites = studentShares.reduce((sum, item) => sum + item.favoriteUserIds.length, 0)
    const shareLikes = studentShares.reduce((sum, item) => sum + item.likeUserIds.length, 0)
    return {
      studentId: student.id,
      studentName: student.name,
      acceptedAnswers,
      likes: answerLikes + shareLikes,
      favorites,
      contributionValue: acceptedAnswers * 20 + favorites * 5 + answerLikes + shareLikes,
    }
  }).sort((a, b) => b.contributionValue - a.contributionValue)
}
