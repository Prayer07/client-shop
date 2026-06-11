import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

export function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-6">
      <span className="text-xs font-bold text-gold uppercase tracking-widest">{label}</span>
      <h2 className="font-serif text-xl font-black text-brown mt-1">{title}</h2>
    </div>
  )
}

export const input = 'w-full border border-blush rounded-lg px-3 py-2.5 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-gold/40 text-brown font-medium placeholder:text-taupe/40'
export const label = 'text-sm font-bold text-brown block mb-1'

export function LogoUpload({ onUploaded, currentUrl }: { onUploaded: (url: string) => void; currentUrl?: string }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setError(''); setSuccess('')
    setPreview(URL.createObjectURL(file))
    const fileExt = file.name.split('.').pop()
    const fileName = `logo-${Date.now()}.${fileExt}`
    const { error: storageError } = await supabase.storage.from('product-images').upload(fileName, file)
    if (storageError) { setError('Upload failed.'); setUploading(false); return }
    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
    onUploaded(data.publicUrl)
    setUploading(false)
    setSuccess('Logo uploaded! Hit Save All Settings to apply.')
  }

  const displayImg = preview || currentUrl

  return (
    <div>
      {displayImg && (
        <div className="mb-4 p-4 bg-brown rounded-xl inline-block">
          <img src={displayImg} alt="Logo preview" className="h-12 w-auto object-contain" />
        </div>
      )}
      <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="w-full text-sm text-taupe file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-brown file:text-cream hover:file:bg-brown/80 cursor-pointer disabled:opacity-50" />
      <p className="text-xs text-brown/40 mt-2">Preview shown on dark background to simulate the navbar.</p>
      {uploading && <p className="text-xs text-brown/50 mt-2">Uploading...</p>}
      {success && <p className="text-xs text-green-600 mt-2">{success}</p>}
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  )
}

export function AboutImageUpload({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setError(''); setSuccess('')
    setPreview(URL.createObjectURL(file))
    const fileExt = file.name.split('.').pop()
    const fileName = `about-${Date.now()}.${fileExt}`
    const { error: storageError } = await supabase.storage.from('product-images').upload(fileName, file)
    if (storageError) { setError('Upload failed.'); setUploading(false); return }
    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
    onUploaded(data.publicUrl)
    setUploading(false)
    setSuccess('Photo uploaded! Hit Save All Settings to apply.')
  }

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="w-full text-sm text-taupe file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-brown file:text-cream hover:file:bg-brown/80 cursor-pointer disabled:opacity-50" />
      {preview && <img src={preview} className="mt-3 w-24 h-24 rounded-full object-cover border-2 border-blush" />}
      {uploading && <p className="text-xs text-brown/50 mt-2">Uploading...</p>}
      {success && <p className="text-xs text-green-600 mt-2">{success}</p>}
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  )
}