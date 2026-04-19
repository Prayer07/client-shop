import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { SectionHeader, input, label, LogoUpload, AboutImageUpload } from '../AdminCommon'

const fetchSettings = async () => {
  const { data, error } = await supabase.from('settings').select('*').single()
  if (error) throw error
  return data
}

export default function SettingsTab() {
  const queryClient = useQueryClient()
  const { data: settings } = useQuery({ queryKey: ['settings'], queryFn: fetchSettings })
  const [title, setTitle] = useState('')
  const [phone, setPhone] = useState('')
  const [about, setAbout] = useState('')
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [aboutPhotoUrl, setAboutPhotoUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  // initialize local form state when settings arrive (defer to avoid synchronous setState in effect)
  useEffect(() => {
    if (settings) {
      setTimeout(() => {
        setTitle(settings.title ?? '')
        setPhone(settings.phone ?? '')
        setAbout(settings.about ?? '')
        setLogoUrl(settings.logo_url ?? null)
        setAboutPhotoUrl(settings.about_photo ?? null)
      })
    }
  }, [settings])

  const saveMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const { error } = await supabase.from('settings').upsert(payload)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  })

  const handleSave = async () => {
    setErr(''); setMsg(''); setSaving(true)
    try {
      await saveMutation.mutateAsync({ title, phone, about, logo_url: logoUrl, about_photo: aboutPhotoUrl })
      setMsg('Settings saved!')
    } catch { setErr('Save failed.') }
    setSaving(false)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="bg-white border border-blush/40 rounded-2xl shadow-sm p-6">
        <SectionHeader label="Branding" title="Site Settings" />
        <div className="flex flex-col gap-4">
          <div><label className={label}>Site Title</label><input value={title} onChange={e => setTitle(e.target.value)} className={input} /></div>
          <div><label className={label}>Phone</label><input value={phone} onChange={e => setPhone(e.target.value)} className={input} /></div>
          <div><label className={label}>About Blurb</label><textarea value={about} onChange={e => setAbout(e.target.value)} rows={3} className={`${input} resize-none`} /></div>
          <div>
            <label className={label}>Logo</label>
            <LogoUpload onUploaded={(u) => setLogoUrl(u)} currentUrl={logoUrl ?? undefined} />
          </div>
          <div>
            <label className={label}>About Photo</label>
            <AboutImageUpload onUploaded={(u) => setAboutPhotoUrl(u)} />
          </div>
          {err && <p className="text-xs text-red-400">{err}</p>}
          {msg && <p className="text-xs text-green-600">{msg}</p>}
          <button onClick={handleSave} disabled={saving} className="w-full bg-brown text-cream font-bold py-3 rounded-full hover:bg-brown/80 transition-colors text-sm disabled:opacity-50">{saving ? 'Saving...' : 'Save All Settings'}</button>
        </div>
      </div>

      <div>
        <SectionHeader label="Preview" title="Live Preview" />
        <div className="bg-cream border border-blush/20 rounded-xl p-6">
          <div className="flex items-center gap-4">
            {logoUrl ? <img src={logoUrl} className="h-12 object-contain" /> : <div className="h-12 w-24 bg-blush/20 rounded-md" />}
            <div>
              <div className="font-serif font-black text-brown text-lg">{title || 'Your Site Title'}</div>
              <div className="text-sm text-brown/50">{phone || 'Phone number'}</div>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-sm text-brown/70">{about || 'About blurb preview...'}</p>
            {aboutPhotoUrl && <img src={aboutPhotoUrl} className="mt-4 w-full rounded-xl object-cover" />}
          </div>
        </div>
      </div>
    </div>
  )
}
