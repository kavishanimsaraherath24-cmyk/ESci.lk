import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest, response: NextResponse) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path = request.nextUrl.pathname
  const isProtected =
    /\/(dashboard|admin)(\/|$)/.test(path)

  if (!user && isProtected) {
    const locale = path.split('/')[1] || 'si-LK'
    const url = request.nextUrl.clone()
    url.pathname = `/${locale}/auth/sign-in`
    return NextResponse.redirect(url)
  }

  return response
}