import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: student } = await supabase.from('students').select('*').eq('id', user.id).single()

  const rows: [string, any][] = [
    ['Student Code', student?.student_code],
    ['Full Name', profile?.full_name],
    ['Email', profile?.email],
    ['Grade', student?.current_grade],
    ['School', student?.school_name],
    ['Parent Name', student?.parent_name],
    ['Parent Phone', student?.parent_phone],
    ['District', student?.district],
    ['Village / City', student?.village_city],
    ['Status', profile?.status?.toUpperCase()],
  ]

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Profile</h1>
      <div className="bg-white rounded-2xl p-6 shadow divide-y">
        {rows.map(([k, v]) => (
          <div key={k} className="py-3 flex justify-between text-sm">
            <span className="text-gray-500">{k}</span>
            <span className="font-medium">{v ?? '—'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}