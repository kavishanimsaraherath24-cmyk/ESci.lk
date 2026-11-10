'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/i18n/navigation'

export default function ResetPasswordPage() {
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    if (fd.get('password') !== fd.get('confirm')) {
      setMsg('Passwords do not match'); setLoading(false); return
    }
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: fd.get('password') as string })
    if (error) setMsg(error.message)
    else { setMsg('Password updated!'); router.push('/dashboard') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <h1 className="text-2xl font-bold text-center mb-6">Set New Password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="password" type="password" required minLength={8} placeholder="New password" className="w-full border rounded-lg px-3 py-2" />
          <input name="confirm" type="password" required minLength={8} placeholder="Confirm password" className="w-full border rounded-lg px-3 py-2" />
          <button disabled={loading} className="w-full py-3 rounded-full gradient-btn text-white font-bold">Update</button>
        </form>
        {msg && <p className="mt-4 text-sm text-center">{msg}</p>}
      </div>
    </div>
  )
}