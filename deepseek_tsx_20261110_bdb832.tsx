'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(fd.get('email') as string, {
      redirectTo: `${window.location.origin}/auth/confirm?type=recovery`,
    })
    setMsg(error ? error.message : 'Check your email for the reset link.')
    setLoading(false)
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <h1 className="text-2xl font-bold text-center mb-6">Reset Password</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="email" type="email" required placeholder="Your email" className="w-full border rounded-lg px-3 py-2" />
          <button disabled={loading} className="w-full py-3 rounded-full gradient-btn text-white font-bold">Send Reset Link</button>
        </form>
        {msg && <p className="mt-4 text-sm text-center text-gray-700">{msg}</p>}
      </div>
    </div>
  )
}