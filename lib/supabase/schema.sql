-- ============================================================
-- AI 实验班学业管理系统 —— Supabase 数据库结构
-- 用法：npm run apply:schema（Management API）或 SQL Editor 粘贴执行
-- ============================================================

-- 清理旧表（可重复执行）
drop table if exists public.student_courses;
drop table if exists public.student_profiles;
drop table if exists public.basic_profiles;
drop table if exists public.courses;
drop table if exists public.users;

-- 用户（应用资料；id 关联 auth.users，登录鉴权走 Supabase Auth）
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  role text not null check (role in ('student', 'teacher')),
  name text not null,
  avatar text,
  major text,
  class_name text,
  enrollment_grade text
);

-- 学生基本资料（个人卡片 / 代表性经历）
create table public.basic_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  name text,
  gender text,
  grade text,
  hometown text,
  email text,
  experiences text,
  strengths text
);

-- 学生画像（项目经历等）
create table public.student_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  nickname text,
  bio text,
  interests jsonb not null default '[]',
  skills jsonb not null default '[]',
  projects jsonb not null default '[]'
);

-- 课程
create table public.courses (
  id text primary key,
  name text not null,
  credit numeric not null,
  module_id int,
  module text,
  year int,
  academic_year text,
  semester text,
  course_attribute text,
  credit_requirement text,
  category text,
  suggested_semester text,
  is_core boolean,
  status text
);

-- 学生课程成绩
create table public.student_courses (
  student_id uuid references public.users(id) on delete cascade,
  course_id text references public.courses(id) on delete cascade,
  status text,
  regular_score numeric,
  final_score numeric,
  total_score numeric,
  exam_status text,
  remediation_status text,
  primary key (student_id, course_id)
);

-- ============================================================
-- 行级安全（RLS）：必须登录（authenticated）才能读写
-- ============================================================
alter table public.users enable row level security;
alter table public.basic_profiles enable row level security;
alter table public.student_profiles enable row level security;
alter table public.courses enable row level security;
alter table public.student_courses enable row level security;

-- 读取：允许所有已登录用户读取（学生/教师跨用户查看同学、排名等）
create policy "authenticated read users" on public.users for select using (auth.role() = 'authenticated');
create policy "authenticated read basic_profiles" on public.basic_profiles for select using (auth.role() = 'authenticated');
create policy "authenticated read student_profiles" on public.student_profiles for select using (auth.role() = 'authenticated');
create policy "authenticated read courses" on public.courses for select using (auth.role() = 'authenticated');
create policy "authenticated read student_courses" on public.student_courses for select using (auth.role() = 'authenticated');

-- 写入：仅本人可写基本资料
create policy "own write basic_profiles" on public.basic_profiles for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
