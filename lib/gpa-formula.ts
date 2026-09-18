// 中国传媒大学（北京大学算法）单门绩点
// 公式：单门 GPA = 4 − 3(100−X)²/1600（60≤X≤100），X<60 记 0，X=100 记 4.00，保留两位小数
// 供成绩导入脚本（scripts/）与前端绩点计算（lib/store.ts）共用，保证口径一致
export function scoreToFourPointGPA(score: number | undefined): number {
  if (score === undefined) return 0
  if (score >= 100) return 4
  if (score < 60) return 0
  const gpa = 4 - (3 * Math.pow(100 - score, 2)) / 1600
  return Math.round(gpa * 100) / 100
}
