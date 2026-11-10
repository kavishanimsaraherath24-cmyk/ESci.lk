import { createClient } from '@/lib/supabase/server'
import ResourceUpload from './ResourceUpload'

export default async function AdminResources() {
  const supabase = await createClient()
  const { data: resources } = await supabase.from('learning_resources').select('*').order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Learning Resources</h1>
      <ResourceUpload />
      <div className="bg-white rounded-2xl shadow p-4 space-y-2">
        {(resources ?? []).map(r => (
          <div key={r.id} className="border-b last:border-0 py-2 flex justify-between text-sm">
            <div>
              <b>{r.title}</b> — Grade {r.grade}
              <div className="text-xs text-gray-500">{r.file_path}</div>
            </div>
            <a href={`/api/admin/delete-resource?id=${r.id}`} className="text-xs px-2 py-1 rounded bg-red-600 text-white">Delete</a>
          </div>
        ))}
      </div>
    </div>
  )
}