import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Product } from '../types'

const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

type EditField = 'price' | 'price_image' | 'all'

interface EditState {
  product: Product
  field: EditField
  name: string
  description: string
  price: string
  imageFile: File | null
  imagePreview: string | null
}

function NewsletterSubscribers() {
  const [subscribers, setSubscribers] = useState<{ id: string; email: string; subscribed_at: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('newsletter_subscribers')
      .select('*')
      .order('subscribed_at', { ascending: false })
      .then(({ data }) => {
        if (data) setSubscribers(data)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="h-16 rounded-xl bg-blush/30 animate-pulse" />

  if (subscribers.length === 0)
    return <p className="text-sm text-taupe">No subscribers yet.</p>

  return (
    <div className="bg-white border border-blush/40 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 border-b border-blush/20">
        <p className="text-xs text-taupe">{subscribers.length} subscriber{subscribers.length !== 1 ? 's' : ''}</p>
      </div>
      <div className="divide-y divide-blush/20 max-h-72 overflow-y-auto">
        {subscribers.map(s => (
          <div key={s.id} className="flex items-center justify-between px-5 py-3">
            <p className="text-sm text-brown">{s.email}</p>
            <p className="text-xs text-taupe">
              {new Date(s.subscribed_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate('/admin')
    })
  }, [navigate])

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editState) return
    setEditState({ ...editState, imageFile: file, imagePreview: URL.createObjectURL(file) })
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setSuccessMsg('')
    if (!name || !price) { setFormError('Name and price are required.'); return }
    setUploading(true)
    let image_url: string | null = null

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const { error: storageError } = await supabase.storage
        .from('product-images').upload(fileName, imageFile)
      if (storageError) { setFormError('Image upload failed.'); setUploading(false); return }
      const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName)
      image_url = urlData.publicUrl
    }

    const { error: insertError } = await supabase.from('products').insert([{
      name, description: description || null, price: parseFloat(price), image_url,
    }])

    if (insertError) { setFormError('Failed to save product.'); setUploading(false); return }

    setName(''); setDescription(''); setPrice('')
    setImageFile(null); setImagePreview(null)
    setUploading(false)
    setSuccessMsg('Product added successfully!')
    queryClient.invalidateQueries({ queryKey: ['products'] })
  }

  const openEdit = (product: Product, field: EditField) => {
    setEditError(''); setEditSuccess('')
    setEditState({
      product, field,
      name: product.name,
      description: product.description ?? '',
      price: product.price.toString(),
      imageFile: null, imagePreview: null,
    })
  }

  const handleEditSave = async () => {
    if (!editState) return
    setEditError(''); setEditSuccess(''); setEditUploading(true)
    const updates: Partial<Product> = {}

    if (editState.field === 'price') {
      updates.price = parseFloat(editState.price)
    }

    if (editState.field === 'price_image' || editState.field === 'all') {
      updates.price = parseFloat(editState.price)
      if (editState.field === 'all') {
        updates.name = editState.name
        updates.description = editState.description || null
      }
      if (editState.imageFile) {
        const fileExt = editState.imageFile.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const { error: storageError } = await supabase.storage
          .from('product-images').upload(fileName, editState.imageFile)
        if (storageError) { setEditError('Image upload failed.'); setEditUploading(false); return }
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName)
        updates.image_url = urlData.publicUrl
      }
    }

    const { error } = await supabase.from('products').update(updates).eq('id', editState.product.id)
    if (error) { setEditError('Update failed.'); setEditUploading(false); return }

    setEditUploading(false)
    setEditSuccess('Product updated!')
    queryClient.invalidateQueries({ queryKey: ['products'] })
    setTimeout(() => setEditState(null), 1000)
  }

  return (
    <div className="min-h-screen bg-cream">

      {/* Header */}
      <div className="bg-brown border-b border-cream/10">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-xl font-bold text-cream">Admin Dashboard</h1>
            <p className="text-cream/50 text-xs mt-0.5">Manage your products</p>
          </div>
          <button
            onClick={async () => { await supabase.auth.signOut(); navigate('/admin') }}
            className="text-xs font-medium text-blush hover:text-cream transition-colors border border-blush/30 px-4 py-2 rounded-full hover:border-blush/60"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Newsletter Subscribers */}
        <div className="mt-14">
          <div className="mb-5">
            <span className="text-xs font-semibold text-gold uppercase tracking-widest">Email List</span>
            <h2 className="font-serif text-xl font-bold text-brown mt-1">Newsletter Subscribers</h2>
          </div>
          <NewsletterSubscribers />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mt-14">

          {/* Add Product Form */}
          <div className="bg-white border border-blush/40 rounded-2xl shadow-sm p-7">
            <div className="mb-6">
              <span className="text-xs font-semibold text-gold uppercase tracking-widest">New Product</span>
              <h2 className="font-serif text-xl font-bold text-brown mt-1">Add a Product</h2>
            </div>

            <form onSubmit={handleUpload} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-brown block mb-1">Product Name *</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Handmade Bracelet"
                  className="w-full border border-blush rounded-lg px-3 py-2.5 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-gold/40 text-brown placeholder:text-taupe/50"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-brown block mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Optional product description..."
                  className="w-full border border-blush rounded-lg px-3 py-2.5 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-gold/40 text-brown placeholder:text-taupe/50 resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-brown block mb-1">Price (CAD) *</label>
                <input
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g. 25.00"
                  className="w-full border border-blush rounded-lg px-3 py-2.5 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-gold/40 text-brown placeholder:text-taupe/50"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-brown block mb-1">Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-sm text-taupe file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-brown file:text-cream hover:file:bg-brown/80 cursor-pointer"
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-3 w-28 h-28 object-cover rounded-xl border border-blush/40"
                  />
                )}
              </div>

              {formError && <p className="text-xs text-red-400">{formError}</p>}
              {successMsg && <p className="text-xs text-green-600">{successMsg}</p>}

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-brown text-cream font-medium py-3 rounded-full hover:bg-brown/80 transition-colors text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              >
                {uploading ? 'Uploading...' : 'Add Product'}
              </button>
            </form>
          </div>

          {/* Product List */}
          <div>
            <div className="mb-6">
              <span className="text-xs font-semibold text-gold uppercase tracking-widest">Inventory</span>
              <h2 className="font-serif text-xl font-bold text-brown mt-1">All Products</h2>
            </div>

            {isLoading && (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-20 rounded-xl bg-blush/30 animate-pulse" />
                ))}
              </div>
            )}

            {!isLoading && (!products || products.length === 0) && (
              <div className="text-center py-16 border border-blush/40 rounded-2xl bg-white">
                <p className="text-taupe text-sm">No products yet. Add your first one!</p>
              </div>
            )}

            {!isLoading && products && products.length > 0 && (
              <div className="flex flex-col gap-3">
                {products.map(product => (
                  <div
                    key={product.id}
                    className="bg-white border border-blush/40 rounded-xl p-4 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      {/* Thumbnail */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-blush/20 shrink-0 border border-blush/30">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-taupe/40 text-xs">
                            N/A
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-brown truncate font-serif">
                          {product.name}
                        </p>
                        <p className="text-xs text-taupe mt-0.5">
                          ${product.price.toFixed(2)} CAD
                        </p>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${product.name}"?`)) {
                            deleteMutation.mutate(product.id)
                          }
                        }}
                        className="text-xs text-red-300 hover:text-red-500 font-medium transition-colors shrink-0"
                      >
                        Delete
                      </button>
                    </div>

                    {/* Edit Options */}
                    <div className="flex gap-2 mt-3 pt-3 border-t border-blush/20 flex-wrap">
                      <span className="text-xs text-taupe/60 self-center mr-1">Edit:</span>
                      {(
                        [
                          { field: 'price' as EditField, label: 'Price only' },
                          { field: 'price_image' as EditField, label: 'Price + Image' },
                          { field: 'all' as EditField, label: 'Everything' },
                        ]
                      ).map(opt => (
                        <button
                          key={opt.field}
                          onClick={() => openEdit(product, opt.field)}
                          className="text-xs bg-cream border border-blush/40 hover:border-gold/40 hover:text-gold text-taupe px-3 py-1 rounded-full transition-colors"
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Edit Modal */}
      {editState && (
        <div
          className="fixed inset-0 z-50 bg-brown/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setEditState(null)}
        >
          <div
            className="bg-cream rounded-2xl shadow-2xl w-full max-w-md p-7 border border-blush/40"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-serif text-xl font-bold text-brown">Edit Product</h2>
                <p className="text-xs text-taupe mt-0.5">{editState.product.name}</p>
              </div>
              <button
                onClick={() => setEditState(null)}
                className="text-taupe hover:text-brown transition-colors text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {editState.field === 'all' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-brown block mb-1">Product Name</label>
                    <input
                      value={editState.name}
                      onChange={e => setEditState({ ...editState, name: e.target.value })}
                      className="w-full border border-blush rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold/40 text-brown"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-brown block mb-1">Description</label>
                    <textarea
                      value={editState.description}
                      onChange={e => setEditState({ ...editState, description: e.target.value })}
                      rows={3}
                      className="w-full border border-blush rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold/40 text-brown resize-none"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-sm font-medium text-brown block mb-1">Price (CAD)</label>
                <input
                  value={editState.price}
                  onChange={e => setEditState({ ...editState, price: e.target.value })}
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full border border-blush rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold/40 text-brown"
                />
              </div>

              {(editState.field === 'price_image' || editState.field === 'all') && (
                <div>
                  <label className="text-sm font-medium text-brown block mb-1">
                    New Image{' '}
                    <span className="text-taupe font-normal">(leave empty to keep current)</span>
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleEditImageChange}
                    className="w-full text-sm text-taupe file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-brown file:text-cream hover:file:bg-brown/80 cursor-pointer"
                  />
                  {(editState.imagePreview || editState.product.image_url) && (
                    <img
                      src={editState.imagePreview ?? editState.product.image_url!}
                      alt="Preview"
                      className="mt-3 w-28 h-28 object-cover rounded-xl border border-blush/40"
                    />
                  )}
                </div>
              )}

              {editError && <p className="text-xs text-red-400">{editError}</p>}
              {editSuccess && <p className="text-xs text-green-600">{editSuccess}</p>}

              <button
                onClick={handleEditSave}
                disabled={editUploading}
                className="w-full bg-brown text-cream font-medium py-3 rounded-full hover:bg-brown/80 transition-colors text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed mt-1"
              >
                {editUploading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}