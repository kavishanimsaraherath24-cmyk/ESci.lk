'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ResourceUpload() {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const router = useRouter()

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setMsg(null)
    const fd = new FormData(e.currentTarget)
    const file = fd.get('file') as File
    const grade = Number(fd.get('grade'))
    const title = fd.get('title') as string
    if (!file) { setMsg('File required'); setLoading(false); return }

    const supabase = createClient()
    const key = `grade-${grade}/${Date.now()}-${file.name}`
    const { error: upErr } = await supabase.storage.from('learning-resources').upload(key, file, { contentType: file.type })
    if (upErr) { setMsg(upErr.message); setLoading(false); return }

    const { error } = await supabase.from('learning_resources').insert({ title, grade, file_path: key, is_active: true })
    setLoading(false)
    if (error) setMsg(error.message)
    else { (e.target as HTMLFormElement).reset(); router.refresh() }
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl shadow p-5 space-y-3">
      <input name="title" required placeholder="Title" className="w-full border rounded-lg px-3 py-2" />
      <select name="grade" className="w-full border rounded-lg px-3 py-2">
        {[6,7,8,9,10,11].map(g => <option key={g} value={g}>Grade {g}</option>)}
      </select>
      <input name="file" type="file" accept="application/pdf" required />
      <button disabled={loading} className="w-full py-2 rounded-full gradient-btn text-white font-bold">
        {loading ? 'Uploading...' : 'Upload Resource'}
      </button>
      {msg && <div className="text-red-600 text-sm">{msg}</div>}
    </form>
  )
}