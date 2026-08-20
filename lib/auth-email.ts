// 用户名 → 登录邮箱（Supabase Auth 使用邮箱+密码登录，这里用固定域名从用户名派生邮箱）
// 该文件同时被浏览器端 store.ts 和 node 端 seed 脚本引用，不要引入任何环境依赖或 'use client'。
const AUTH_EMAIL_DOMAIN = '@example.com'

export function usernameToEmail(username: string): string {
  return `${username.trim()}${AUTH_EMAIL_DOMAIN}`
}
