import { createClient } from '@/lib/supabase/server'
import PaymentRow from './PaymentRow'

export default async function PaymentsPage({ searchParams }: { searchParams: Promise<{ status?: string; grade?: string }> }) {
  const sp = await searchParams
  const supabase = await createClient()

  let q = supabase.from('payments')
    .select('*, students(current_grade, profiles(full_name, email))')
    .order('created_at', { ascending: false })
  if (sp.status) q = q.eq('status', sp.status as any)

  const { data: payments } = await q

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Payments</h1>
      <form className="flex gap-2 bg-white p-3 rounded-xl shadow">
        <select name="status" defaultValue={sp.status} className="border rounded-lg px-3 py-2">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button className="px-4 py-2 rounded-full gradient-btn text-white">Filter</button>
      </form>
      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Student</th><th>Grade</th><th>Month</th><th>Amount</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(payments ?? []).map((p: any) => <PaymentRow key={p.id} payment={p} />)}
          </tbody>
        </table>
      </div>
    </div>
  )
}