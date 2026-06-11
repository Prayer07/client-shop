import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { SectionHeader, input, label } from '../AdminCommon'
import type { SpaPackage } from '../../types'

const fetchSpaPackages = async (): Promise<SpaPackage[]> => {
  const { data, error } = await supabase.from('spa_packages').select('*').order('display_order', { ascending: true })
  if (error) throw error; return data
}

export default function SpaPackagesTab() {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('')
  const [includes, setIncludes] = useState('')
  const [price, setPrice] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [editPkg, setEditPkg] = useState<SpaPackage | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editDuration, setEditDuration] = useState('')
  const [editIncludes, setEditIncludes] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState('')

  const { data: packages, isLoading } = useQuery({ queryKey: ['spa-packages'], queryFn: fetchSpaPackages })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('spa_packages').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['spa-packages'] }),
  })

  const parseIncludes = (text: string): string[] =>
    text.split('\n').map(l => l.trim()).filter(l => l.length > 0)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(''); setSuccessMsg('')
    if (!name) { setFormError('Name is required.'); return }
    setSaving(true)
    const display_order = (packages?.length ?? 0) + 1
    const { error } = await supabase.from('spa_packages').insert([{
      name, description: description || null, includes: parseIncludes(includes), price: price || null, duration: duration || null, display_order
    }])
    if (error) { setFormError('Failed to save.'); setSaving(false); return }
    setName(''); setDescription(''); setIncludes(''); setPrice(''); setDuration('')
    setSaving(false); setSuccessMsg('Package added!')
    queryClient.invalidateQueries({ queryKey: ['spa-packages'] })
  }

  const openEdit = (pkg: SpaPackage) => {
    setEditPkg(pkg); setEditName(pkg.name); setEditDescription(pkg.description ?? '')
    setEditIncludes((pkg.includes ?? []).join('\n')); setEditPrice(pkg.price ?? '')
    setEditDuration(pkg.duration ?? '')
    setEditError(''); setEditSuccess('')
  }

  const handleEditSave = async () => {
    if (!editPkg) return
    setEditError(''); setEditSuccess(''); setEditSaving(true)
    const { error } = await supabase.from('spa_packages').update({
      name: editName, description: editDescription || null,
      includes: parseIncludes(editIncludes), price: editPrice || null, duration: editDuration || null
    }).eq('id', editPkg.id)
    if (error) { setEditError('Update failed.'); setEditSaving(false); return }
    setEditSaving(false); setEditSuccess('Updated!')
    queryClient.invalidateQueries({ queryKey: ['spa-packages'] })
    setTimeout(() => setEditPkg(null), 800)
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white border border-blush/40 rounded-2xl shadow-sm p-6">
          <SectionHeader label="New Package" title="Add Spa Package" />
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <div><label className={label}>Package Name *</label><input value={name} onChange={e => setName(e.target.value)} placeholder='e.g. "I Love My Body" Package' className={input} /></div>
            <div><label className={label}>Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Short description..." className={`${input} resize-none`} /></div>
            <div><label className={label}>Duration</label><input value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 60 mins" className={input} /></div>
            <div>
              <label className={label}>What's Included <span className="font-normal text-brown/40">(one item per line)</span></label>
              <textarea value={includes} onChange={e => setIncludes(e.target.value)} rows={4} placeholder={"Deluxe Spa Facial\nDeluxe Spa Manicure\nComplimentary Aromatherapy"} className={`${input} resize-none`} />
            </div>
            <div><label className={label}>Price</label><input value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. 100" className={input} /></div>
            {formError && <p className="text-xs text-red-400">{formError}</p>}
            {successMsg && <p className="text-xs text-green-600">{successMsg}</p>}
            <button type="submit" disabled={saving} className="w-full bg-brown text-cream font-bold py-3 rounded-full hover:bg-brown/80 transition-colors text-sm disabled:opacity-50">{saving ? 'Saving...' : 'Add Package'}</button>
          </form>
        </div>
        <div>
          <SectionHeader label="All Packages" title="Spa Packages" />
          {isLoading && <div className="flex flex-col gap-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-blush/30 animate-pulse" />)}</div>}
          {!isLoading && (!packages || packages.length === 0) && <p className="text-sm font-medium text-brown/50">No packages yet.</p>}
          {!isLoading && packages && packages.length > 0 && (
            <div className="flex flex-col gap-3">
              {packages.map(pkg => (
                <div key={pkg.id} className="bg-white border border-blush/40 rounded-xl p-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-brown truncate font-serif">{pkg.name}</p>
                      <p className="text-xs font-semibold text-brown/50">CA${pkg.price} · {pkg.includes?.length ?? 0} items · {pkg.duration || 'N/A'}</p>
                    </div>
                    <button onClick={() => confirm(`Delete "${pkg.name}"?`) && deleteMutation.mutate(pkg.id)} className="text-xs text-red-300 hover:text-red-500 font-bold transition-colors shrink-0">Delete</button>
                  </div>
                  <div className="mt-2 pt-2 border-t border-blush/20">
                    <button onClick={() => openEdit(pkg)} className="text-xs bg-cream border border-blush/40 hover:border-gold/40 hover:text-gold text-taupe px-3 py-1 rounded-full transition-colors font-semibold">Edit</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {editPkg && (
        <div className="fixed inset-0 z-50 bg-brown/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditPkg(null)}>
          <div className="bg-cream rounded-2xl shadow-2xl w-full max-w-md p-7 border border-blush/40 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-5">
              <div><h2 className="font-serif text-xl font-black text-brown">Edit Package</h2><p className="text-xs font-medium text-brown/50 mt-0.5">{editPkg.name}</p></div>
              <button onClick={() => setEditPkg(null)} className="text-taupe hover:text-brown text-xl">✕</button>
            </div>
            <div className="flex flex-col gap-4">
              <div><label className={label}>Name *</label><input value={editName} onChange={e => setEditName(e.target.value)} className={input} /></div>
              <div><label className={label}>Description</label><textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={2} className={`${input} resize-none`} /></div>
              <div><label className={label}>Duration</label><input value={editDuration} onChange={e => setEditDuration(e.target.value)} placeholder="e.g. 60 mins" className={input} /></div>
              <div>
                <label className={label}>What's Included <span className="font-normal text-brown/40">(one per line)</span></label>
                <textarea value={editIncludes} onChange={e => setEditIncludes(e.target.value)} rows={4} className={`${input} resize-none`} />
              </div>
              <div><label className={label}>Price</label><input value={editPrice} onChange={e => setEditPrice(e.target.value)} className={input} /></div>
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