import { createClient } from '@/lib/supabase/server'
import AnnouncementForm from './AnnouncementForm'

export default async function AdminAnnouncements() {
  const supabase = await createClient()
  const { data: announcements } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Announcements</h1>
      <AnnouncementForm />
      <div className="space-y-2">
        {(announcements ?? []).map(a => (
          <div key={a.id} className="bg-white rounded-xl p-4 shadow flex justify-between">
            <div>
              <b>{a.title}</b>
              <div className="text-xs text-gray-500">{a.is_published ? 'Published' : 'Draft'}</div>
              <p className="text-sm text-gray-700 mt-1">{a.body}</p>
            </div>
            <div className="flex gap-2">
              <a href={`/api/admin/toggle-announcement?id=${a.id}`} className="text-xs px-2 py-1 rounded bg-blue-500 text-white">Toggle Publish</a>
              <a href={`/api/admin/delete-announcement?id=${a.id}`} className="text-xs px-2 py-1 rounded bg-red-600 text-white">Delete</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}