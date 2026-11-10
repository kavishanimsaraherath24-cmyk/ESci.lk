'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function ClassForm() {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const router = useRouter()

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setMsg(null)
    const fd = new FormData(e.currentTarget)
    const supabase = createClient()
    const { error } = await supabase.from('classes').insert({
      name: fd.get('name'),
      grade: Number(fd.get('grade')),
      description: fd.get('description'),
      schedule: fd.get('schedule'),
      monthly_fee: Number(fd.get('monthly_fee') || 0),
      class_link: fd.get('class_link'),
      is_active: true,
    })
    setLoading(false)
    if (error) setMsg(error.message)
    else { (e.target as HTMLFormElement).reset(); router.refresh() }
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl shadow p-5 grid md:grid-cols-2 gap-3">
      <input name="name" placeholder="Class name" required className="border rounded-lg px-3 py-2" />
      <select name="grade" className="border rounded-lg px-3 py-2">
        {[6,7,8,9,10,11].map(g => <option key={g} value={g}>Grade {g}</option>)}
      </select>
      <input name="schedule" placeholder="e.g. Saturday 8–10 AM" className="border rounded-lg px-3 py-2" />
      <input name="monthly_fee" type="number" placeholder="Monthly fee LKR" className="border rounded-lg px-3 py-2" />
      <input name="class_link" placeholder="Google Meet / Zoom URL" className="border rounded-lg px-3 py-2 md:col-span-2" />
      <input name="description" placeholder="Description" className="border rounded-lg px-3 py-2 md:col-span-2" />
      <button disabled={loading} className="md:col-span-2 py-2 rounded-full gradient-btn text-white font-bold">
        {loading ? 'Saving...' : 'Add Class'}
      </button>
      {msg && <div className="md:col-span-2 text-red-600 text-sm">{msg}</div>}
    </form>
  )
}