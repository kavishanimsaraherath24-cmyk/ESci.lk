'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AnnouncementForm() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true)
    const fd = new FormData(e.currentTarget)
    const supabase = createClient()
    await supabase.from('announcements').insert({
      title: fd.get('title'),
      body: fd.get('body'),
      audience: fd.get('audience') as string,
      is_published: true,
      published_at: new Date().toISOString(),
    })
    setLoading(false)
    ;(e.target as HTMLFormElement).reset()
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl shadow p-5 space-y-3">
      <input name="title" required placeholder="Title" className="w-full border rounded-lg px-3 py-2" />
      <textarea name="body" required placeholder="Body" rows={3} className="w-full border rounded-lg px-3 py-2" />
      <select name="audience" className="w-full border rounded-lg px-3 py-2">
        <option value="all">Everyone (public)</option>
        <option value="students">Students only</option>
      </select>
      <button disabled={loading} className="w-full py-2 rounded-full gradient-btn text-white font-bold">
        {loading ? 'Publishing...' : 'Publish Announcement'}
      </button>
    </form>
  )
}