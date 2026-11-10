import { createClient } from '@/lib/supabase/server'

export default async function AdminMessages() {
  const supabase = await createClient()
  const { data: messages } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Contact Messages</h1>
      {(messages ?? []).length === 0 && <p className="text-gray-500">No messages.</p>}
      {(messages ?? []).map(m => (
        <div key={m.id} className="bg-white rounded-xl p-4 shadow">
          <div className="flex justify-between">
            <b>{m.name}</b>
            <span className="text-xs text-gray-500">{new Date(m.created_at).toLocaleString()}</span>
          </div>
          <div className="text-sm text-gray-600">📞 {m.phone}</div>
          {m.subject && <div className="text-sm text-gray-700 mt-1"><b>Subject:</b> {m.subject}</div>}
          <p className="text-sm mt-2">{m.message}</p>
        </div>
      ))}
    </div>
  )
}