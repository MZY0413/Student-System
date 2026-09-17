import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(url!, serviceKey!, { auth: { persistSession: false } })

async function main() {
  const teachers = await supabase.from('users').select('id, username, name, role').eq('role', 'teacher')
  console.log('=== TEACHERS ===')
  console.log(JSON.stringify(teachers.data, null, 2))

  const courseCount = await supabase.from('courses').select('*', { count: 'exact', head: true })
  console.log('\n=== COURSE COUNT ===', courseCount.count)

  const secondSem = await supabase.from('courses').select('id, name, credit, course_attribute, academic_year, semester').eq('semester', '第二学期')
  console.log('\n=== SECOND SEMESTER COURSES ===', secondSem.data?.length)
  console.log(JSON.stringify(secondSem.data, null, 2))

  const semAvg = await supabase.from('semester_averages').select('academic_year, semester').limit(5)
  console.log('\n=== SEMESTER AVERAGES (sample) ===')
  console.log(JSON.stringify(semAvg.data, null, 2))

  const semAvgCount = await supabase.from('semester_averages').select('*', { count: 'exact', head: true })
  console.log('\n=== SEMESTER AVERAGES COUNT ===', semAvgCount.count)

  const scCount = await supabase.from('student_courses').select('*', { count: 'exact', head: true })
  console.log('\n=== STUDENT COURSES COUNT ===', scCount.count)
}

main()
