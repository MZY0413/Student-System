'use client'

import { use } from 'react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import StudentDashboard from '@/components/dashboard/student-dashboard'

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user && user.role !== 'teacher') {
      router.replace('/dashboard/profile')
    }
  }, [isLoading, user, router])

  if (isLoading || !user) return null
  if (user.role !== 'teacher') return null
  return <StudentDashboard studentId={id} />
}
