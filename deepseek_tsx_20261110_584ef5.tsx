import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: student } = await supabase.from('students').select('*').eq('id', user.id).single()
  const { data: payments } = await supabase.from('payments').select('*').eq('student_id', user.id).order('created_at', { ascending: false }).limit(5)

  const statusColor =
    profile?.status === 'active' ? 'from-green-400 to-teal-500' :
    profile?.status === 'pending' ? 'from-yellow-400 to-orange-500' :
    'from-red-400 to-pink-500'

  return (
    <div className="space-y-6">
      <div className={`rounded-2xl p-6 text-white bg-gradient-to-r ${statusColor} shadow-xl`}>
        <h1 className="text-2xl font-bold">Welcome, {profile?.full_name}</h1>
        <p className="mt-1 opacity-90">Student Code: {student?.student_code}</p>
        <p className="mt-1">Status: <span className="font-bold">{profile?.status?.toUpperCase()}</span></p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <StatCard label="Grade" value={`Grade ${student?.current_grade}`} gradient="gradient-card-1" />
        <StatCard label="School" value={student?.school_name ?? '—'} gradient="gradient-card-2" />
        <StatCard label="Payments" value={`${payments?.length ?? 0} recent`} gradient="gradient-card-3" />
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h2 className="text-lg font-bold mb-4">Recent Payments</h2>
        {(!payments || payments.length === 0) ? (
          <p className="text-gray-500 text-sm">No payments yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500">
              <tr><th>Month</th><th>Amount</th><th>Status</th></tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} className="border-t">
                  <td className="py-2">{p.payment_month}</td>
                  <td>LKR {p.amount}</td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      p.status === 'approved' ? 'bg-green-100 text-green-700' :
                      p.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, gradient }: any) {
  return (
    <div className={`rounded-2xl p-5 text-white shadow-lg ${gradient}`}>
      <div className="text-xs opacity-80">{label}</div>
      <div className="text-xl font-bold mt-1">{value}</div>
    </div>
  )
}