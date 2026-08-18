-- ============================================================
-- AI 实验班学业管理系统 —— Supabase 数据库结构
-- 使用方法：Supabase Dashboard → SQL Editor → 新建查询 → 粘贴本文件全部内容 → Run
-- ============================================================

-- 用户（应用资料；登录鉴权后续接入 Supabase Auth）
create table if not exists public.users (
  id text primary key,
  username text unique not null,
  role text not null check (role in ('student', 'teacher')),
  name text not null,
  avatar text,
  major text,
  class_name text,
  enrollment_grade text
);

-- 学生基本资料（个人卡片 / 代表性经历）
create table if not exists public.basic_profiles (
  user_id text primary key references public.users(id) on delete cascade,
  name text,
  gender text,
  grade text,
  hometown text,
  email text,
  experiences text,
  strengths text
);

-- 学生画像（项目经历等）
create table if not exists public.student_profiles (
  user_id text primary key references public.users(id) on delete cascade,
  nickname text,
  bio text,
  interests jsonb not null default '[]',
  skills jsonb not null default '[]',
  projects jsonb not null default '[]'
);

-- 课程
create table if not exists public.courses (
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
create table if not exists public.student_courses (
  student_id text references public.users(id) on delete cascade,
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
-- 开启行级安全（RLS）
-- ============================================================
alter table public.users enable row level security;
alter table public.basic_profiles enable row level security;
alter table public.student_profiles enable row level security;
alter table public.courses enable row level security;
alter table public.student_courses enable row level security;

-- 演示阶段：允许所有登录用户读全部数据（后续可按 auth.uid() 收紧到本人/教师）
create policy "read all users" on public.users for select using (true);
create policy "read all basic_profiles" on public.basic_profiles for select using (true);
create policy "read all student_profiles" on public.student_profiles for select using (true);
create policy "read all courses" on public.courses for select using (true);
create policy "read all student_courses" on public.student_courses for select using (true);

-- 写入：演示阶段开放（后续收紧）
create policy "write basic_profiles" on public.basic_profiles for all using (true) with check (true);
