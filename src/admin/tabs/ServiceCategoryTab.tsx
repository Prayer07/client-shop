import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { PortfolioCategory } from '../../types'
import { SectionHeader, input, label } from '../AdminCommon'

const fetchServiceCategories = async (): Promise<PortfolioCategory[]> => {
  const { data, error } = await supabase.from('portfolio_categories').select('*').order('display_order')
  if (error) throw error
  return data
}

export default function ServiceCategoriesTab() {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [editCat, setEditCat] = useState<PortfolioCategory | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null)
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState('')

  const { data: categories, isLoading } = useQuery({ queryKey: ['portfolio-categories'], queryFn: fetchServiceCategories })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('portfolio_categories').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portfolio-categories'] }),
  })

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `portfolio-cat-${Date.now()}.${fileExt}`
    const { error } = await supabase.storage.from('product-images').upload(fileName, file)
    if (error) throw error
    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
    return data.publicUrl
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(''); setSuccessMsg('')
    if (!name) { setFormError('Name is required.'); return }
    setSaving(true)
    let image_url: string | null = null
    if (imageFile) {
      try { image_url = await uploadImage(imageFile) }
      catch { setFormError('Image upload failed.'); setSaving(false); return }
    }
    const display_order = (categories?.length ?? 0) + 1
    const { error } = await supabase.from('portfolio_categories').insert([{
      name, description: description || null, image_url, display_order
    }])
    if (error) { setFormError('Failed to save.'); setSaving(false); return }
    setName(''); setDescription(''); setImageFile(null); setImagePreview(null)
    setSaving(false); setSuccessMsg('Category added!')
    queryClient.invalidateQueries({ queryKey: ['portfolio-categories'] })
  }

  const openEdit = (cat: PortfolioCategory) => {
    setEditCat(cat); setEditName(cat.name); setEditDescription(cat.description ?? '')
    setEditImageFile(null); setEditImagePreview(null)
    setEditError(''); setEditSuccess('')
  }

  const handleEditSave = async () => {
    if (!editCat) return
    setEditError(''); setEditSuccess(''); setEditSaving(true)
    let image_url = editCat.image_url
    if (editImageFile) {
      try { image_url = await uploadImage(editImageFile) }
      catch { setEditError('Image upload failed.'); setEditSaving(false); return }
    }
    const { error } = await supabase.from('portfolio_categories').update({
      name: editName, description: editDescription || null, image_url
    }).eq('id', editCat.id)
    if (error) { setEditError('Update failed.'); setEditSaving(false); return }
    setEditSaving(false); setEditSuccess('Updated!')
    queryClient.invalidateQueries({ queryKey: ['portfolio-categories'] })
    setTimeout(() => setEditCat(null), 800)
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white border border-blush/40 rounded-2xl shadow-sm p-6">
          <SectionHeader label="New Category" title="Add Service Category" />
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <div><label className={label}>Category Name *</label><input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Skincare Treatments" className={input} /></div>
            <div><label className={label}>Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Short description..." className={`${input} resize-none`} /></div>
            <div>
              <label className={label}>Category Image</label>
              <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)) } }} className="w-full text-sm text-taupe file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-brown file:text-cream hover:file:bg-brown/80 cursor-pointer" />
              {imagePreview && <img src={imagePreview} className="mt-3 w-24 h-24 object-cover rounded-xl border border-blush/40" />}
            </div>
            {formError && <p className="text-xs text-red-400">{formError}</p>}
            {successMsg && <p className="text-xs text-green-600">{successMsg}</p>}
            <button type="submit" disabled={saving} className="w-full bg-brown text-cream font-bold py-3 rounded-full hover:bg-brown/80 transition-colors text-sm disabled:opacity-50">{saving ? 'Saving...' : 'Add Category'}</button>
          </form>
        </div>

        <div>
          <SectionHeader label="All Categories" title="Service Categories" />
          {isLoading && <div className="flex flex-col gap-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-blush/30 animate-pulse" />)}</div>}
          {!isLoading && (!categories || categories.length === 0) && <p className="text-sm font-medium text-brown/50">No categories yet.</p>}
          {!isLoading && categories && categories.length > 0 && (
            <div className="flex flex-col gap-3">
              {categories.map(cat => (
                <div key={cat.id} className="bg-white border border-blush/40 rounded-xl p-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-blush/20 shrink-0 border border-blush/30">
                      {cat.image_url ? (
                        <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-brown/30 text-xs font-semibold">N/A</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-brown truncate font-serif">{cat.name}</p>
                      {cat.description && <p className="text-xs font-medium text-brown/50 truncate">{cat.description}</p>}
                    </div>
                    <button onClick={() => confirm(`Delete "${cat.name}" and all its services?`) && deleteMutation.mutate(cat.id)} className="text-xs text-red-300 hover:text-red-500 font-bold transition-colors shrink-0">Delete</button>
                  </div>
                  <div className="mt-2 pt-2 border-t border-blush/20">
                    <button onClick={() => openEdit(cat)} className="text-xs bg-cream border border-blush/40 hover:border-gold/40 hover:text-gold text-taupe px-3 py-1 rounded-full transition-colors font-semibold">Edit</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {editCat && (
        <div className="fixed inset-0 z-50 bg-brown/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditCat(null)}>
          <div className="bg-cream rounded-2xl shadow-2xl w-full max-w-md p-7 border border-blush/40" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-5">
              <div><h2 className="font-serif text-xl font-black text-brown">Edit Category</h2><p className="text-xs font-medium text-brown/50 mt-0.5">{editCat.name}</p></div>
              <button onClick={() => setEditCat(null)} className="text-taupe hover:text-brown text-xl">X</button>
            </div>
            <div className="flex flex-col gap-4">
              <div><label className={label}>Name *</label><input value={editName} onChange={e => setEditName(e.target.value)} className={input} /></div>
              <div><label className={label}>Description</label><textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={2} className={`${input} resize-none`} /></div>
              <div>
                <label className={label}>New Image <span className="font-normal text-brown/40">(leave empty to keep current)</span></label>
                <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setEditImageFile(f); setEditImagePreview(URL.createObjectURL(f)) } }} className="w-full text-sm text-taupe file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-brown file:text-cream hover:file:bg-brown/80 cursor-pointer" />
                {(editImagePreview || editCat.image_url) && (
                  <img src={editImagePreview ?? editCat.image_url!} className="mt-3 w-24 h-24 object-cover rounded-xl border border-blush/40" />
                )}
              </div>
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