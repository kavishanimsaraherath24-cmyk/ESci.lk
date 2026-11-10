import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ResourcesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in')

  const { data: profile } = await supabase.from('profiles').select('status').eq('id', user.id).single()
  const { data: student } = await supabase.from('students').select('current_grade').eq('id', user.id).single()

  if (profile?.status !== 'active') {
    return <div className="bg-yellow-50 border border-yellow-300 rounded-2xl p-6 text-yellow-800">
      Resources will unlock after your registration is approved.
    </div>
  }

  const { data: resources } = await supabase.from('learning_resources')
    .select('*').eq('is_active', true).eq('grade', student?.current_grade ?? 0)

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Notes & Resources — Grade {student?.current_grade}</h1>
      {(!resources || resources.length === 0) ? (
        <p className="text-gray-500 text-sm">No resources uploaded for your grade yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {resources.map(r => (
            <div key={r.id} className="bg-white rounded-2xl p-5 shadow gradient-card-1 text-white">
              <div className="font-bold">{r.title}</div>
              <div className="text-xs mt-1 opacity-80">Grade {r.grade}</div>
              {/* Signed URL is generated via an API route; for simplicity link to /api/download/:id */}
              <a href={`/api/download/${r.id}`} className="inline-block mt-3 px-3 py-1 rounded-full bg-white/20 text-sm">
                Download PDF
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}