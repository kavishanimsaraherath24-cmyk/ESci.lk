import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

const handleI18n = createIntlMiddleware(routing)

export async function middleware(request: NextRequest) {
  const response = handleI18n(request)
  return await updateSession(request, response)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}