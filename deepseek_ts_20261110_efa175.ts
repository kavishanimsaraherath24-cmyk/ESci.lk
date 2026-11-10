import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })
  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (me?.role !== 'admin') return new NextResponse('Forbidden', { status: 403 })

  const { data } = await supabase.from('students')
    .select('student_code, current_grade, school_name, parent_name, parent_phone, profiles(full_name, email, status)')

  const header = ['code', 'name', 'email', 'grade', 'school', 'parent', 'parent_phone', 'status']
  const rows = (data ?? []).map((s: any) => [
    s.student_code, s.profiles?.full_name, s.profiles?.email,
    s.current_grade, s.school_name, s.parent_name, s.parent_phone, s.profiles?.status,
  ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','))

  const csv = [header.join(','), ...rows].join('\n')
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="students.csv"',
    },
  })
}