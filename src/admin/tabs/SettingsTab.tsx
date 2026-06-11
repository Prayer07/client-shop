import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { SectionHeader, input, label, LogoUpload, AboutImageUpload } from '../AdminCommon'

const fetchSettings = async () => {
  const { data, error } = await supabase.from('settings').select('*').single()
  if (error) throw error
  return data
}

export default function SettingsTab() {
  const queryClient = useQueryClient()
  const [values, setValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [error, setError] = useState('')

  const { data: settings, isLoading } = useQuery({ queryKey: ['site-settings-admin'], queryFn: fetchSettings })
  useEffect(() => { if (settings) setValues(settings) }, [settings])

  const set = (key: string, value: string) => setValues(prev => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccessMsg('')
    const updates = Object.entries(values).map(([id, value]) => supabase.from('site_settings').upsert({ id, value, updated_at: new Date().toISOString() }))
    const results = await Promise.all(updates)
    const failed = results.find(r => r.error)
    if (failed) { setError('Failed to save some settings.'); setSaving(false); return }
    setSaving(false); setSuccessMsg('Settings saved!')
    queryClient.invalidateQueries({ queryKey: ['site-settings'] })
    queryClient.invalidateQueries({ queryKey: ['site-settings-admin'] })
  }

  if (isLoading) return <div className="h-64 rounded-2xl bg-blush/30 animate-pulse" />

  const fields: { key: string; label: string; placeholder?: string }[][] = [
    [
      { key: 'brand_name', label: 'Brand Name', placeholder: 'e.g. Lammyde Beauty & Spa Lounge' },
      { key: 'hero_headline', label: 'Hero Headline', placeholder: 'Main headline on the homepage' },
      { key: 'hero_tagline', label: 'Hero Tagline', placeholder: 'Short description under the headline' },
      { key: 'about_text', label: 'About Section Text', placeholder: 'Tell your story...' },
      { key: 'logo_url', label: 'Logo URL', placeholder: 'Auto-filled when you upload below' },
      { key: 'about_image', label: 'About Photo URL', placeholder: 'Auto-filled when you upload below' },
    ],
    [
      { key: 'contact_email', label: 'Contact Email', placeholder: 'your@email.com' },
      { key: 'contact_whatsapp', label: 'WhatsApp Number', placeholder: 'Full number without + e.g. 15872233707' },
      { key: 'contact_location', label: 'Location', placeholder: 'e.g. Airdrie, Alberta, Canada' },
    ],
    [
      { key: 'social_instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/youraccount' },
      { key: 'social_facebook', label: 'Facebook URL', placeholder: 'https://facebook.com/yourpage' },
      { key: 'social_tiktok', label: 'TikTok URL', placeholder: 'https://tiktok.com/@youraccount' },
    ],
  ]

  const sectionTitles = ['Brand & Content', 'Contact Information', 'Social Media']

  return (
    <div className="max-w-2xl">
      <SectionHeader label="Customization" title="Site Settings" />
      <p className="text-sm font-medium text-brown/60 mb-8 -mt-2">Changes go live immediately after saving.</p>
      <div className="flex flex-col gap-8">
        {fields.map((group, gi) => (
          <div key={gi} className="bg-white border border-blush/40 rounded-2xl shadow-sm p-6">
            <h3 className="font-serif font-black text-brown text-base mb-5">{sectionTitles[gi]}</h3>
            <div className="flex flex-col gap-4">
              {group.map(field => (
                <div key={field.key}>
                  <label className={label}>{field.label}</label>
                  {field.key === 'hero_tagline' || field.key === 'about_text' ? (
                    <textarea value={values[field.key] ?? ''} onChange={e => set(field.key, e.target.value)} rows={3} placeholder={field.placeholder} className={`${input} resize-none`} />
                  ) : (
                    <input value={values[field.key] ?? ''} onChange={e => set(field.key, e.target.value)} placeholder={field.placeholder} className={input} />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      {error && <p className="text-xs text-red-400 mt-4">{error}</p>}
      {successMsg && <p className="text-xs text-green-600 mt-4">{successMsg}</p>}
      <button onClick={handleSave} disabled={saving} className="mt-6 w-full bg-brown text-cream font-bold py-3.5 rounded-full hover:bg-brown/80 transition-colors text-sm tracking-wide disabled:opacity-50">
        {saving ? 'Saving...' : 'Save All Settings'}
      </button>
      <div className="mt-6 bg-white border border-blush/40 rounded-2xl shadow-sm p-6">
        <h3 className="font-serif font-black text-brown text-base mb-2">Upload Logo</h3>
        <p className="text-xs font-medium text-brown/50 mb-4">PNG with transparent background recommended.</p>
        <LogoUpload onUploaded={(url) => setValues(prev => ({ ...prev, logo_url: url }))} currentUrl={values['logo_url']} />
      </div>
      <div className="mt-6 bg-white border border-blush/40 rounded-2xl shadow-sm p-6">
        <h3 className="font-serif font-black text-brown text-base mb-2">Upload About / Story Photo</h3>
        <p className="text-xs font-medium text-brown/50 mb-4">This photo appears on the Our Story page background.</p>
        <AboutImageUpload onUploaded={(url) => setValues(prev => ({ ...prev, about_image: url }))} />
      </div>
    </div>
  )
}