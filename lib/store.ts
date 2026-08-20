'use client'

import { supabase } from './supabase/client'
import { usernameToEmail } from './auth-email'
import type {
  User,
  StudentProfile,
  StudentBasicProfile,
  Course,
  StudentCourse,
  CourseGradeRecord,
  GPASummary,
  YearlyGPA,
  CreditAnalysis,
  RankingLeaderboard,
  RankingLeaderboardEntry,
  SemesterGPA,
  ClassStats,
  ExamStatus,
  RemediationStatus,
  GPAScale,
} from './types'

const CURRENT_ACADEMIC_YEAR = '2025-2026学年'
const CURRENT_SEMESTER = '第二学期'
const GRADUATION_REQUIRED_CREDITS = 185
const REQUIRED_TARGET_CREDITS = 145
const ELECTIVE_TARGET_CREDITS = 40

// ── 行映射（snake_case → camelCase） ────────────────────────────
type UserRow = {
  id: string
  username: string
  role: User['role']
  name: string
  avatar: string | null
  major: string | null
  class_name: string | null
  enrollment_grade: string | null
}
function mapUser(row: UserRow): User {
  return {
    id: row.id,
    username: row.username,
    role: row.role,
    name: row.name,
    avatar: row.avatar ?? undefined,
    major: row.major ?? undefined,
    className: row.class_name ?? undefined,
    enrollmentGrade: row.enrollment_grade ?? undefined,
  }
}

type BasicProfileRow = {
  user_id: string
  name: string | null
  gender: string | null
  grade: string | null
  hometown: string | null
  email: string | null
  experiences: string | null
  strengths: string | null
}
function mapBasicProfile(row: BasicProfileRow): StudentBasicProfile {
  return {
    userId: row.user_id,
    name: row.name ?? '',
    gender: (row.gender ?? '保密') as StudentBasicProfile['gender'],
    grade: row.grade ?? '',
    hometown: row.hometown ?? '',
    email: row.email ?? '',
    experiences: row.experiences ?? '',
    strengths: row.strengths ?? '',
  }
}

type StudentProfileRow = {
  user_id: string
  nickname: string | null
  bio: string | null
  interests: string[]
  skills: string[]
  projects: StudentProfile['projects']
}
function mapStudentProfile(row: StudentProfileRow): StudentProfile {
  return {
    userId: row.user_id,
    nickname: row.nickname ?? '',
    bio: row.bio ?? '',
    interests: row.interests ?? [],
    skills: row.skills ?? [],
    projects: row.projects ?? [],
  }
}

type CourseRow = {
  id: string
  name: string
  credit: number
  module_id: number | null
  module: Course['module'] | null
  year: Course['year'] | null
  academic_year: string | null
  semester: Course['semester'] | null
  course_attribute: Course['courseAttribute'] | null
  credit_requirement: Course['creditRequirement'] | null
  category: string | null
  suggested_semester: string | null
  is_core: boolean | null
  status: Course['status'] | null
}
function mapCourse(row: CourseRow): Course {
  return {
    id: row.id,
    name: row.name,
    credit: row.credit,
    moduleId: row.module_id ?? 0,
    module: row.module ?? '专业教育模块',
    year: row.year ?? 1,
    academicYear: row.academic_year ?? '2025-2026学年',
    semester: row.semester ?? '第二学期',
    courseAttribute: row.course_attribute ?? '专业课',
    creditRequirement: row.credit_requirement ?? '必修',
    category: row.category ?? '专业课',
    suggestedSemester: row.suggested_semester ?? '按培养方案修读',
    isCore: row.is_core ?? false,
    status: row.status ?? 'notStarted',
  }
}

type StudentCourseRow = {
  student_id: string
  course_id: string
  status: StudentCourse['status'] | null
  regular_score: number | null
  final_score: number | null
  total_score: number | null
  gpa: number | null
  exam_status: ExamStatus | null
  remediation_status: RemediationStatus | null
}
function mapStudentCourse(row: StudentCourseRow): StudentCourse {
  return {
    studentId: row.student_id,
    courseId: row.course_id,
    status: row.status ?? 'notStarted',
    regularScore: row.regular_score ?? undefined,
    finalScore: row.final_score ?? undefined,
    totalScore: row.total_score ?? undefined,
    gpa: row.gpa ?? undefined,
    examStatus: row.exam_status ?? undefined,
    remediationStatus: row.remediation_status ?? undefined,
  }
}

// ── 鉴权（Supabase Auth：邮箱+密码，密码哈希存于 auth.users） ──
export async function getUserByAuthId(authId: string): Promise<User | null> {
  const { data, error } = await supabase.from('users').select('*').eq('id', authId).maybeSingle()
  if (error || !data) return null
  return mapUser(data as UserRow)
}

export async function login(username: string, password: string): Promise<User | null> {
  const email = usernameToEmail(username)
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error || !data.user) return null
  return getUserByAuthId(data.user.id)
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut()
}

// 修改当前登录用户密码（Supabase Auth 哈希存储）
export async function changePassword(newPassword: string): Promise<{ error: string | null }> {
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  return { error: error?.message ?? null }
}

// ── 读 ────────────────────────────────────────────────────────
export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase.from('users').select('*')
  if (error) return []
  return (data as UserRow[]).map(mapUser)
}

export async function getBasicProfiles(): Promise<StudentBasicProfile[]> {
  const { data, error } = await supabase.from('basic_profiles').select('*')
  if (error) return []
  return (data as BasicProfileRow[]).map(mapBasicProfile)
}

export async function getBasicProfileByUserId(userId: string): Promise<StudentBasicProfile | undefined> {
  const { data, error } = await supabase
    .from('basic_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error || !data) return undefined
  return mapBasicProfile(data as BasicProfileRow)
}

export async function getProfiles(): Promise<StudentProfile[]> {
  const { data, error } = await supabase.from('student_profiles').select('*')
  if (error) return []
  return (data as StudentProfileRow[]).map(mapStudentProfile)
}

export async function getProfileByUserId(userId: string): Promise<StudentProfile | undefined> {
  const { data, error } = await supabase
    .from('student_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error || !data) return undefined
  return mapStudentProfile(data as StudentProfileRow)
}

export async function getCourses(): Promise<Course[]> {
  const { data, error } = await supabase.from('courses').select('*')
  if (error) return []
  return (data as CourseRow[]).map(mapCourse)
}

export async function getStudentCourses(): Promise<StudentCourse[]> {
  const { data, error } = await supabase.from('student_courses').select('*')
  if (error) return []
  return (data as StudentCourseRow[]).map(mapStudentCourse)
}

export async function getStudentCoursesByStudentId(studentId: string): Promise<StudentCourse[]> {
  const { data, error } = await supabase
    .from('student_courses')
    .select('*')
    .eq('student_id', studentId)
  if (error) return []
  return (data as StudentCourseRow[]).map(mapStudentCourse)
}

// ── 写 ────────────────────────────────────────────────────────
export async function upsertBasicProfile(profile: StudentBasicProfile): Promise<void> {
  const row = {
    user_id: profile.userId,
    name: profile.name,
    gender: profile.gender,
    grade: profile.grade,
    hometown: profile.hometown,
    email: profile.email,
    experiences: profile.experiences,
    strengths: profile.strengths,
  }
  const { error } = await supabase.from('basic_profiles').upsert(row)
  if (error) console.error('upsertBasicProfile 失败:', error.message)
}

// ── 纯计算 ────────────────────────────────────────────────────
export function scoreToGPA(score: number | undefined, scale: GPAScale = 'four'): number {
  if (score === undefined) return 0
  if (scale === 'hundred') return Math.round(score * 100) / 100
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

export function getCurrentSemesterKey(): string {
  return `${CURRENT_ACADEMIC_YEAR}-${CURRENT_SEMESTER}`
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

// 单门课程的绩点：优先用成绩单里的官方绩点（4.0 制），否则用总成绩按通用映射推导
function gpaPoint(record: CourseGradeRecord, scale: GPAScale): number {
  if (scale === 'four' && record.gpa !== undefined) return record.gpa
  return scoreToGPA(record.totalScore, scale)
}

function weightedGPA(records: CourseGradeRecord[], scale: GPAScale = 'four'): number {
  const eligible = records.filter(record => record.status === 'completed' && record.totalScore !== undefined && record.examStatus !== '缓考')
  const totalCredits = eligible.reduce((sum, record) => sum + record.credit, 0)
  if (totalCredits === 0) return 0
  const weighted = eligible.reduce((sum, record) => sum + gpaPoint(record, scale) * record.credit, 0)
  return round2(weighted / totalCredits)
}

function isPassedGrade(record: CourseGradeRecord): boolean {
  return record.status === 'completed' && record.examStatus === '通过' && record.totalScore !== undefined && record.totalScore >= 60
}

// ── 成绩记录与绩点 ────────────────────────────────────────────
export async function getCourseGradeRecords(studentId: string): Promise<CourseGradeRecord[]> {
  const [courses, studentCourses] = await Promise.all([
    getCourses(),
    getStudentCoursesByStudentId(studentId),
  ])

  const records: CourseGradeRecord[] = []
  studentCourses.forEach(studentCourse => {
    const course = courses.find(item => item.id === studentCourse.courseId)
    if (!course) return

    const totalScore = studentCourse.totalScore
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
      gpa: studentCourse.gpa,
      examStatus,
      remediationStatus,
      status: studentCourse.status,
    })
  })

  return records.sort((a, b) =>
    a.academicYear.localeCompare(b.academicYear) ||
    a.semester.localeCompare(b.semester) ||
    a.courseId.localeCompare(b.courseId)
  )
}

export async function calculateGPA(studentId: string, scale: GPAScale = 'four'): Promise<GPASummary> {
  const records = await getCourseGradeRecords(studentId)
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
    totalCredits: yearlyData[year].records.filter(isPassedGrade).reduce((sum, record) => sum + record.credit, 0),
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
  const passedCredits = records.filter(isPassedGrade).reduce((sum, record) => sum + record.credit, 0)

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

export async function getCreditAnalysis(studentId: string): Promise<CreditAnalysis> {
  const records = await getCourseGradeRecords(studentId)
  const passedRecords = records.filter(isPassedGrade)
  const completedCredits = passedRecords.reduce((sum, record) => sum + record.credit, 0)
  const requiredCredits = passedRecords.filter(record => record.creditRequirement === '必修').reduce((sum, record) => sum + record.credit, 0)
  const electiveCredits = passedRecords.filter(record => record.creditRequirement === '选修').reduce((sum, record) => sum + record.credit, 0)

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

// ── 学期绩点与排名 ────────────────────────────────────────────
export async function getStudentSemesterGPAs(studentId: string): Promise<SemesterGPA[]> {
  const records = (await getCourseGradeRecords(studentId)).filter(record => record.status === 'completed')
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
        : round2(eligible.reduce((sum, record) => sum + gpaPoint(record, 'four') * record.credit, 0) / totalCredits)
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

export async function getAllSemesters(): Promise<{ key: string; academicYear: string; semester: string }[]> {
  const users = await getUsers()
  const map = new Map<string, { key: string; academicYear: string; semester: string }>()
  for (const student of users.filter(u => u.role === 'student')) {
    const list = await getStudentSemesterGPAs(student.id)
    list.forEach(sgpa => {
      if (!map.has(sgpa.key)) map.set(sgpa.key, { key: sgpa.key, academicYear: sgpa.academicYear, semester: sgpa.semester })
    })
  }
  return Array.from(map.values()).sort((a, b) => a.key.localeCompare(b.key))
}

export async function getSemesterRanking(semesterKey: string): Promise<RankingLeaderboardEntry[]> {
  const users = await getUsers()
  const students = users.filter(u => u.role === 'student')
  const date = new Date().toISOString().split('T')[0]

  const entries: RankingLeaderboardEntry[] = []
  for (const student of students) {
    const sgpa = (await getStudentSemesterGPAs(student.id)).find(item => item.key === semesterKey)
    entries.push({ studentId: student.id, studentName: student.name, gpa: sgpa?.gpa ?? 0, date })
  }
  return entries.sort((a, b) => b.gpa - a.gpa || a.studentName.localeCompare(b.studentName))
}

export async function getRankingLeaderboard(studentId: string, semesterKey?: string): Promise<RankingLeaderboard> {
  const key = semesterKey ?? getCurrentSemesterKey()
  const entries = await getSemesterRanking(key)

  const myIndex = entries.findIndex(entry => entry.studentId === studentId)
  const myRank = myIndex >= 0 ? myIndex + 1 : 0
  const myGPA = myIndex >= 0 ? entries[myIndex].gpa : 0
  const total = entries.length

  const validGPAs = entries.map(entry => entry.gpa).filter(gpa => gpa > 0)
  const highestGPA = validGPAs.length ? Math.max(...validGPAs) : 0
  const lowestGPA = validGPAs.length ? Math.min(...validGPAs) : 0
  const averageGPA = validGPAs.length ? round2(validGPAs.reduce((sum, gpa) => sum + gpa, 0) / validGPAs.length) : 0

  const percentAbove = total > 1 && myRank > 0
    ? Math.round(((total - myRank) / (total - 1)) * 100)
    : myRank === 1 && total > 0 ? 100 : 0

  return { entries, myRank, myGPA, total, highestGPA, lowestGPA, averageGPA, percentAbove }
}

export async function getClassStats(): Promise<ClassStats> {
  const users = await getUsers()
  const students = users.filter(u => u.role === 'student')
  const totalStudents = students.length
  let totalGPA = 0
  for (const student of students) {
    totalGPA += (await calculateGPA(student.id, 'four')).cumulativeGPA
  }
  const averageGPA = totalStudents > 0 ? round2(totalGPA / totalStudents) : 0
  return { totalStudents, averageGPA, completionRate: 0, passRate: 0 }
}
