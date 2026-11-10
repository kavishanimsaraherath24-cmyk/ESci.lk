import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Link } from '@/i18n/navigation'

export default async function PaymentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in')

  const { data: payments } = await supabase
    .from('payments').select('*').eq('student_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Payment History</h1>
        <Link href="/dashboard/payments/new" className="px-4 py-2 rounded-full gradient-btn text-white text-sm font-semibold">
          + Upload Slip
        </Link>
      </div>
      <div className="bg-white rounded-2xl p-6 shadow overflow-x-auto">
        {(!payments || payments.length === 0) ? (
          <p className="text-gray-500 text-sm">No payments submitted yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-gray-500">
              <tr>
                <th className="py-2">Month</th><th>Amount</th><th>Date</th><th>Status</th><th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} className="border-t">
                  <td className="py-2">{p.payment_month}</td>
                  <td>LKR {p.amount}</td>
                  <td>{p.payment_date}</td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      p.status === 'approved' ? 'bg-green-100 text-green-700' :
                      p.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>{p.status}</span>
                  </td>
                  <td className="text-xs text-gray-500">{p.rejection_reason ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}