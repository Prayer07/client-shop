import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Product, PortfolioItem, Service } from '../types'

// ─── FETCH FUNCTIONS ──────────────────────────────────────────────────────────
const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}
const fetchPortfolio = async (): Promise<PortfolioItem[]> => {
  const { data, error } = await supabase.from('portfolio_items').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}
const fetchServices = async (): Promise<Service[]> => {
  const { data, error } = await supabase.from('services').select('*').order('display_order', { ascending: true })
  if (error) throw error
  return data
}
const fetchSettings = async (): Promise<Record<string, string>> => {
  const { data, error } = await supabase.from('site_settings').select('id, value')
  if (error) throw error
  return Object.fromEntries(data.map(r => [r.id, r.value]))
}
const fetchEnquiries = async () => {
  const { data, error } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}
const fetchConsultations = async () => {
  const { data, error } = await supabase.from('pre_consultations').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-6">
      <span className="text-xs font-bold text-gold uppercase tracking-widest">{label}</span>
      <h2 className="font-serif text-xl font-black text-brown mt-1">{title}</h2>
    </div>
  )
}

const input = 'w-full border border-blush rounded-lg px-3 py-2.5 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-gold/40 text-brown font-medium placeholder:text-taupe/40'
const label = 'text-sm font-bold text-brown block mb-1'

// ─── TAB TYPE ─────────────────────────────────────────────────────────────────
type Tab = 'products' | 'portfolio' | 'services' | 'settings' | 'enquiries' | 'subscribers' | 'account'

const tabs: { id: Tab; label: string }[] = [
  { id: 'products', label: 'Products' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'services', label: 'Services' },
  { id: 'settings', label: 'Site Settings' },
  { id: 'enquiries', label: 'Enquiries' },
  { id: 'subscribers', label: 'Subscribers' },
  { id: 'account', label: 'Account' },
]

// ─── PRODUCTS TAB ─────────────────────────────────────────────────────────────
type EditField = 'price' | 'price_image' | 'all'
interface EditState {
  product: Product; field: EditField
  name: string; description: string; price: string
  imageFile: File | null; imagePreview: string | null
}

function ProductsTab() {
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
  const [editUploading, setEditUploading] = useState(false)
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState('')

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

  const handleEditSave = async () => {
    if (!editState) return
    setEditError(''); setEditSuccess(''); setEditUploading(true)
    const updates: Partial<Product> = {}
    if (editState.field === 'price') updates.price = parseFloat(editState.price)
    if (editState.field === 'price_image' || editState.field === 'all') {
      updates.price = parseFloat(editState.price)
      if (editState.field === 'all') { updates.name = editState.name; updates.description = editState.description || null }
      if (editState.imageFile) {
        try { updates.image_url = await uploadImage(editState.imageFile) }
        catch { setEditError('Image upload failed.'); setEditUploading(false); return }
      }
    }
    const { error } = await supabase.from('products').update(updates).eq('id', editState.product.id)
    if (error) { setEditError('Update failed.'); setEditUploading(false); return }
    setEditUploading(false); setEditSuccess('Updated!')
    queryClient.invalidateQueries({ queryKey: ['products'] })
    setTimeout(() => setEditState(null), 800)
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
              <button onClick={() => setEditState(null)} className="text-taupe hover:text-brown text-xl">✕</button>
            </div>
            <div className="flex flex-col gap-4">
              {editState.field === 'all' && (<><div><label className={label}>Name</label><input value={editState.name} onChange={e => setEditState({ ...editState, name: e.target.value })} className={input} /></div><div><label className={label}>Description</label><textarea value={editState.description} onChange={e => setEditState({ ...editState, description: e.target.value })} rows={2} className={`${input} resize-none`} /></div></>)}
              <div><label className={label}>Price (CAD)</label><input value={editState.price} onChange={e => setEditState({ ...editState, price: e.target.value })} type="number" min="0" step="0.01" className={input} /></div>
              {(editState.field === 'price_image' || editState.field === 'all') && (
                <div>
                  <label className={label}>New Image <span className="font-normal text-brown/40">(optional)</span></label>
                  <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f && editState) setEditState({ ...editState, imageFile: f, imagePreview: URL.createObjectURL(f) }) }} className="w-full text-sm text-taupe file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-brown file:text-cream hover:file:bg-brown/80 cursor-pointer" />
                  {(editState.imagePreview || editState.product.image_url) && <img src={editState.imagePreview ?? editState.product.image_url!} className="mt-3 w-24 h-24 object-cover rounded-xl border border-blush/40" />}
                </div>
              )}
              {editError && <p className="text-xs text-red-400">{editError}</p>}
              {editSuccess && <p className="text-xs text-green-600">{editSuccess}</p>}
              <button onClick={handleEditSave} disabled={editUploading} className="w-full bg-brown text-cream font-bold py-3 rounded-full hover:bg-brown/80 transition-colors text-sm disabled:opacity-50">{editUploading ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── PORTFOLIO TAB ────────────────────────────────────────────────────────────
function PortfolioTab() {
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
              <button onClick={() => setEditItem(null)} className="text-taupe hover:text-brown text-xl">✕</button>
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

// ─── SERVICES TAB ─────────────────────────────────────────────────────────────
function ServicesTab() {
  const queryClient = useQueryClient()
  // const [emoji, setEmoji] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState('')
  const [price, setPrice] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const [editService, setEditService] = useState<Service | null>(null)
  // const [editEmoji, setEditEmoji] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editDuration, setEditDuration] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState('')

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
    if (!title) { setFormError('Title is required.'); return }
    setSaving(true)
    const display_order = (services?.length ?? 0) + 1
    const { error } = await supabase.from('services').insert([{ title, description: description || null, duration: duration || null, price: price || null, display_order }])
    if (error) { setFormError('Failed to save service.'); setSaving(false); return }
    setTitle(''); setDescription(''); setDuration(''); setPrice('')
    setSaving(false); setSuccessMsg('Service added!')
    queryClient.invalidateQueries({ queryKey: ['services'] })
  }

  const openEdit = (s: Service) => {
    setEditService(s)
    // setEditEmoji(s.emoji ?? '')
    setEditTitle(s.title)
    setEditDescription(s.description ?? '')
    setEditDuration(s.duration ?? '')
    setEditPrice(s.price ?? '')
    setEditError(''); setEditSuccess('')
  }

  const handleEditSave = async () => {
    if (!editService) return
    setEditError(''); setEditSuccess(''); setEditSaving(true)
    const { error } = await supabase.from('services').update({
      // emoji: editEmoji || null,
      title: editTitle,
      description: editDescription || null,
      duration: editDuration || null,
      price: editPrice || null,
    }).eq('id', editService.id)
    if (error) { setEditError('Update failed.'); setEditSaving(false); return }
    setEditSaving(false); setEditSuccess('Updated!')
    queryClient.invalidateQueries({ queryKey: ['services'] })
    setTimeout(() => setEditService(null), 800)
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white border border-blush/40 rounded-2xl shadow-sm p-6">
          <SectionHeader label="New Service" title="Add a Service" />
          <form onSubmit={handleAdd} className="flex flex-col gap-4">
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-3"><label className={label}>Service Title *</label><input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Massage Therapy" className={input} /></div>
            </div>
            <div><label className={label}>Description</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="What does this service include?" className={`${input} resize-none`} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={label}>Duration</label><input value={duration} onChange={e => setDuration(e.target.value)} placeholder="e.g. 60 mins" className={input} /></div>
              <div><label className={label}>Price</label><input value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g. From $85" className={input} /></div>
            </div>
            {formError && <p className="text-xs text-red-400">{formError}</p>}
            {successMsg && <p className="text-xs text-green-600">{successMsg}</p>}
            <button type="submit" disabled={saving} className="w-full bg-brown text-cream font-bold py-3 rounded-full hover:bg-brown/80 transition-colors text-sm disabled:opacity-50">{saving ? 'Saving...' : 'Add Service'}</button>
          </form>
        </div>

        <div>
          <SectionHeader label="Menu" title="All Services" />
          {isLoading && <div className="flex flex-col gap-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-blush/30 animate-pulse" />)}</div>}
          {!isLoading && (!services || services.length === 0) && <p className="text-sm font-medium text-brown/50">No services yet.</p>}
          {!isLoading && services && services.length > 0 && (
            <div className="flex flex-col gap-3">
              {services.map(s => (
                <div key={s.id} className="bg-white border border-blush/40 rounded-xl p-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    {/* <div className="w-10 h-10 rounded-full bg-blush/30 flex items-center justify-center text-xl shrink-0">{s.emoji ?? '✨'}</div> */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-brown truncate font-serif">{s.title}</p>
                      <p className="text-xs font-semibold text-brown/50">{s.duration}{s.price && ` · ${s.price}`}</p>
                    </div>
                    <button onClick={() => confirm(`Delete "${s.title}"?`) && deleteMutation.mutate(s.id)} className="text-xs text-red-300 hover:text-red-500 font-bold transition-colors shrink-0">Delete</button>
                  </div>
                  <div className="mt-2 pt-2 border-t border-blush/20">
                    <button
                      onClick={() => openEdit(s)}
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
      {editService && (
        <div className="fixed inset-0 z-50 bg-brown/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditService(null)}>
          <div className="bg-cream rounded-2xl shadow-2xl w-full max-w-md p-7 border border-blush/40" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-5">
              <div><h2 className="font-serif text-xl font-black text-brown">Edit Service</h2><p className="text-xs font-medium text-brown/50 mt-0.5">{editService.title}</p></div>
              <button onClick={() => setEditService(null)} className="text-taupe hover:text-brown text-xl">✕</button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-4 gap-3">
                {/* <div className="col-span-1"><label className={label}>Emoji</label><input value={editEmoji} onChange={e => setEditEmoji(e.target.value)} placeholder="💆‍♀️" className={input} /></div> */}
                <div className="col-span-3"><label className={label}>Title *</label><input value={editTitle} onChange={e => setEditTitle(e.target.value)} className={input} /></div>
              </div>
              <div><label className={label}>Description</label><textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={2} className={`${input} resize-none`} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={label}>Duration</label><input value={editDuration} onChange={e => setEditDuration(e.target.value)} placeholder="e.g. 60 mins" className={input} /></div>
                <div><label className={label}>Price</label><input value={editPrice} onChange={e => setEditPrice(e.target.value)} placeholder="e.g. From $85" className={input} /></div>
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

function LogoUpload({ onUploaded, currentUrl }: { onUploaded: (url: string) => void; currentUrl?: string }) {
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
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        className="w-full text-sm text-taupe file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-brown file:text-cream hover:file:bg-brown/80 cursor-pointer disabled:opacity-50"
      />
      <p className="text-xs text-brown/40 mt-2">Preview shown on dark background to simulate the navbar.</p>
      {uploading && <p className="text-xs text-brown/50 mt-2">Uploading...</p>}
      {success && <p className="text-xs text-green-600 mt-2">{success}</p>}
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  )
}

function AboutImageUpload({ onUploaded }: { onUploaded: (url: string) => void }) {
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

    const { error: storageError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file)

    if (storageError) { setError('Upload failed.'); setUploading(false); return }

    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName)
    onUploaded(data.publicUrl)
    setUploading(false)
    setSuccess('Photo uploaded! Hit Save All Settings to apply.')
  }

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        className="w-full text-sm text-taupe file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-brown file:text-cream hover:file:bg-brown/80 cursor-pointer disabled:opacity-50"
      />
      {preview && (
        <img src={preview} className="mt-3 w-24 h-24 rounded-full object-cover border-2 border-blush" />
      )}
      {uploading && <p className="text-xs text-brown/50 mt-2">Uploading...</p>}
      {success && <p className="text-xs text-green-600 mt-2">{success}</p>}
      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
    </div>
  )
}
// ─── SETTINGS TAB ─────────────────────────────────────────────────────────────
function SettingsTab() {
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

  const fields: { key: string; label: string; type?: string; placeholder?: string }[][] = [
    [
      { key: 'logo_url', label: 'Logo URL', placeholder: 'Will be auto-filled when you upload below' },
      { key: 'brand_name', label: 'Brand Name', placeholder: 'e.g. Lammy De Beauty Spa' },
      { key: 'hero_headline', label: 'Hero Headline', placeholder: 'Main headline on the homepage' },
      { key: 'hero_tagline', label: 'Hero Tagline', placeholder: 'Short description under the headline' },
      { key: 'about_text', label: 'About Section Text', placeholder: 'Tell your story...' },
      { key: 'about_image', label: 'About Section Photo / Brand Logo', placeholder: 'Paste image URL or upload below' },
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
      <p className="text-sm font-medium text-brown/60 mb-8 -mt-2">
        Update these settings to customize your website. Changes go live immediately after saving.
      </p>

      <div className="flex flex-col gap-8">
        {fields.map((group, gi) => (
          <div key={gi} className="bg-white border border-blush/40 rounded-2xl shadow-sm p-6">
            <h3 className="font-serif font-black text-brown text-base mb-5">{sectionTitles[gi]}</h3>
            <div className="flex flex-col gap-4">
              {group.map(field => (
                <div key={field.key}>
                  <label className={label}>{field.label}</label>
                  {field.key === 'hero_tagline' || field.key === 'about_text' ? (
                    <textarea
                      value={values[field.key] ?? ''}
                      onChange={e => set(field.key, e.target.value)}
                      rows={3}
                      placeholder={field.placeholder}
                      className={`${input} resize-none`}
                    />
                  ) : (
                    <input
                      value={values[field.key] ?? ''}
                      onChange={e => set(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className={input}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && <p className="text-xs text-red-400 mt-4">{error}</p>}
      {successMsg && <p className="text-xs text-green-600 mt-4">{successMsg}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-6 w-full bg-brown text-cream font-bold py-3.5 rounded-full hover:bg-brown/80 transition-colors text-sm tracking-wide disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save All Settings'}
      </button>

      {/* About Image Upload */}
      <div className="mt-6 bg-white border border-blush/40 rounded-2xl shadow-sm p-6">
        <h3 className="font-serif font-black text-brown text-base mb-4">Upload About Photo</h3>
        <p className="text-xs font-medium text-brown/50 mb-4">
          Upload a photo / logo and it will set the About Section Photo URL automatically.
        </p>
        <AboutImageUpload onUploaded={(url) => setValues(prev => ({ ...prev, about_image: url }))} />
      </div>
      
      {/* Logo Upload */}
      <div className="mt-6 bg-white border border-blush/40 rounded-2xl shadow-sm p-6">
        <h3 className="font-serif font-black text-brown text-base mb-2">Upload Logo</h3>
        <p className="text-xs font-medium text-brown/50 mb-4">
          Upload your brand logo. It will appear in the navbar and replace the text brand name.
          Recommended: PNG with transparent background.
        </p>
        <LogoUpload onUploaded={(url) => setValues(prev => ({ ...prev, logo_url: url }))} currentUrl={values['logo_url']} />
      </div>

    </div>
  )
}

// ─── ENQUIRIES TAB ────────────────────────────────────────────────────────────
function EnquiriesTab() {
  const queryClient = useQueryClient()
  const { data: enquiries, isLoading } = useQuery({ queryKey: ['enquiries'], queryFn: fetchEnquiries })

  const deleteEnquiry = async (id: string) => {
    if (!confirm('Delete this enquiry?')) return
    await supabase.from('enquiries').delete().eq('id', id)
    queryClient.invalidateQueries({ queryKey: ['enquiries'] })
  }

  const deleteConsultation = async (id: string) => {
    if (!confirm('Delete this consultation?')) return
    await supabase.from('pre_consultations').delete().eq('id', id)
    queryClient.invalidateQueries({ queryKey: ['consultations'] })
  }

  return (
    <div>
      <SectionHeader label="Inbox" title="Enquiries & Consultations" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

        {/* Enquiries */}
        <div>
          <h3 className="font-serif font-black text-brown text-base mb-4">Contact Form</h3>
          {isLoading && <div className="flex flex-col gap-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-blush/30 animate-pulse" />)}</div>}
          {!isLoading && (!enquiries || enquiries.length === 0) && <p className="text-sm font-medium text-brown/50">No enquiries yet.</p>}
          {!isLoading && enquiries && enquiries.length > 0 && (
            <div className="flex flex-col gap-3">
              {enquiries.map((e: any) => (
                <div key={e.id} className="bg-white border border-blush/40 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-sm font-black text-brown font-serif">{e.name}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <p className="text-xs font-medium text-brown/40">{new Date(e.created_at).toLocaleDateString()}</p>
                      <button
                        onClick={() => deleteEnquiry(e.id)}
                        className="text-xs text-red-300 hover:text-red-500 font-bold transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-gold mb-1">{e.subject}</p>
                  <p className="text-xs font-medium text-brown/60 leading-relaxed">{e.message}</p>
                  <p className="text-xs font-semibold text-brown/40 mt-2">{e.email}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Consultations */}
        <ConsultationsPanel onDelete={deleteConsultation} />
      </div>
    </div>
  )
}

function ConsultationsPanel({ onDelete }: { onDelete: (id: string) => void }) {
  const { data, isLoading } = useQuery({ queryKey: ['consultations'], queryFn: fetchConsultations })

  return (
    <div>
      <h3 className="font-serif font-black text-brown text-base mb-4">Pre-Consultations</h3>
      {isLoading && <div className="flex flex-col gap-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-blush/30 animate-pulse" />)}</div>}
      {!isLoading && (!data || data.length === 0) && <p className="text-sm font-medium text-brown/50">No consultations yet.</p>}
      {!isLoading && data && data.length > 0 && (
        <div className="flex flex-col gap-3">
          {data.map((c: any) => (
            <div key={c.id} className="bg-white border border-blush/40 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-black text-brown font-serif">{c.full_name}</p>
                <div className="flex items-center gap-2 shrink-0">
                  <p className="text-xs font-medium text-brown/40">{new Date(c.created_at).toLocaleDateString()}</p>
                  <button
                    onClick={() => onDelete(c.id)}
                    className="text-xs text-red-300 hover:text-red-500 font-bold transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-xs font-semibold text-gold mb-1">{c.service_interest}</p>
              <p className="text-xs font-medium text-brown/60">{c.email} · {c.phone}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── SUBSCRIBERS TAB ──────────────────────────────────────────────────────────
function SubscribersTab() {
  const [subscribers, setSubscribers] = useState<{ id: string; email: string; subscribed_at: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('newsletter_subscribers').select('*').order('subscribed_at', { ascending: false })
      .then(({ data }) => { if (data) setSubscribers(data); setLoading(false) })
  }, [])

  return (
    <div>
      <SectionHeader label="Email List" title="Newsletter Subscribers" />
      {loading && <div className="h-16 rounded-xl bg-blush/30 animate-pulse" />}
      {!loading && subscribers.length === 0 && <p className="text-sm font-medium text-brown/50">No subscribers yet.</p>}
      {!loading && subscribers.length > 0 && (
        <div className="bg-white border border-blush/40 rounded-2xl shadow-sm overflow-hidden max-w-xl">
          <div className="px-5 py-3 border-b border-blush/20 flex items-center justify-between">
            <p className="text-xs font-bold text-brown/50">{subscribers.length} subscriber{subscribers.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="divide-y divide-blush/20 max-h-96 overflow-y-auto">
            {subscribers.map(s => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3">
                <p className="text-sm font-semibold text-brown">{s.email}</p>
                <p className="text-xs font-medium text-brown/40">{new Date(s.subscribed_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AccountTab() {
  const [email, setEmail] = useState('')
  const [emailMsg, setEmailMsg] = useState('')
  const [emailError, setEmailError] = useState('')
  const [emailLoading, setEmailLoading] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passMsg, setPassMsg] = useState('')
  const [passError, setPassError] = useState('')
  const [passLoading, setPassLoading] = useState(false)

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailMsg(''); setEmailError('')
    if (!email) { setEmailError('Enter a new email address.'); return }
    setEmailLoading(true)
    const { error } = await supabase.auth.updateUser({ email })
    if (error) { setEmailError(error.message); setEmailLoading(false); return }
    setEmailLoading(false)
    setEmail('')
    setEmailMsg('Confirmation sent to your new email. Check your inbox to confirm the change.')
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPassMsg(''); setPassError('')
    if (!currentPassword || !newPassword || !confirmPassword) { setPassError('Fill in all fields.'); return }
    if (newPassword.length < 6) { setPassError('Password must be at least 6 characters.'); return }
    if (newPassword !== confirmPassword) { setPassError('Passwords do not match.'); return }
    setPassLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) { setPassError(error.message); setPassLoading(false); return }
    setPassLoading(false)
    setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
    setPassMsg('Password updated successfully!')
  }

  return (
    <div className="max-w-md">
      <SectionHeader label="Security" title="Account Settings" />

      {/* Change Email */}
      <div className="bg-white border border-blush/40 rounded-2xl shadow-sm p-6 mb-6">
        <h3 className="font-serif font-black text-brown text-base mb-1">Change Email</h3>
        <p className="text-xs font-medium text-brown/50 mb-5">
          A confirmation link will be sent to your new email address.
        </p>
        <form onSubmit={handleEmailChange} className="flex flex-col gap-4">
          <div>
            <label className={label}>New Email Address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="newemail@example.com"
              className={input}
            />
          </div>
          {emailError && <p className="text-xs text-red-400">{emailError}</p>}
          {emailMsg && <p className="text-xs text-green-600">{emailMsg}</p>}
          <button
            type="submit"
            disabled={emailLoading}
            className="w-full bg-brown text-cream font-bold py-3 rounded-full hover:bg-brown/80 transition-colors text-sm disabled:opacity-50"
          >
            {emailLoading ? 'Sending...' : 'Update Email'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white border border-blush/40 rounded-2xl shadow-sm p-6">
        <h3 className="font-serif font-black text-brown text-base mb-1">Change Password</h3>
        <p className="text-xs font-medium text-brown/50 mb-5">
          Choose a strong password of at least 6 characters.
        </p>
        <form onSubmit={handlePasswordChange} className="flex flex-col gap-4">
          <div>
            <label className={label}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className={input}
            />
          </div>
          <div>
            <label className={label}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className={input}
            />
          </div>
          {passError && <p className="text-xs text-red-400">{passError}</p>}
          {passMsg && <p className="text-xs text-green-600">{passMsg}</p>}
          <button
            type="submit"
            disabled={passLoading}
            className="w-full bg-brown text-cream font-bold py-3 rounded-full hover:bg-brown/80 transition-colors text-sm disabled:opacity-50"
          >
            {passLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('products')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate('/admin')
    })
  }, [navigate])

  return (
    <div className="min-h-screen bg-cream">

      {/* Header */}
      <div className="bg-brown border-b border-cream/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-xl font-black text-cream">Admin Dashboard</h1>
            <p className="text-cream/50 text-xs font-medium mt-0.5">Manage your entire website from here</p>
          </div>
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate('/admin') }}
            className="text-xs font-bold text-blush hover:text-cream transition-colors border border-blush/30 px-4 py-2 rounded-full hover:border-blush/60"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Tabs */}
        <div className="flex gap-2 flex-wrap mb-10">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold transition-all border ${
                activeTab === tab.id
                  ? 'bg-brown text-cream border-brown shadow-md'
                  : 'bg-white text-taupe border-blush/40 hover:border-gold/40 hover:text-brown'
              }`}
            >
              {/* <span>{tab.emoji}</span> */}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'products' && <ProductsTab />}
        {activeTab === 'portfolio' && <PortfolioTab />}
        {activeTab === 'services' && <ServicesTab />}
        {activeTab === 'settings' && <SettingsTab />}
        {activeTab === 'enquiries' && <EnquiriesTab />}
        {activeTab === 'subscribers' && <SubscribersTab />}
        {activeTab === 'account' && <AccountTab />}

      </div>
    </div>
  )
}