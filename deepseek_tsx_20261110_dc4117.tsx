'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/i18n/navigation'

export default function UploadPaymentPage() {
  const [classes, setClasses] = useState<any[]>([])
  const [bank, setBank] = useState<any>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    supabase.from('classes').select('id, name, grade, monthly_fee').eq('is_active', true)
      .order('grade').then(({ data }) => setClasses(data ?? []))
    supabase.from('site_settings').select('*').single()
      .then(({ data }) => setBank(data))
  }, [])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true); setMsg(null)
    const fd = new FormData(e.currentTarget)
    const file = fd.get('receipt') as File
    if (!file || file.size === 0) { setMsg('Please attach a receipt'); setLoading(false); return }

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setMsg('Not signed in'); setLoading(false); return }

    // 1. Create payment row
    const { data: payment, error } = await supabase.from('payments').insert({
      student_id: user.id,
      class_id: (fd.get('class_id') as string) || null,
      payment_month: `${fd.get('payment_month')}-01`,
      amount: Number(fd.get('amount')),
      payment_date: fd.get('payment_date') as string,
      reference_no: (fd.get('reference_no') as string) || null,
    }).select().single()

    if (error || !payment) { setMsg(error?.message ?? 'Failed'); setLoading(false); return }

    // 2. Upload file
    const ext = file.name.split('.').pop()
    const objectKey = `${user.id}/${payment.id}.${ext}`
    const { error: upErr } = await supabase.storage.from('payment-receipts').upload(objectKey, file, { contentType: file.type })
    if (upErr) { setMsg(upErr.message); setLoading(false); return }

    // 3. Attach path
    await supabase.from('payments').update({ receipt_path: objectKey }).eq('id', payment.id)

    setMsg('Payment submitted! Awaiting admin approval.')
    setLoading(false)
    setTimeout(() => router.push('/dashboard/payments'), 1500)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Upload Payment Slip</h1>

      {bank && (
        <div className="bg-gradient-to-r from-cyan-400 to-teal-500 rounded-2xl p-6 text-white shadow">
          <h2 className="font-bold mb-2">Bank Details</h2>
          <div className="text-sm space-y-1">
            <div>Bank: {bank.bank_name || '—'}</div>
            <div>Account Name: {bank.bank_account_name || '—'}</div>
            <div>Account No: {bank.bank_account_number || '—'}</div>
            <div>Branch: {bank.bank_branch || '—'}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Class</label>
          <select name="class_id" className="w-full border rounded-lg px-3 py-2">
            <option value="">Select class</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name} (Grade {c.grade})</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Payment Month</label>
            <input name="payment_month" type="month" required className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Amount (LKR)</label>
            <input name="amount" type="number" required min={1} step="0.01" className="w-full border rounded-lg px-3 py-2" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Payment Date</label>
            <input name="payment_date" type="date" required className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reference No.</label>
            <input name="reference_no" className="w-full border rounded-lg px-3 py-2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Receipt (image or PDF)</label>
          <input name="receipt" type="file" required accept="image/*,application/pdf" className="w-full" />
        </div>
        {msg && <div className="bg-blue-50 text-blue-700 p-3 rounded text-sm">{msg}</div>}
        <button disabled={loading} className="w-full py-3 rounded-full gradient-btn text-white font-bold">
          {loading ? 'Uploading...' : 'Submit Payment'}
        </button>
      </form>
    </div>
  )
}