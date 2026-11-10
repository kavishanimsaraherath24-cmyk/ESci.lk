import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Link } from '@/i18n/navigation'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role === 'admin') redirect('/admin')

  const links = [
    { href: '/dashboard', label: '📊 Dashboard' },
    { href: '/dashboard/profile', label: '👤 Profile' },
    { href: '/dashboard/classes', label: '📚 My Classes' },
    { href: '/dashboard/payments', label: '💳 Payments' },
    { href: '/dashboard/payments/new', label: '📤 Upload Slip' },
    { href: '/dashboard/resources', label: '📄 Notes' },
    { href: '/dashboard/announcements', label: '📢 Announcements' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <header className="bg-[var(--brand-navy)] text-white py-4 px-6 flex justify-between items-center">
        <div>
          <div className="font-bold">ESci.lk</div>
          <div className="text-xs text-cyan-300 sinhala">මොළේට දැනෙන්න Science</div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm">{profile?.full_name}</span>
          <form action="/auth/sign-out" method="post">
            <button className="px-3 py-1 rounded-full bg-white/10 text-sm">Logout</button>
          </form>
        </div>
      </header>
      <div className="max-w-7xl mx-auto p-6 grid md:grid-cols-[220px_1fr] gap-6">
        <aside className="bg-white rounded-2xl p-4 shadow-lg h-fit">
          <nav className="space-y-1">
            {links.map(l => (
              <Link key={l.href} href={l.href}
                className="block px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-blue-100 hover:to-pink-100 text-sm">
                {l.label}
              </Link>
            ))}
          </nav>
        </aside>
        <main>{children}</main>
      </div>
    </div>
  )
}