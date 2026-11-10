import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Link } from '@/i18n/navigation'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/sign-in')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const nav = [
    { href: '/admin', label: '📊 Overview' },
    { href: '/admin/students', label: '👥 Students' },
    { href: '/admin/classes', label: '📚 Classes' },
    { href: '/admin/payments', label: '💰 Payments' },
    { href: '/admin/announcements', label: '📢 Announcements' },
    { href: '/admin/resources', label: '📄 Resources' },
    { href: '/admin/messages', label: '✉️ Messages' },
    { href: '/admin/settings', label: '⚙️ Settings' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-cyan-50">
      <header className="bg-gradient-to-r from-purple-800 to-pink-700 text-white py-4 px-6 flex justify-between items-center">
        <div>
          <div className="font-bold">ESci.lk Admin</div>
          <div className="text-xs text-pink-200 sinhala">මොළේට දැනෙන්න Science</div>
        </div>
        <form action="/auth/sign-out" method="post">
          <button className="px-3 py-1 rounded-full bg-white/10 text-sm">Logout</button>
        </form>
      </header>
      <div className="max-w-7xl mx-auto p-6 grid md:grid-cols-[220px_1fr] gap-6">
        <aside className="bg-white rounded-2xl p-4 shadow-lg h-fit">
          <nav className="space-y-1">
            {nav.map(l => (
              <Link key={l.href} href={l.href}
                className="block px-3 py-2 rounded-lg hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 text-sm">
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