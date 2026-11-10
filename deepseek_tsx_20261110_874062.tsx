'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, Link } from '@/i18n/navigation'

export default function SignInPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true); setError(null)
    const fd = new FormData(e.currentTarget)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: fd.get('email') as string,
      password: fd.get('password') as string,
    })
    if (error) { setError(error.message); setLoading(false); return }

    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single()
    router.push(profile?.role === 'admin' ? '/admin' : '/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <h1 className="text-2xl font-bold text-center mb-2">Sign In</h1>
        <p className="text-center text-sm text-gray-500 mb-6 sinhala">ESci.lk — මොළේට දැනෙන්න Science</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="email" type="email" placeholder="Email" required className="w-full border rounded-lg px-3 py-2" />
          <input name="password" type="password" placeholder="Password" required className="w-full border rounded-lg px-3 py-2" />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button disabled={loading} className="w-full py-3 rounded-full gradient-btn text-white font-bold">
            {loading ? '...' : 'Sign In'}
          </button>
        </form>
        <div className="flex justify-between mt-4 text-sm">
          <Link href="/auth/forgot-password" className="text-blue-600">Forgot password?</Link>
          <Link href="/auth/register" className="text-purple-600">Register</Link>
        </div>
      </div>
    </div>
  )
}