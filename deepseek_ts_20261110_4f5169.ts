import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })
  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (me?.role !== 'admin') return new NextResponse('Forbidden', { status: 403 })

  const id = new URL(request.url).searchParams.get('id')
  if (!id) return new NextResponse('Missing id', { status: 400 })

  const admin = createAdminClient()
  // Remove receipts in storage
  const { data: files } = await admin.storage.from('payment-receipts').list(id)
  if (files?.length) {
    await admin.storage.from('payment-receipts').remove(files.map(f => `${id}/${f.name}`))
  }
  // Deletes profiles -> cascades to students -> payments
  await admin.auth.admin.deleteUser(id)

  return NextResponse.json({ ok: true })
}