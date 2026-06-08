'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import TeacherDashboard from '@/components/dashboard/teacher-dashboard'

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user?.role === 'student') {
      router.replace('/dashboard/profile')
    }
  }, [user, router])

  if (!user) return null

  if (user.role === 'teacher') {
    return <TeacherDashboard />
  }

  return null
}
