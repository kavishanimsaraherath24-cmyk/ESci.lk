import { createClient } from '@/lib/supabase/server'
import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server'

export default async function HomePage() {
  const t = await getTranslations('home')
  const tCommon = await getTranslations('common')
  const supabase = await createClient()

  const { data: settings } = await supabase.from('site_settings').select('*').single()
  const { data: classes } = await supabase.from('classes').select('*').eq('is_active', true).order('grade')
  const { data: announcements } = await supabase
    .from('announcements').select('*').eq('is_published', true).eq('audience', 'all')
    .order('published_at', { ascending: false }).limit(3)

  return (
    <div className="min-h-screen">
      {/* NAV */}
      <nav className="bg-[var(--brand-navy)] text-white py-4 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full gradient-btn flex items-center justify-center font-bold">E</div>
          <div>
            <div className="font-bold text-lg">ESci.lk</div>
            <div className="text-xs text-cyan-300 sinhala">{settings?.tagline}</div>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/auth/sign-in" className="px-4 py-2 rounded-full border border-white/30 text-sm">
            {tCommon('login')}
          </Link>
          <Link href="/auth/register" className="px-4 py-2 rounded-full gradient-btn text-sm font-semibold">
            {tCommon('register')}
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="gradient-hero text-white py-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="text-sm text-cyan-300 mb-2 sinhala">{settings?.tagline}</div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4">ESci.lk</h1>
            <p className="text-2xl md:text-3xl mb-6 text-yellow-300 font-semibold">{t('hero_title')}</p>
            <p className="text-lg mb-8 opacity-90">{t('hero_sub')}</p>
            <div className="flex gap-4">
              <Link href="/auth/register" className="px-6 py-3 rounded-full bg-white text-[var(--brand-navy)] font-bold hover:scale-105 transition">
                {tCommon('register')}
              </Link>
              <Link href="/auth/sign-in" className="px-6 py-3 rounded-full border-2 border-white font-semibold">
                {tCommon('login')}
              </Link>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="w-64 h-64 rounded-3xl bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 flex items-center justify-center text-7xl shadow-2xl">
              🔬
            </div>
          </div>
        </div>
      </section>

      {/* TEACHER */}
      <section className="py-16 px-6 bg-gradient-to-br from-purple-50 to-cyan-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-purple-900 mb-6">{t('about_title')}</h2>
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="w-32 h-32 rounded-full gradient-card-2 mx-auto mb-4 flex items-center justify-center text-white text-4xl font-bold">
              {settings?.teacher_name?.[0] ?? 'K'}
            </div>
            <h3 className="text-xl font-bold text-gray-900">{settings?.teacher_name}</h3>
            <p className="text-gray-600 mt-2">Science Educator · Grades 6–11</p>
          </div>
        </div>
      </section>

      {/* CLASSES */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10 bg-gradient-to-r from-blue-600 to-pink-500 bg-clip-text text-transparent">
            {t('classes_title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {(classes ?? []).map((c, i) => (
              <div key={c.id} className={`rounded-2xl p-6 text-white shadow-xl gradient-card-${(i % 3) + 1}`}>
                <div className="text-sm opacity-80">Grade {c.grade}</div>
                <div className="text-xl font-bold mt-1">{c.name}</div>
                <p className="text-sm mt-2 opacity-90">{c.description}</p>
                <div className="mt-4 text-sm">📅 {c.schedule}</div>
                {c.monthly_fee && <div className="text-sm">💰 LKR {c.monthly_fee}/month</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ANNOUNCEMENTS */}
      {announcements && announcements.length > 0 && (
        <section className="py-16 px-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center text-teal-700">{t('announcements')}</h2>
            {announcements.map(a => (
              <div key={a.id} className="bg-white p-5 rounded-xl mb-4 shadow border-l-4 border-cyan-400">
                <h3 className="font-bold text-gray-900">{a.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{a.body}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CONTACT */}
      <section className="py-16 px-6 gradient-card-3 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">{t('contact')}</h2>
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            <div>📞 {settings?.contact_phone || '—'}</div>
            <div>✉️ {settings?.contact_email || '—'}</div>
            <div>💬 WhatsApp</div>
          </div>
        </div>
      </section>

      <footer className="bg-[var(--brand-navy)] text-white py-8 px-6 text-center">
        <div className="sinhala text-cyan-300 mb-2">{settings?.tagline}</div>
        <div className="text-sm opacity-70">© {new Date().getFullYear()} ESci.lk</div>
      </footer>
    </div>
  )
}