import { createClient } from '@/lib/supabase/server'
import SettingsForm from './SettingsForm'

export default async function AdminSettings() {
  const supabase = await createClient()
  const { data: settings } = await supabase.from('site_settings').select('*').single()
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Site Settings</h1>
      <SettingsForm settings={settings} />
    </div>
  )
}