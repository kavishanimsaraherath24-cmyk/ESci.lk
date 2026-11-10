'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function StudentRow({ student }: { student: any }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const status = student.profiles?.status

  async function updateStatus(newStatus: 'active' | 'pending' | 'suspended') {
    if (!confirm(`Change status to ${newStatus}?`)) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from('profiles').update({ status: newStatus }).eq('id', student.id)
    setLoading(false)
    router.refresh()
  }

  async function removeStudent() {
    if (!confirm('Delete this student? This cannot be undone.')) return
    setLoading(true)
    await fetch(`/api/admin/delete-student?id=${student.id}`, { method: 'DELETE' })
    setLoading(false)
    router.refresh()
  }

  return (
    <tr className="border-t">
      <td className="p-3 font-mono text-xs">{student.student_code}</td>
      <td>{student.profiles?.full_name}</td>
      <td>{student.current_grade}</td>
      <td className="text-xs">{student.school_name}</td>
      <td>
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          status === 'active' ? 'bg-green-100 text-green-700' :
          status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>{status}</span>
      </td>
      <td className="space-x-1">
        {status !== 'active' && (
          <button onClick={() => updateStatus('active')} disabled={loading}
            className="px-2 py-1 text-xs rounded bg-green-500 text-white">Approve</button>
        )}
        {status === 'active' && (
          <button onClick={() => updateStatus('suspended')} disabled={loading}
            className="px-2 py-1 text-xs rounded bg-orange-500 text-white">Suspend</button>
        )}
        <button onClick={removeStudent} disabled={loading}
          className="px-2 py-1 text-xs rounded bg-red-600 text-white">Delete</button>
      </td>
    </tr>
  )
}