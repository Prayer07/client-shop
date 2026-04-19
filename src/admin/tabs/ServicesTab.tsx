import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Service } from '../../types'
import { SectionHeader, input, label } from '../AdminCommon'

const fetchServices = async (): Promise<Service[]> => {
  const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export default function ServicesTab() {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [duration, setDuration] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const { data: services, isLoading } = useQuery({ queryKey: ['services'], queryFn: fetchServices })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('services').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  })

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(''); setSuccessMsg('')
    if (!title || !price) { setFormError('Title and price required'); return }
    setUploading(true)
    const { error } = await supabase.from('services').insert([{ title, duration: duration || null, price: parseFloat(price), description: description || null }])
    if (error) { setFormError('Failed to save.'); setUploading(false); return }
    setTitle(''); setDuration(''); setPrice(''); setDescription('')
    setUploading(false); setSuccessMsg('Service added!')
    queryClient.invalidateQueries({ queryKey: ['services'] })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="bg-white border border-blush/40 rounded-2xl shadow-sm p-6">
        <SectionHeader label="New" title="Add Service" />
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <div><label className={label}>Service Title *</label><input value={title} onChange={e => setTitle(e.target.value)} className={input} /></div>
          <div><label className={label}>Duration</label><input value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 60 mins" className={input} /></div>
          <div><label className={label}>Price (CAD) *</label><input value={price} onChange={e => setPrice(e.target.value)} type="number" min="0" step="0.01" className={input} /></div>
          <div><label className={label}>Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className={`${input} resize-none`} /></div>
          {formError && <p className="text-xs text-red-400">{formError}</p>}
          {successMsg && <p className="text-xs text-green-600">{successMsg}</p>}
          <button type="submit" disabled={uploading} className="w-full bg-brown text-cream font-bold py-3 rounded-full hover:bg-brown/80 transition-colors text-sm disabled:opacity-50">{uploading ? 'Saving...' : 'Add Service'}</button>
        </form>
      </div>

      <div>
        <SectionHeader label="List" title="All Services" />
        {isLoading && <div className="flex flex-col gap-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-14 rounded-xl bg-blush/30 animate-pulse" />)}</div>}
        {!isLoading && (!services || services.length === 0) && <p className="text-sm font-medium text-brown/50">No services yet.</p>}
        {!isLoading && services && services.length > 0 && (
          <div className="flex flex-col gap-3">
            {services.map(s => (
              <div key={s.id} className="bg-white border border-blush/40 rounded-xl p-3 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-brown font-serif">{s.title}</p>
                    {s.duration && <p className="text-xs text-brown/50">{s.duration}</p>}
                    <p className="text-xs font-semibold text-brown/50">${Number(s.price)?.toFixed(2)} CAD</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button onClick={() => deleteMutation.mutate(s.id)} className="text-xs text-red-300 hover:text-red-500 font-bold">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
