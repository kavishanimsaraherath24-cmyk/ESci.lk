import { createClient } from '@/lib/supabase/server'
import ClassForm from './ClassForm'

export default async function AdminClassesPage() {
  const supabase = await createClient()
  const { data: classes } = await supabase.from('classes').select('*').order('grade')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Manage Classes</h1>
      <ClassForm />
      <div className="bg-white rounded-2xl shadow p-4 space-y-2">
        {(classes ?? []).map(c => (
          <div key={c.id} className="border-b last:border-0 py-2 flex justify-between text-sm">
            <div>
              <b>{c.name}</b> (Grade {c.grade}) — {c.is_active ? '✅ Active' : '⛔ Inactive'}
              <div className="text-xs text-gray-500">{c.schedule}</div>
            </div>
            <div className="flex gap-2">
              <a href={`/api/admin/delete-class?id=${c.id}`}
                 onClick={(e) => { if (!confirm('Delete class?')) e.preventDefault() }}
                 className="text-xs px-2 py-1 rounded bg-red-600 text-white">Delete</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}