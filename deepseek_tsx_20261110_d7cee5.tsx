'use client'

import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

export default function SettingsForm({ settings }: { settings: any }) {
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setLoading(true); setMsg(null)
    const fd = new FormData(e.currentTarget)
    const supabase = createClient()
    const { error } = await supabase.from('site_settings').update({
      site_name: fd.get('site_name'),
      tagline: fd.get('tagline'),
      teacher_name: fd.get('teacher_name'),
      contact_phone: fd.get('contact_phone'),
      contact_email: fd.get('contact_email'),
      bank_name: fd.get('bank_name'),
      bank_account_name: fd.get('bank_account_name'),
      bank_account_number: fd.get('bank_account_number'),
      bank_branch: fd.get('bank_branch'),
      youtube_url: fd.get('youtube_url'),
      facebook_url: fd.get('facebook_url'),
      whatsapp_channel_url: fd.get('whatsapp_channel_url'),
      whatsapp_direct_url: fd.get('whatsapp_direct_url'),
      updated_at: new Date().toISOString(),
    }).eq('id', 1)
    setLoading(false)
    setMsg(error ? error.message : 'Saved!')
  }

  const fields: [string, string][] = [
    ['site_name', 'Site Name'],
    ['tagline', 'Tagline'],
    ['teacher_name', 'Teacher Name'],
    ['contact_phone', 'Contact Phone'],
    ['contact_email', 'Contact Email'],
    ['bank_name', 'Bank Name'],
    ['bank_account_name', 'Account Holder'],
    ['bank_account_number', 'Account Number'],
    ['bank_branch', 'Branch'],
    ['youtube_url', 'YouTube URL'],
    ['facebook_url', 'Facebook URL'],
    ['whatsapp_channel_url', 'WhatsApp Channel URL'],
    ['whatsapp_direct_url', 'WhatsApp Direct URL'],
  ]

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl shadow p-6 grid md:grid-cols-2 gap-3">
      {fields.map(([name, label]) => (
        <div key={name}>
          <label className="block text-sm font-medium mb-1">{label}</label>
          <input name={name} defaultValue={settings?.[name] ?? ''} className="w-full border rounded-lg px-3 py-2" />
        </div>
      ))}
      <button disabled={loading} className="md:col-span-2 py-2 rounded-full gradient-btn text-white font-bold">
        {loading ? 'Saving...' : 'Save Settings'}
      </button>
      {msg && <div className="md:col-span-2 text-sm text-green-600">{msg}</div>}
    </form>
  )
}