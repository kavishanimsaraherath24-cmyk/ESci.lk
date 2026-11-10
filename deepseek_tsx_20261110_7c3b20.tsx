'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PaymentRow({ payment }: { payment: any }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function review(action: 'approve' | 'reject') {
    let reason = ''
    if (action === 'reject') {
      reason = prompt('Rejection reason:') ?? ''
      if (!reason) return
    }
    setLoading(true)
    const res = await fetch('/api/admin/review-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: payment.id, action, reason }),
    })
    if (!res.ok) alert('Failed: ' + (await res.text()))
    setLoading(false)
    router.refresh()
  }

  async function viewReceipt() {
    const res = await fetch(`/api/admin/receipt-url?id=${payment.id}`)
    if (!res.ok) return alert('Could not fetch receipt')
    const { url } = await res.json()
    window.open(url, '_blank')
  }

  return (
    <tr className="border-t">
      <td className="p-3">{payment.students?.profiles?.full_name ?? '—'}</td>
      <td>{payment.students?.current_grade ?? '—'}</td>
      <td>{payment.payment_month}</td>
      <td>LKR {payment.amount}</td>
      <td>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          payment.status === 'approved' ? 'bg-green-100 text-green-700' :
          payment.status === 'rejected' ? 'bg-red-100 text-red-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>{payment.status}</span>
      </td>
      <td className="space-x-1">
        {payment.receipt_path && (
          <button onClick={viewReceipt} className="px-2 py-1 text-xs rounded bg-blue-500 text-white">View</button>
        )}
        {payment.status === 'pending' && (
          <>
            <button disabled={loading} onClick={() => review('approve')} className="px-2 py-1 text-xs rounded bg-green-600 text-white">Approve</button>
            <button disabled={loading} onClick={() => review('reject')} className="px-2 py-1 text-xs rounded bg-red-600 text-white">Reject</button>
          </>
        )}
      </td>
    </tr>
  )
}