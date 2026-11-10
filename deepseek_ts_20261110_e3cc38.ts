import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  const { data: resource } = await supabase.from('learning_resources').select('*').eq('id', id).single()
  if (!resource) return new NextResponse('Not found', { status: 404 })

  const { data: signed } = await supabase.storage
    .from('learning-resources').createSignedUrl(resource.file_path, 60 * 10)
  if (!signed) return new NextResponse('Failed', { status: 500 })
  return NextResponse.redirect(signed.signedUrl)
}