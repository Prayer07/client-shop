import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { SectionHeader, input, label } from '../AdminCommon'
import type { PortfolioCategory, PortfolioService } from '../../types'

export default function ServicesTab() {
  const queryClient = useQueryClient()
  const [selectedCatId, setSelectedCatId] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [duration, setDuration] = useState('')
  const [isPriceTbd, setIsPriceTbd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [editService, setEditService] = useState<PortfolioService | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editDuration, setEditDuration] = useState('')
  const [editIsPriceTbd, setEditIsPriceTbd] = useState(false)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState('')

  const fetchServiceCategories = async (): Promise<PortfolioCategory[]> => {
    const { data, error } = await supabase.from('portfolio_categories').select('*').order('display_order', { ascending: true })
    if (error) throw error; return data
  }
  const fetchServicesByCat = async (catId: string): Promise<PortfolioService[]> => {
    const { data, error } = await supabase.from('portfolio_services').select('*').eq('category_id', catId).order('display_order', { ascending: true })
    if (error) throw error; return data
  }

  const { data: categories } = useQuery({ queryKey: ['portfolio-categories'], queryFn: fetchServiceCategories })
  const { data: services, isLoading } = useQuery({
    queryKey: ['portfolio-services', selectedCatId],
    queryFn: () => fetchServicesByCat(selectedCatId),
    enabled: !!selectedCatId,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('portfolio_services').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portfolio-services', selectedCatId] }),
  })

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(''); setSuccessMsg('')
    if (!selectedCatId) { setFormError('Please select a category.'); return }
    if (!name) { setFormError('Service name is required.'); return }
    setSaving(true)
    const display_order = (services?.length ?? 0) + 1
    const { error } = await supabase.from('portfolio_services').insert([{
      category_id: selectedCatId, name, description: description || null,
      price: price || null, duration: duration || null, is_price_tbd: isPriceTbd, display_order
    }])
    if (error) { setFormError('Failed to save.'); setSaving(false); return }
    setName(''); setDescription(''); setPrice(''); setDuration(''); setIsPriceTbd(false)
    setSaving(false); setSuccessMsg('Service added!')
    queryClient.invalidateQueries({ queryKey: ['portfolio-services', selectedCatId] })
  }

  const openEdit = (s: PortfolioService) => {
    setEditService(s); setEditName(s.name); setEditDescription(s.description ?? '')
    setEditPrice(s.price ?? ''); setEditDuration(s.duration ?? ''); setEditIsPriceTbd(s.is_price_tbd)
    setEditError(''); setEditSuccess('')
  }

  const handleEditSave = async () => {
    if (!editService) return
    setEditError(''); setEditSuccess(''); setEditSaving(true)
    const { error } = await supabase.from('portfolio_services').update({
      name: editName, description: editDescription || null,
      price: editPrice || null, duration: editDuration || null, is_price_tbd: editIsPriceTbd
    }).eq('id', editService.id)
    if (error) { setEditError('Update failed.'); setEditSaving(false); return }
    setEditSaving(false); setEditSuccess('Updated!')
    queryClient.invalidateQueries({ queryKey: ['portfolio-services', selectedCatId] })
    setTimeout(() => setEditService(null), 800)
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white border border-blush/40 rounded-2xl shadow-sm p-6">
          <SectionHeader label="New Service" title="Add Services" />
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <div>
              <label className={label}>Category *</label>
              <select value={selectedCatId} onChange={e => setSelectedCatId(e.target.value)} className={input}>
                <option value="">Select a category...</option>
                {categories?.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            <div><label className={label}>Service Name *</label><input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Classic Spa Facial" className={input} /></div>
            <div><label className={label}>Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Service description..." className={`${input} resize-none`} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={label}>Price</label><input value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 49.50" className={input} disabled={isPriceTbd} /></div>
              <div><label className={label}>Duration</label><input value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 45 mins" className={input} /></div>
            </div>
            <label className="flex gap-2 items-center cursor-pointer">
              <input type="checkbox" checked={isPriceTbd} onChange={e => setIsPriceTbd(e.target.checked)} className="w-4 h-4 accent-brown" />
              <span className="text-sm font-semibold text-brown">Price on consultation (hides price field)</span>
            </label>
            {formError && <p className="text-xs text-red-400">{formError}</p>}
            {successMsg && <p className="text-xs text-green-600">{successMsg}</p>}
            <button type="submit" disabled={saving} className="w-full bg-brown text-cream font-bold py-3 rounded-full hover:bg-brown/80 transition-colors text-sm disabled:opacity-50">{saving ? 'Saving...' : 'Add Service'}</button>
          </form>
        </div>
        <div>
          <SectionHeader label="Services" title="Services" />
          <div className="mb-4">
            <select value={selectedCatId} onChange={e => setSelectedCatId(e.target.value)} className={input}>
              <option value="">Select category to view services...</option>
              {categories?.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
          {!selectedCatId && <p className="text-sm font-medium text-brown/50">Select a category above to view its services.</p>}
          {selectedCatId && isLoading && <div className="flex flex-col gap-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-blush/30 animate-pulse" />)}</div>}
          {selectedCatId && !isLoading && (!services || services.length === 0) && <p className="text-sm font-medium text-brown/50">No services yet in this category.</p>}
          {selectedCatId && !isLoading && services && services.length > 0 && (
            <div className="flex flex-col gap-3">
              {services.map(s => (
                <div key={s.id} className="bg-white border border-blush/40 rounded-xl p-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-brown truncate font-serif">{s.name}</p>
                      <p className="text-xs font-semibold text-brown/50">
                        {s.is_price_tbd ? 'Price on consultation' : `CA$${s.price}`}{s.duration && ` · ${s.duration}`}
                      </p>
                    </div>
                    <button onClick={() => confirm(`Delete "${s.name}"?`) && deleteMutation.mutate(s.id)} className="text-xs text-red-300 hover:text-red-500 font-bold transition-colors shrink-0">Delete</button>
                  </div>
                  <div className="mt-2 pt-2 border-t border-blush/20">
                    <button onClick={() => openEdit(s)} className="text-xs bg-cream border border-blush/40 hover:border-gold/40 hover:text-gold text-taupe px-3 py-1 rounded-full transition-colors font-semibold">Edit</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {editService && (
        <div className="fixed inset-0 z-50 bg-brown/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditService(null)}>
          <div className="bg-cream rounded-2xl shadow-2xl w-full max-w-md p-7 border border-blush/40" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-5">
              <div><h2 className="font-serif text-xl font-black text-brown">Edit Service</h2><p className="text-xs font-medium text-brown/50 mt-0.5">{editService.name}</p></div>
              <button onClick={() => setEditService(null)} className="text-taupe hover:text-brown text-xl">✕</button>
            </div>
            <div className="flex flex-col gap-4">
              <div><label className={label}>Name *</label><input value={editName} onChange={e => setEditName(e.target.value)} className={input} /></div>
              <div><label className={label}>Description</label><textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={3} className={`${input} resize-none`} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={label}>Price</label><input value={editPrice} onChange={e => setEditPrice(e.target.value)} className={input} disabled={editIsPriceTbd} /></div>
                <div><label className={label}>Duration</label><input value={editDuration} onChange={e => setEditDuration(e.target.value)} className={input} /></div>
              </div>
              <label className="flex gap-2 items-center cursor-pointer">
                <input type="checkbox" checked={editIsPriceTbd} onChange={e => setEditIsPriceTbd(e.target.checked)} className="w-4 h-4 accent-brown" />
                <span className="text-sm font-semibold text-brown">Price on consultation</span>
              </label>
              {editError && <p className="text-xs text-red-400">{editError}</p>}
              {editSuccess && <p className="text-xs text-green-600">{editSuccess}</p>}
              <button onClick={handleEditSave} disabled={editSaving} className="w-full bg-brown text-cream font-bold py-3 rounded-full hover:bg-brown/80 transition-colors text-sm disabled:opacity-50">{editSaving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}