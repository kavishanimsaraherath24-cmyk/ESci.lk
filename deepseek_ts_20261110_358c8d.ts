import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })
  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (me?.role !== 'admin') return new NextResponse('Forbidden', { status: 403 })

  const id = new URL(request.url).searchParams.get('id')
  if (!id) return new NextResponse('Missing id', { status: 400 })

  const admin = createAdminClient()
  const { data: payment } = await admin.from('payments').select('receipt_path').eq('id', id).single()
  if (!payment?.receipt_path) return new NextResponse('No receipt', { status: 404 })

  const { data: signed } = await admin.storage.from('payment-receipts').createSignedUrl(payment.receipt_path, 600)
  return NextResponse.json({ url: signed?.signedUrl })
}