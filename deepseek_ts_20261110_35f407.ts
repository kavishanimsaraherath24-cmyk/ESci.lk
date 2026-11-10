import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })
  const { data: me } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (me?.role !== 'admin') return new NextResponse('Forbidden', { status: 403 })

  const id = new URL(request.url).searchParams.get('id')
  if (id) {
    const { data: a } = await supabase.from('announcements').select('is_published').eq('id', id).single()
    await supabase.from('announcements').update({ is_published: !a?.is_published }).eq('id', id)
  }
  return NextResponse.redirect(new URL('/si-LK/admin/announcements', request.url))
}