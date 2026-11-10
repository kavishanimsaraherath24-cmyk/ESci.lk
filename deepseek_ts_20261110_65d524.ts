import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })
  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (me?.role !== 'admin') return new NextResponse('Forbidden', { status: 403 })

  const { id, action, reason } = await request.json()
  if (!id || !['approve', 'reject'].includes(action)) {
    return new NextResponse('Bad request', { status: 400 })
  }

  const update = action === 'approve'
    ? { status: 'approved' as const, rejection_reason: null, reviewed_by: user.id, reviewed_at: new Date().toISOString() }
    : { status: 'rejected' as const, rejection_reason: reason, reviewed_by: user.id, reviewed_at: new Date().toISOString() }

  const { error } = await supabase.from('payments').update(update).eq('id', id)
  if (error) return new NextResponse(error.message, { status: 500 })
  return NextResponse.json({ ok: true })
}