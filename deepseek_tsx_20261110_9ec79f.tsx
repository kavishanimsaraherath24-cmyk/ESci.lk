import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function MyClassesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in')

  const { data: profile } = await supabase.from('profiles').select('status').eq('id', user.id).single()
  const isActive = profile?.status === 'active'

  const { data: links } = await supabase
    .from('student_classes')
    .select('class_id, classes(*)')
    .eq('student_id', user.id)

  if (!links || links.length === 0) {
    return <div className="bg-white rounded-2xl p-8 text-center shadow">No classes assigned yet. Contact the teacher.</div>
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">My Classes</h1>
      {links.map((l: any) => (
        <div key={l.class_id} className="bg-white rounded-2xl p-6 shadow">
          <h2 className="font-bold text-lg">{l.classes.name}</h2>
          <p className="text-sm text-gray-600 mt-1">📅 {l.classes.schedule}</p>
          <p className="text-sm text-gray-600 mt-1">{l.classes.description}</p>
          {isActive && l.classes.class_link ? (
            <a href={l.classes.class_link} target="_blank" rel="noopener noreferrer"
              className="inline-block mt-3 px-4 py-2 rounded-full gradient-btn text-white text-sm font-semibold">
              Join Live Class
            </a>
          ) : (
            <p className="mt-3 text-sm text-red-600">Class link available only after account is activated.</p>
          )}
        </div>
      ))}
    </div>
  )
}