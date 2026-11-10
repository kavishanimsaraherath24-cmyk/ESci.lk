import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { Noto_Sans_Sinhala, Inter } from 'next/font/google'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const sinhala = Noto_Sans_Sinhala({ subsets: ['sinhala'], variable: '--font-sinhala', weight: ['400','500','600','700'] })

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!routing.locales.includes(locale as any)) notFound()
  const messages = await getMessages()

  return (
    <html lang={locale} className={`${inter.variable} ${sinhala.variable}`}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}