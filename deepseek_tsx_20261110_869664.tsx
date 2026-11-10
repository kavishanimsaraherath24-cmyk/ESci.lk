'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/i18n/navigation'

export default function RegisterForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const fd = new FormData(e.currentTarget)
    const password = fd.get('password') as string
    const confirm = fd.get('confirm_password') as string
    if (password !== confirm) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }
    if (!fd.get('guardian_consent')) {
      setError('Guardian consent required')
      setLoading(false)
      return
    }

    const supabase = createClient()
    const { data: auth, error: authError } = await supabase.auth.signUp({
      email: fd.get('email') as string,
      password,
      options: { data: { full_name: fd.get('full_name'), role: 'student' } },
    })

    if (authError) { setError(authError.message); setLoading(false); return }
    if (!auth.user) { setError('Signup failed'); setLoading(false); return }

    const { error: studentError } = await supabase.from('students').insert({
      id: auth.user.id,
      date_of_birth: (fd.get('date_of_birth') as string) || null,
      gender: (fd.get('gender') as string) || null,
      student_phone: fd.get('student_phone') as string,
      parent_name: fd.get('parent_name') as string,
      parent_phone: fd.get('parent_phone') as string,
      whatsapp: (fd.get('whatsapp') as string) || null,
      house_number: (fd.get('house_number') as string) || null,
      street: (fd.get('street') as string) || null,
      village_city: fd.get('village_city') as string,
      district: fd.get('district') as string,
      postal_code: (fd.get('postal_code') as string) || null,
      school_name: fd.get('school_name') as string,
      current_grade: Number(fd.get('current_grade')),
      student_type: fd.get('student_type') as 'new' | 'existing',
      guardian_consent: true,
    })

    if (studentError) { setError(studentError.message); setLoading(false); return }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => router.push('/dashboard'), 1500)
  }

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-green-600">Registration successful!</h2>
        <p className="text-gray-600 mt-2">Your account is pending admin approval.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Full Name" name="full_name" required />
      <Field label="Email" name="email" type="email" required />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Password" name="password" type="password" required />
        <Field label="Confirm Password" name="confirm_password" type="password" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Parent Name" name="parent_name" required />
        <Field label="Parent Phone" name="parent_phone" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Student Phone" name="student_phone" required />
        <Field label="WhatsApp Number" name="whatsapp" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Field label="House No." name="house_number" />
        <Field label="Street" name="street" />
        <Field label="Village / City" name="village_city" required />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="District" name="district" required />
        <Field label="Postal Code" name="postal_code" />
      </div>
      <Field label="School" name="school_name" required />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Grade</label>
          <select name="current_grade" required className="w-full border rounded-lg px-3 py-2">
            {[6,7,8,9,10,11].map(g => <option key={g} value={g}>Grade {g}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Student Type</label>
          <select name="student_type" className="w-full border rounded-lg px-3 py-2">
            <option value="new">New</option>
            <option value="existing">Existing</option>
          </select>
        </div>
      </div>
      <label className="flex items-start gap-2 text-sm">
        <input type="checkbox" name="guardian_consent" required className="mt-1" />
        <span>I confirm a parent/guardian has consented to this registration.</span>
      </label>
      {error && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">{error}</div>}
      <button disabled={loading} className="w-full py-3 rounded-full gradient-btn text-white font-bold">
        {loading ? 'Registering...' : 'Register'}
      </button>
    </form>
  )
}

function Field({ label, name, type = 'text', required = false }: any) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}{required && ' *'}</label>
      <input name={name} type={type} required={required}
        className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-400 outline-none" />
    </div>
  )
}