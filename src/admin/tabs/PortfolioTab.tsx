import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { PortfolioItem } from '../../types'
import { SectionHeader, input, label } from '../AdminCommon'

const fetchPortfolio = async (): Promise<PortfolioItem[]> => {
  const { data, error } = await supabase.from('portfolio_items').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export default function PortfolioTab() {
  const queryClient = useQueryClient()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const [editItem, setEditItem] = useState<PortfolioItem | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null)
  const [editUploading, setEditUploading] = useState(false)
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState('')

  const { data: items, isLoading } = useQuery({ queryKey: ['portfolio'], queryFn: fetchPortfolio })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('portfolio_items').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portfolio'] }),
  })

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(''); setSuccessMsg('')
    if (!title) { setFormError('Title is required.'); return }
    setUploading(true)
    let image_url: string | null = null
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const { error } = await supabase.storage.from('product-images').upload(fileName, imageFile)
      if (error) { setFormError('Image upload failed.'); setUploading(false); return }
      const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
      image_url = data.publicUrl
    }
    const { error } = await supabase.from('portfolio_items').insert([{ title, category: category || null, description: description || null, image_url }])
    if (error) { setFormError('Failed to save.'); setUploading(false); return }
    setTitle(''); setCategory(''); setDescription(''); setImageFile(null); setImagePreview(null)
    setUploading(false); setSuccessMsg('Portfolio item added!')
    queryClient.invalidateQueries({ queryKey: ['portfolio'] })
  }

  const openEdit = (item: PortfolioItem) => {
    setEditItem(item)
    setEditTitle(item.title)
    setEditCategory(item.category ?? '')
    setEditDescription(item.description ?? '')
    setEditImageFile(null)
    setEditImagePreview(null)
    setEditError(''); setEditSuccess('')
  }

  const handleEditSave = async () => {
    if (!editItem) return
    setEditError(''); setEditSuccess(''); setEditUploading(true)
    let image_url = editItem.image_url
    if (editImageFile) {
      const fileExt = editImageFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const { error } = await supabase.storage.from('product-images').upload(fileName, editImageFile)
      if (error) { setEditError('Image upload failed.'); setEditUploading(false); return }
      const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
      image_url = data.publicUrl
    }
    const { error } = await supabase.from('portfolio_items').update({
      title: editTitle,
      category: editCategory || null,
      description: editDescription || null,
      image_url,
    }).eq('id', editItem.id)
    if (error) { setEditError('Update failed.'); setEditUploading(false); return }
    setEditUploading(false); setEditSuccess('Updated!')
    queryClient.invalidateQueries({ queryKey: ['portfolio'] })
    setTimeout(() => setEditItem(null), 800)
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white border border-blush/40 rounded-2xl shadow-sm p-6">
          <SectionHeader label="New Item" title="Add Portfolio Item" />
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <div><label className={label}>Title *</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Bridal Glam Look" className={input} /></div>
            <div><label className={label}>Category</label><input value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Makeup, Nails, Skincare" className={input} /></div>
            <div><label className={label}>Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Short description..." className={`${input} resize-none`} /></div>
            <div>
              <label className={label}>Image</label>
              <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)) } }} className="w-full text-sm text-taupe file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-brown file:text-cream hover:file:bg-brown/80 cursor-pointer" />
              {imagePreview && <img src={imagePreview} className="mt-3 w-24 h-24 object-cover rounded-xl border border-blush/40" />}
            </div>
            {formError && <p className="text-xs text-red-400">{formError}</p>}
            {successMsg && <p className="text-xs text-green-600">{successMsg}</p>}
            <button type="submit" disabled={uploading} className="w-full bg-brown text-cream font-bold py-3 rounded-full hover:bg-brown/80 transition-colors text-sm disabled:opacity-50">{uploading ? 'Uploading...' : 'Add Item'}</button>
          </form>
        </div>

        <div>
          <SectionHeader label="Gallery" title="All Portfolio Items" />
          {isLoading && <div className="flex flex-col gap-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-blush/30 animate-pulse" />)}</div>}
          {!isLoading && (!items || items.length === 0) && <p className="text-sm font-medium text-brown/50">No portfolio items yet.</p>}
          {!isLoading && items && items.length > 0 && (
            <div className="flex flex-col gap-3">
              {items.map(item => (
                <div key={item.id} className="bg-white border border-blush/40 rounded-xl p-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-blush/20 shrink-0 border border-blush/30">
                      {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-brown/30 text-xs font-semibold">N/A</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-brown truncate font-serif">{item.title}</p>
                      {item.category && <p className="text-xs font-semibold text-gold">{item.category}</p>}
                    </div>
                    <button onClick={() => confirm(`Delete "${item.title}"?`) && deleteMutation.mutate(item.id)} className="text-xs text-red-300 hover:text-red-500 font-bold transition-colors shrink-0">Delete</button>
                  </div>
                  <div className="mt-2 pt-2 border-t border-blush/20">
                    <button
                      onClick={() => openEdit(item)}
                      className="text-xs bg-cream border border-blush/40 hover:border-gold/40 hover:text-gold text-taupe px-3 py-1 rounded-full transition-colors font-semibold"
                    >
                      Edit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 z-50 bg-brown/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditItem(null)}>
          <div className="bg-cream rounded-2xl shadow-2xl w-full max-w-md p-7 border border-blush/40" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-5">
              <div><h2 className="font-serif text-xl font-black text-brown">Edit Portfolio Item</h2><p className="text-xs font-medium text-brown/50 mt-0.5">{editItem.title}</p></div>
              <button onClick={() => setEditItem(null)} className="text-taupe hover:text-brown text-xl">Close</button>
            </div>
            <div className="flex flex-col gap-4">
              <div><label className={label}>Title *</label><input value={editTitle} onChange={e => setEditTitle(e.target.value)} className={input} /></div>
              <div><label className={label}>Category</label><input value={editCategory} onChange={e => setEditCategory(e.target.value)} placeholder="e.g. Makeup, Nails" className={input} /></div>
              <div><label className={label}>Description</label><textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={2} className={`${input} resize-none`} /></div>
              <div>
                <label className={label}>New Image <span className="font-normal text-brown/40">(leave empty to keep current)</span></label>
                <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setEditImageFile(f); setEditImagePreview(URL.createObjectURL(f)) } }} className="w-full text-sm text-taupe file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-brown file:text-cream hover:file:bg-brown/80 cursor-pointer" />
                {(editImagePreview || editItem.image_url) && <img src={editImagePreview ?? editItem.image_url!} className="mt-3 w-24 h-24 object-cover rounded-xl border border-blush/40" />}
              </div>
              {editError && <p className="text-xs text-red-400">{editError}</p>}
              {editSuccess && <p className="text-xs text-green-600">{editSuccess}</p>}
              <button onClick={handleEditSave} disabled={editUploading} className="w-full bg-brown text-cream font-bold py-3 rounded-full hover:bg-brown/80 transition-colors text-sm disabled:opacity-50">{editUploading ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}

    </>
  )
}
