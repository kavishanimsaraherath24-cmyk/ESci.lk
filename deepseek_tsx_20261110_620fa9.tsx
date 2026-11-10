import { createClient } from '@/lib/supabase/server'

export default async function AdminHome() {
  const supabase = await createClient()

  const [
    { count: total },
    { count: active },
    { count: pendingReg },
    { count: pendingPay },
    { count: approvedPay },
    { count: totalClasses },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student').eq('status', 'active'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student').eq('status', 'pending'),
    supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('payments').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
    supabase.from('classes').select('*', { count: 'exact', head: true }),
  ])

  const cards = [
    { label: 'Total Students', value: total ?? 0, gradient: 'gradient-card-1' },
    { label: 'Active Students', value: active ?? 0, gradient: 'gradient-card-2' },
    { label: 'Pending Registrations', value: pendingReg ?? 0, gradient: 'gradient-card-3' },
    { label: 'Pending Payments', value: pendingPay ?? 0, gradient: 'gradient-card-1' },
    { label: 'Approved Payments', value: approvedPay ?? 0, gradient: 'gradient-card-2' },
    { label: 'Total Classes', value: totalClasses ?? 0, gradient: 'gradient-card-3' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Admin Overview</h1>
      <div className="grid md:grid-cols-3 gap-4">
        {cards.map(c => (
          <div key={c.label} className={`rounded-2xl p-5 text-white shadow ${c.gradient}`}>
            <div className="text-xs opacity-80">{c.label}</div>
            <div className="text-3xl font-bold mt-1">{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}