import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import type { Product } from '../../types'
import { SectionHeader, input, label } from '../AdminCommon'
import { FiX } from 'react-icons/fi'

const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

type EditField = 'price' | 'price_image' | 'all'
interface EditState {
  product: Product; field: EditField
  name: string; description: string; price: string
  imageFile: File | null; imagePreview: string | null
}

export default function ProductsTab() {
  const queryClient = useQueryClient()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [editState, setEditState] = useState<EditState | null>(null)

  const { data: products, isLoading } = useQuery({ queryKey: ['products'], queryFn: fetchProducts })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const { error } = await supabase.storage.from('product-images').upload(fileName, file)
    if (error) throw error
    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
    return data.publicUrl
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(''); setSuccessMsg('')
    if (!name || !price) { setFormError('Name and price are required.'); return }
    setUploading(true)
    let image_url: string | null = null
    if (imageFile) {
      try { image_url = await uploadImage(imageFile) }
      catch { setFormError('Image upload failed.'); setUploading(false); return }
    }
    const { error } = await supabase.from('products').insert([{ name, description: description || null, price: parseFloat(price), image_url }])
    if (error) { setFormError('Failed to save product.'); setUploading(false); return }
    setName(''); setDescription(''); setPrice(''); setImageFile(null); setImagePreview(null)
    setUploading(false); setSuccessMsg('Product added!')
    queryClient.invalidateQueries({ queryKey: ['products'] })
  }

  

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* Add Form */}
      <div className="bg-white border border-blush/40 rounded-2xl shadow-sm p-6">
        <SectionHeader label="New Product" title="Add a Product" />
        <form onSubmit={handleUpload} className="flex flex-col gap-4">
          <div><label className={label}>Product Name *</label><input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Handmade Bracelet" className={input} /></div>
          <div><label className={label}>Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className={`${input} resize-none`} placeholder="Optional..." /></div>
          <div><label className={label}>Price (CAD) *</label><input value={price} onChange={e => setPrice(e.target.value)} type="number" min="0" step="0.01" placeholder="25.00" className={input} /></div>
          <div>
            <label className={label}>Product Image</label>
            <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)) } }} className="w-full text-sm text-taupe file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-brown file:text-cream hover:file:bg-brown/80 cursor-pointer" />
            {imagePreview && <img src={imagePreview} className="mt-3 w-24 h-24 object-cover rounded-xl border border-blush/40" />}
          </div>
          {formError && <p className="text-xs text-red-400">{formError}</p>}
          {successMsg && <p className="text-xs text-green-600">{successMsg}</p>}
          <button type="submit" disabled={uploading} className="w-full bg-brown text-cream font-bold py-3 rounded-full hover:bg-brown/80 transition-colors text-sm disabled:opacity-50">{uploading ? 'Uploading...' : 'Add Product'}</button>
        </form>
      </div>

      {/* Product List */}
      <div>
        <SectionHeader label="Inventory" title="All Products" />
        {isLoading && <div className="flex flex-col gap-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-blush/30 animate-pulse" />)}</div>}
        {!isLoading && (!products || products.length === 0) && <p className="text-sm font-medium text-brown/50">No products yet.</p>}
        {!isLoading && products && products.length > 0 && (
          <div className="flex flex-col gap-3">
            {products.map(p => (
              <div key={p.id} className="bg-white border border-blush/40 rounded-xl p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-blush/20 shrink-0 border border-blush/30">
                    {p.image_url ? <img src={p.image_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-brown/30 text-xs font-semibold">N/A</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-brown truncate font-serif">{p.name}</p>
                    <p className="text-xs font-semibold text-brown/50">${p.price.toFixed(2)} CAD</p>
                  </div>
                  <button onClick={() => confirm(`Delete "${p.name}"?`) && deleteMutation.mutate(p.id)} className="text-xs text-red-300 hover:text-red-500 font-bold transition-colors shrink-0">Delete</button>
                </div>
                <div className="flex gap-2 mt-2 pt-2 border-t border-blush/20 flex-wrap">
                  <span className="text-xs text-brown/40 self-center font-semibold mr-1">Edit:</span>
                  {(['price', 'price_image', 'all'] as EditField[]).map((f, i) => (
                    <button key={f} onClick={() => setEditState({ product: p, field: f, name: p.name, description: p.description ?? '', price: p.price.toString(), imageFile: null, imagePreview: null })} className="text-xs bg-cream border border-blush/40 hover:border-gold/40 hover:text-gold text-taupe px-3 py-1 rounded-full transition-colors font-semibold">
                      {['Price only', 'Price + Image', 'Everything'][i]}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editState && (
        <div className="fixed inset-0 z-50 bg-brown/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditState(null)}>
          <div className="bg-cream rounded-2xl shadow-2xl w-full max-w-md p-7 border border-blush/40" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-5">
              <div><h2 className="font-serif text-xl font-black text-brown">Edit Product</h2><p className="text-xs font-medium text-brown/50 mt-0.5">{editState.product.name}</p></div>
              <button onClick={() => setEditState(null)} className="text-taupe hover:text-brown text-xl"><FiX /></button>
            </div>
            <div className="flex flex-col gap-4">
              {editState.field === 'all' && (<><div><label className={label}>Name</label><input value={editState.name} onChange={e => setEditState({ ...editState, name: e.target.value })} className={input} /></div><div><label className={label}>Description</label><textarea value={editState.description} onChange={e => setEditState({ ...editState, description: e.target.value })} rows={2} className={`${input} resize-none`} /></div></>) }
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
