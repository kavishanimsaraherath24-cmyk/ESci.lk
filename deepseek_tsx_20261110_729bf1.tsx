'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ContactForm() {
  const [msg, setMsg] = useState<string | null>(null)
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const supabase = createClient()
    const { error } = await supabase.from('contact_messages').insert({
      name: fd.get('name'), phone: fd.get('phone'),
      subject: fd.get('subject'), message: fd.get('message'),
    })
    setMsg(error ? error.message : 'Message sent!')
    if (!error) (e.target as HTMLFormElement).reset()
  }
  return (
    <form onSubmit={submit} className="bg-white rounded-2xl shadow p-6 space-y-3 max-w-lg mx-auto">
      <input name="name" required placeholder="Your name" className="w-full border rounded-lg px-3 py-2" />
      <input name="phone" required placeholder="Phone" className="w-full border rounded-lg px-3 py-2" />
      <input name="subject" placeholder="Subject" className="w-full border rounded-lg px-3 py-2" />
      <textarea name="message" required rows={4} placeholder="Message" className="w-full border rounded-lg px-3 py-2" />
      <button className="w-full py-2 rounded-full gradient-btn text-white font-bold">Send</button>
      {msg && <div className="text-sm text-gray-700 text-center">{msg}</div>}
    </form>
  )
}