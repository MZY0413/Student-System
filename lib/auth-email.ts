// 账号 → 登录邮箱（Supabase Auth 用邮箱+密码登录，这里用固定域名从账号派生内部邮箱）
// 该文件同时被浏览器端 store.ts 和 node 端 seed 脚本引用，不要引入任何环境依赖或 'use client'。
export const AUTH_EMAIL_DOMAIN = '@example.com'

export function usernameToEmail(username: string): string {
  return `${username.trim()}${AUTH_EMAIL_DOMAIN}`
}

// 初始密码 = 账号后六位（学号 / 工号均为纯数字）
export function initialPassword(account: string): string {
  return account.trim().slice(-6)
}

// 密码校验：6 位纯数字
export function isValidPassword(password: string): boolean {
  return /^\d{6}$/.test(password)
}
