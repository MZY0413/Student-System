// 用户角色
export type UserRole = 'student' | 'teacher'

// 用户信息
export interface User {
  id: string
  username: string
  password: string
  role: UserRole
  name: string
  avatar?: string
  major?: string
  className?: string
  enrollmentGrade?: string
}

// 学生画像
export interface StudentProfile {
  userId: string
  nickname: string
  bio: string
  interests: string[]
  skills: string[]
  projects: ProjectExperience[]
}

// 学生个人基本资料（学生端）
export type Gender = '男' | '女' | '保密'

export interface StudentBasicProfile {
  userId: string
  name: string
  gender: Gender
  grade: string
  hometown: string
  email: string
  experiences: string
  strengths: string
}

// 项目经历
export interface ProjectExperience {
  id: string
  name: string
  description: string
  role: string
  period: string
}

// 考核任务状态
export type TaskStatus = 'pending' | 'reviewing' | 'passed' | 'failed'

// 考核任务
export interface AssessmentTask {
  id: string
  studentId: string
  indicatorId?: string
  name: string
  course: string
  deadline: string
  status: TaskStatus
  score?: number
  submission?: string
  submittedAt?: string
  attachmentName?: string
  attachmentType?: string
  attachmentSize?: number
  attachmentDataUrl?: string
  reviewedAt?: string
  reviewedBy?: string
  reviewedByName?: string
}

export interface AssessmentIndicator {
  id: string
  name: string
  description: string
  deadline: string
}

export interface AssessmentIndicatorStats {
  indicatorId: string
  name: string
  passedCount: number
  totalStudents: number
}

export type CourseAttribute = '必修' | '选修' | '通识' | '专业课'
export type CreditRequirement = '必修' | '选修'
export type Semester = '第一学期' | '第二学期'
export type CourseStudyStatus = 'completed' | 'inProgress' | 'notStarted'
export type ExamStatus = '通过' | '不及格' | '缺考' | '缓考'
export type RemediationStatus = '无需' | '待补考' | '补考中' | '补考通过' | '待重修' | '重修中' | '缓考安排中'
export type GPAScale = 'four' | 'five' | 'hundred'
export type RankingScope = 'term' | 'year' | 'cumulative'
export type CurriculumModuleName =
  | '通识教育模块'
  | '学科基础模块'
  | '专业教育模块'
  | '实践教学模块'
  | '创新创业与素质拓展模块'
export type CurriculumCourseStatus = 'passed' | 'studying' | 'notStarted' | 'retaking'
export type CurriculumWarningType = 'requiredMissing' | 'creditInsufficient' | 'practiceIncomplete' | 'termMissing' | 'progressLagging'
export type CurriculumWarningLevel = 'red' | 'yellow'

// 课程
export interface Course {
  id: string
  name: string
  credit: number
  moduleId: number
  module: CurriculumModuleName
  year: 1 | 2 | 3 | 4
  academicYear: string
  semester: Semester
  courseAttribute: CourseAttribute
  creditRequirement: CreditRequirement
  category: string
  suggestedSemester: string
  isCore: boolean
  status: CourseStudyStatus
}

// 学生课程记录
export interface StudentCourse {
  studentId: string
  courseId: string
  status: CourseStudyStatus
  regularScore?: number
  finalScore?: number
  totalScore?: number
  examStatus?: ExamStatus
  remediationStatus?: RemediationStatus
}

// 学年绩点
export interface YearlyGPA {
  year: number
  academicYear?: string
  gpa: number
  totalCredits: number
}

export interface CourseGradeRecord {
  studentId: string
  courseId: string
  courseName: string
  courseAttribute: CourseAttribute
  creditRequirement: CreditRequirement
  credit: number
  year: 1 | 2 | 3 | 4
  module: CurriculumModuleName
  academicYear: string
  semester: Semester
  suggestedSemester: string
  isCore: boolean
  regularScore?: number
  finalScore?: number
  totalScore?: number
  examStatus: ExamStatus
  remediationStatus: RemediationStatus
  status: CourseStudyStatus
}

export interface GPASummary {
  yearlyGPAs: YearlyGPA[]
  totalGPA: number
  comprehensiveGPA: number
  currentTermGPA: number
  academicYearGPA: number
  cumulativeGPA: number
  totalCredits: number
}

export interface AcademicRankings {
  majorRank: number
  majorTotal: number
  classRank: number
  classTotal: number
  gradeRank: number
  gradeTotal: number
  scopeGPA: number
}

export interface RankingLeaderboardEntry {
  studentId: string
  studentName: string
  gpa: number
  date: string
}

export interface RankingLeaderboard {
  entries: RankingLeaderboardEntry[]
  myRank: number
  myGPA: number
  total: number
  highestGPA: number
  lowestGPA: number
  averageGPA: number
  percentAbove: number
}

export interface SemesterGPA {
  key: string
  academicYear: string
  semester: string
  gpa: number
  credits: number
  courseCount: number
}

export interface CreditAnalysis {
  completedCredits: number
  remainingGraduationCredits: number
  graduationRequiredCredits: number
  requiredCredits: number
  requiredTargetCredits: number
  requiredMet: boolean
  electiveCredits: number
  electiveTargetCredits: number
  electiveMet: boolean
}

export interface CurriculumModulePlan {
  name: CurriculumModuleName
  requiredCredits: number
  electiveCredits: number
}

export interface CurriculumCourseRecord {
  courseId: string
  courseName: string
  moduleId: number
  module: CurriculumModuleName
  courseAttribute: CreditRequirement
  credit: number
  suggestedSemester: string
  isCore: boolean
  status: CurriculumCourseStatus
  totalScore?: number
  examStatus?: ExamStatus
  remediationStatus?: RemediationStatus
}

export interface CurriculumCategoryProgress {
  courseAttribute: CreditRequirement
  requiredCredits: number
  completedCredits: number
  percent: number
  isInsufficient: boolean
}

export interface CurriculumModuleProgress {
  moduleId: number
  name: CurriculumModuleName
  requiredCredits: number
  completedCredits: number
  percent: number
  required: CurriculumCategoryProgress
  elective: CurriculumCategoryProgress
  courses: CurriculumCourseRecord[]
  statusCredits: Record<CurriculumCourseStatus, number>
}

export interface CurriculumWarning {
  id: string
  type: CurriculumWarningType
  level: CurriculumWarningLevel
  message: string
}

export interface CurriculumProgressOverview {
  major: string
  currentGrade: string
  expectedPercent: number
  totalRequiredCredits: number
  totalCompletedCredits: number
  totalPercent: number
  remainingRequiredCredits: number
  remainingElectiveCredits: number
  graduationStatus: '已达标' | '进度正常' | '存在风险'
  modules: CurriculumModuleProgress[]
  warnings: CurriculumWarning[]
}

// 课程树节点
export interface CourseTreeNode {
  id: string
  name: string
  type: 'year' | 'category' | 'course'
  children?: CourseTreeNode[]
  course?: Course
  status?: 'completed' | 'inProgress' | 'notStarted'
  progress?: number
}

// 学业建议
export interface AcademicAdvice {
  id: string
  type: 'success' | 'warning' | 'info'
  message: string
}

// 问题反馈
export type FeedbackCategory = 'academic' | 'life' | 'classAffairs' | 'system'
export type FeedbackStatus = 'pending' | 'replied' | 'resolved' | 'closed'
export type FeedbackType = 'question' | 'suggestion'
export type FeedbackActorRole = 'student' | 'teacher' | 'system'
export type ContentVisibility = 'public' | 'private' | 'friends'
export type InteractionContentType = 'question' | 'answer' | 'share' | 'topic' | 'discussion' | 'team' | 'team_message'

export interface FeedbackMessage {
  id: string
  feedbackId: string
  senderRole: FeedbackActorRole
  senderId: string
  content: string
  createdAt: string
}

export interface FeedbackAttachment {
  id: string
  feedbackId: string
  uploaderRole: 'student' | 'teacher'
  uploaderId: string
  fileName: string
  mimeType: string
  size: number
  dataUrl: string
  createdAt: string
}

export interface FeedbackStatusHistory {
  id: string
  feedbackId: string
  status: FeedbackStatus
  operatorRole: FeedbackActorRole
  operatorId: string
  operatorName: string
  note?: string
  createdAt: string
}

export interface Notification {
  id: string
  recipientId: string
  recipientRole: UserRole
  type:
    | 'feedback_created'
    | 'feedback_replied'
    | 'feedback_status_changed'
    | 'feedback_updated'
    | 'feedback_attachment_added'
    | 'interaction_answered'
    | 'interaction_liked'
    | 'interaction_commented'
    | 'interaction_team_requested'
    | 'interaction_team_approved'
    | 'help_post_answered'
    | 'help_mentioned'
  feedbackId?: string
  targetPath?: string
  title: string
  content: string
  createdAt: string
  isRead: boolean
}

export interface Feedback {
  id: string
  studentId: string
  studentName: string
  assigneeTeacherId: string
  assigneeTeacherName: string
  category: FeedbackCategory
  subject?: string
  type: FeedbackType
  title: string
  content: string
  createdAt: string
  status: FeedbackStatus
  lastReplyAt?: string
  lastReplyBy?: 'teacher' | 'student'
  statusUpdatedAt?: string
  latestStatusNote?: string
  unreadForStudent: boolean
  unreadForTeacher: boolean
  visibility?: ContentVisibility
  isPublicQuestion?: boolean
  acceptedAnswerId?: string
  publicReplyCount?: number
  likeCount?: number
}

export interface InteractionAttachment {
  id: string
  ownerId: string
  ownerType: InteractionContentType
  uploaderId: string
  fileName: string
  mimeType: string
  size: number
  dataUrl: string
  downloadCount: number
  createdAt: string
}

export interface HelpAttachment {
  id: string
  fileName: string
  mimeType: string
  size: number
  dataUrl: string
}

export interface HelpPost {
  id: string
  userId: string
  title: string
  content: string
  isAnonymous: boolean
  likeCount: number
  commentCount: number
  collectCount: number
  createdAt: string
  updatedAt: string
  attachments: HelpAttachment[]
  likedUserIds: string[]
}

export interface HelpComment {
  id: string
  postId: string
  userId: string
  content: string
  isOfficial: boolean
  likeCount: number
  createdAt: string
  likedUserIds: string[]
}

export interface HelpCollect {
  id: string
  userId: string
  postId: string
  createdAt: string
}

export interface InteractionAnswer {
  id: string
  feedbackId: string
  studentId: string
  studentName: string
  content: string
  likeUserIds: string[]
  isAccepted: boolean
  reports: number
  createdAt: string
}

export interface SharePost {
  id: string
  authorId: string
  authorName: string
  title: string
  subject: string
  content: string
  visibility: ContentVisibility
  likeUserIds: string[]
  favoriteUserIds: string[]
  commentCount: number
  downloadCount: number
  createdAt: string
}

export interface ClassTopic {
  id: string
  authorId: string
  authorName: string
  authorRole: UserRole
  title: string
  content: string
  visibility: ContentVisibility
  pinned: boolean
  likeUserIds: string[]
  commentCount: number
  createdAt: string
}

export interface InteractionComment {
  id: string
  targetType: 'share' | 'topic'
  targetId: string
  parentId?: string
  studentId: string
  studentName: string
  content: string
  mentions: string[]
  likeUserIds: string[]
  reports: number
  createdAt: string
}

export interface StudyTeam {
  id: string
  ownerId: string
  ownerName: string
  title: string
  purpose: string
  subject: string
  maxMembers: number
  visibility: ContentVisibility
  memberIds: string[]
  applicantIds: string[]
  status: 'open' | 'formed' | 'closed'
  createdAt: string
}

export interface TeamMessage {
  id: string
  teamId: string
  senderId: string
  senderName: string
  content: string
  createdAt: string
}

export interface StudentFavorite {
  id: string
  studentId: string
  targetType: 'question' | 'share'
  targetId: string
  createdAt: string
}

export interface InteractionReport {
  id: string
  reporterId: string
  reporterName: string
  targetType: InteractionContentType
  targetId: string
  reason: string
  status: 'pending' | 'resolved' | 'rejected'
  reviewerId?: string
  reviewerName?: string
  createdAt: string
  reviewedAt?: string
}

export interface InteractionMuteSetting {
  userId: string
  enabled: boolean
  startTime: string
  endTime: string
}

export interface StudentContribution {
  studentId: string
  studentName: string
  acceptedAnswers: number
  likes: number
  favorites: number
  contributionValue: number
}

// 班级学情统计
export interface ClassStats {
  totalStudents: number
  averageGPA: number
  completionRate: number
  passRate: number
}

// 待办事项
export interface TodoItem {
  id: string
  taskId: string
  taskName: string
  deadline: string
  course: string
  priority: 'high' | 'medium' | 'low'
}
