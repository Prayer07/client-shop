import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Product, PortfolioItem } from '../types'

// ─── Fetch helpers ───────────────────────────────────────────────
const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

const fetchPortfolio = async (): Promise<PortfolioItem[]> => {
  const { data, error } = await supabase
    .from('portfolio_items')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

// ─── Types ───────────────────────────────────────────────────────
type EditField = 'price' | 'price_image' | 'all'

interface ProductEditState {
  product: Product
  field: EditField
  name: string
  description: string
  price: string
  imageFile: File | null
  imagePreview: string | null
}

interface PortfolioEditState {
  item: PortfolioItem
  title: string
  category: string
  description: string
  imageFile: File | null
  imagePreview: string | null
}

// ─── Image upload helper ─────────────────────────────────────────
const uploadImage = async (file: File): Promise<string | null> => {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}.${fileExt}`
  const { error } = await supabase.storage
    .from('product-images')
    .upload(fileName, file)
  if (error) return null
  const { data } = supabase.storage
    .from('product-images')
    .getPublicUrl(fileName)
  return data.publicUrl
}

export default function Dashboard() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'products' | 'portfolio'>('products')

  // ─── Product form state ───────────────────────────────────────
  const [pName, setPName] = useState('')
  const [pDescription, setPDescription] = useState('')
  const [pPrice, setPPrice] = useState('')
  const [pImageFile, setPImageFile] = useState<File | null>(null)
  const [pImagePreview, setPImagePreview] = useState<string | null>(null)
  const [pUploading, setPUploading] = useState(false)
  const [pFormError, setPFormError] = useState('')
  const [pSuccessMsg, setPSuccessMsg] = useState('')
  const [productEditState, setProductEditState] = useState<ProductEditState | null>(null)
  const [productEditUploading, setProductEditUploading] = useState(false)
  const [productEditError, setProductEditError] = useState('')
  const [productEditSuccess, setProductEditSuccess] = useState('')

  // ─── Portfolio form state ─────────────────────────────────────
  const [foTitle, setFoTitle] = useState('')
  const [foCategory, setFoCategory] = useState('')
  const [foDescription, setFoDescription] = useState('')
  const [foImageFile, setFoImageFile] = useState<File | null>(null)
  const [foImagePreview, setFoImagePreview] = useState<string | null>(null)
  const [foUploading, setFoUploading] = useState(false)
  const [foFormError, setFoFormError] = useState('')
  const [foSuccessMsg, setFoSuccessMsg] = useState('')
  const [portfolioEditState, setPortfolioEditState] = useState<PortfolioEditState | null>(null)
  const [portfolioEditUploading, setPortfolioEditUploading] = useState(false)
  const [portfolioEditError, setPortfolioEditError] = useState('')
  const [portfolioEditSuccess, setPortfolioEditSuccess] = useState('')

  // ─── Auth guard ───────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) navigate('/admin')
    })
  }, [navigate])

  // ─── Queries ──────────────────────────────────────────────────
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  })

  const { data: portfolioItems, isLoading: portfolioLoading } = useQuery({
    queryKey: ['portfolio'],
    queryFn: fetchPortfolio,
  })

  // ─── Delete mutations ─────────────────────────────────────────
  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })

  const deletePortfolioItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('portfolio_items').delete().eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['portfolio'] }),
  })

  // ─── Add product ──────────────────────────────────────────────
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setPFormError('')
    setPSuccessMsg('')
    if (!pName || !pPrice) { setPFormError('Name and price are required.'); return }
    setPUploading(true)

    const image_url = pImageFile ? await uploadImage(pImageFile) : null
    if (pImageFile && !image_url) {
      setPFormError('Image upload failed. Try again.')
      setPUploading(false)
      return
    }

    const { error } = await supabase.from('products').insert([{
      name: pName,
      description: pDescription || null,
      price: parseFloat(pPrice),
      image_url,
    }])

    if (error) { setPFormError('Failed to save product.'); setPUploading(false); return }

    setPName(''); setPDescription(''); setPPrice('')
    setPImageFile(null); setPImagePreview(null)
    setPUploading(false)
    setPSuccessMsg('Product added!')
    queryClient.invalidateQueries({ queryKey: ['products'] })
  }

  // ─── Save product edit ────────────────────────────────────────
  const handleProductEditSave = async () => {
    if (!productEditState) return
    setProductEditError('')
    setProductEditSuccess('')
    setProductEditUploading(true)

    const updates: Partial<Product> = {}

    if (productEditState.field === 'price') {
      updates.price = parseFloat(productEditState.price)
    }

    if (productEditState.field === 'price_image') {
      updates.price = parseFloat(productEditState.price)
      if (productEditState.imageFile) {
        const url = await uploadImage(productEditState.imageFile)
        if (!url) { setProductEditError('Image upload failed.'); setProductEditUploading(false); return }
        updates.image_url = url
      }
    }

    if (productEditState.field === 'all') {
      updates.name = productEditState.name
      updates.description = productEditState.description || null
      updates.price = parseFloat(productEditState.price)
      if (productEditState.imageFile) {
        const url = await uploadImage(productEditState.imageFile)
        if (!url) { setProductEditError('Image upload failed.'); setProductEditUploading(false); return }
        updates.image_url = url
      }
    }

    const { error } = await supabase.from('products').update(updates).eq('id', productEditState.product.id)
    if (error) { setProductEditError('Update failed.'); setProductEditUploading(false); return }

    setProductEditUploading(false)
    setProductEditSuccess('Product updated!')
    queryClient.invalidateQueries({ queryKey: ['products'] })
    setTimeout(() => setProductEditState(null), 1000)
  }

  // ─── Add portfolio item ───────────────────────────────────────
  const handleAddPortfolio = async (e: React.FormEvent) => {
    e.preventDefault()
    setFoFormError('')
    setFoSuccessMsg('')
    if (!foTitle) { setFoFormError('Title is required.'); return }
    setFoUploading(true)

    const image_url = foImageFile ? await uploadImage(foImageFile) : null
    if (foImageFile && !image_url) {
      setFoFormError('Image upload failed. Try again.')
      setFoUploading(false)
      return
    }

    const { error } = await supabase.from('portfolio_items').insert([{
      title: foTitle,
      category: foCategory || null,
      description: foDescription || null,
      image_url,
    }])

    if (error) { setFoFormError('Failed to save item.'); setFoUploading(false); return }

    setFoTitle(''); setFoCategory(''); setFoDescription('')
    setFoImageFile(null); setFoImagePreview(null)
    setFoUploading(false)
    setFoSuccessMsg('Portfolio item added!')
    queryClient.invalidateQueries({ queryKey: ['portfolio'] })
  }

  // ─── Save portfolio edit ──────────────────────────────────────
  const handlePortfolioEditSave = async () => {
    if (!portfolioEditState) return
    setPortfolioEditError('')
    setPortfolioEditSuccess('')
    setPortfolioEditUploading(true)

    const updates: Partial<PortfolioItem> = {
      title: portfolioEditState.title,
      category: portfolioEditState.category || null,
      description: portfolioEditState.description || null,
    }

    if (portfolioEditState.imageFile) {
      const url = await uploadImage(portfolioEditState.imageFile)
      if (!url) { setPortfolioEditError('Image upload failed.'); setPortfolioEditUploading(false); return }
      updates.image_url = url
    }

    const { error } = await supabase
      .from('portfolio_items')
      .update(updates)
      .eq('id', portfolioEditState.item.id)

    if (error) { setPortfolioEditError('Update failed.'); setPortfolioEditUploading(false); return }

    setPortfolioEditUploading(false)
    setPortfolioEditSuccess('Item updated!')
    queryClient.invalidateQueries({ queryKey: ['portfolio'] })
    setTimeout(() => setPortfolioEditState(null), 1000)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin')
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your shop and portfolio</p>
        </div>
        <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors">
          Sign Out
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-100">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'products'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Products
        </button>
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'portfolio'
              ? 'border-gray-900 text-gray-900'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Portfolio
        </button>
      </div>

      {/* ── PRODUCTS TAB ── */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Add Product */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Add New Product</h2>
            <form onSubmit={handleAddProduct} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Product Name *</label>
                <input value={pName} onChange={e => setPName(e.target.value)} placeholder="e.g. Handmade Bracelet"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
                <textarea value={pDescription} onChange={e => setPDescription(e.target.value)} rows={3} placeholder="Optional..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Price (CAD) *</label>
                <input value={pPrice} onChange={e => setPPrice(e.target.value)} type="number" min="0" step="0.01" placeholder="e.g. 25.00"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Product Image</label>
                <input type="file" accept="image/*" onChange={e => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  setPImageFile(f)
                  setPImagePreview(URL.createObjectURL(f))
                }}
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-gray-900 file:text-white hover:file:bg-gray-700 cursor-pointer" />
                {pImagePreview && <img src={pImagePreview} className="mt-3 w-32 h-32 object-cover rounded-xl border border-gray-100" />}
              </div>
              {pFormError && <p className="text-xs text-red-500">{pFormError}</p>}
              {pSuccessMsg && <p className="text-xs text-green-600">{pSuccessMsg}</p>}
              <button type="submit" disabled={pUploading}
                className="w-full bg-gray-900 text-white font-medium py-2.5 rounded-full hover:bg-gray-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {pUploading ? 'Uploading...' : 'Add Product'}
              </button>
            </form>
          </div>

          {/* Product List */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-5">All Products</h2>
            {productsLoading && (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            )}
            {!productsLoading && (!products || products.length === 0) && (
              <p className="text-sm text-gray-400">No products yet.</p>
            )}
            {!productsLoading && products && products.length > 0 && (
              <div className="flex flex-col gap-3">
                {products.map(product => (
                  <div key={product.id} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                        {product.image_url
                          ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">N/A</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        <p className="text-xs text-gray-500">${product.price.toFixed(2)} CAD</p>
                      </div>
                      <button onClick={() => { if (confirm(`Delete "${product.name}"?`)) deleteProduct.mutate(product.id) }}
                        className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors shrink-0">
                        Delete
                      </button>
                    </div>
                    <div className="flex gap-2 mt-2 pt-2 border-t border-gray-50">
                      <span className="text-xs text-gray-400 mr-1 self-center">Edit:</span>
                      <button onClick={() => setProductEditState({ product, field: 'price', name: product.name, description: product.description ?? '', price: product.price.toString(), imageFile: null, imagePreview: null })}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded-full transition-colors">Price only</button>
                      <button onClick={() => setProductEditState({ product, field: 'price_image', name: product.name, description: product.description ?? '', price: product.price.toString(), imageFile: null, imagePreview: null })}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded-full transition-colors">Price + Image</button>
                      <button onClick={() => setProductEditState({ product, field: 'all', name: product.name, description: product.description ?? '', price: product.price.toString(), imageFile: null, imagePreview: null })}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded-full transition-colors">Everything</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PORTFOLIO TAB ── */}
      {activeTab === 'portfolio' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Add Portfolio Item */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Add Portfolio Item</h2>
            <form onSubmit={handleAddPortfolio} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Title *</label>
                <input value={foTitle} onChange={e => setFoTitle(e.target.value)} placeholder="e.g. Summer Collection"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Category</label>
                <input value={foCategory} onChange={e => setFoCategory(e.target.value)} placeholder="e.g. Jewelry, Fashion..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
                <textarea value={foDescription} onChange={e => setFoDescription(e.target.value)} rows={3} placeholder="Optional..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Image</label>
                <input type="file" accept="image/*" onChange={e => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  setFoImageFile(f)
                  setFoImagePreview(URL.createObjectURL(f))
                }}
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-gray-900 file:text-white hover:file:bg-gray-700 cursor-pointer" />
                {foImagePreview && <img src={foImagePreview} className="mt-3 w-32 h-32 object-cover rounded-xl border border-gray-100" />}
              </div>
              {foFormError && <p className="text-xs text-red-500">{foFormError}</p>}
              {foSuccessMsg && <p className="text-xs text-green-600">{foSuccessMsg}</p>}
              <button type="submit" disabled={foUploading}
                className="w-full bg-gray-900 text-white font-medium py-2.5 rounded-full hover:bg-gray-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {foUploading ? 'Uploading...' : 'Add Item'}
              </button>
            </form>
          </div>

          {/* Portfolio List */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-5">All Portfolio Items</h2>
            {portfolioLoading && (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            )}
            {!portfolioLoading && (!portfolioItems || portfolioItems.length === 0) && (
              <p className="text-sm text-gray-400">No portfolio items yet.</p>
            )}
            {!portfolioLoading && portfolioItems && portfolioItems.length > 0 && (
              <div className="flex flex-col gap-3">
                {portfolioItems.map(item => (
                  <div key={item.id} className="bg-white border border-gray-100 rounded-xl p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                        {item.image_url
                          ? <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">N/A</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                        {item.category && <p className="text-xs text-gray-500">{item.category}</p>}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={() => setPortfolioEditState({
                          item,
                          title: item.title,
                          category: item.category ?? '',
                          description: item.description ?? '',
                          imageFile: null,
                          imagePreview: null,
                        })}
                          className="text-xs text-blue-400 hover:text-blue-600 font-medium transition-colors">
                          Edit
                        </button>
                        <button onClick={() => { if (confirm(`Delete "${item.title}"?`)) deletePortfolioItem.mutate(item.id) }}
                          className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors">
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PRODUCT EDIT MODAL ── */}
      {productEditState && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setProductEditState(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Edit Product</h2>
                <p className="text-xs text-gray-400 mt-0.5">{productEditState.product.name}</p>
              </div>
              <button onClick={() => setProductEditState(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>
            <div className="flex flex-col gap-4">
              {productEditState.field === 'all' && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Product Name</label>
                    <input value={productEditState.name} onChange={e => setProductEditState({ ...productEditState, name: e.target.value })}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
                    <textarea value={productEditState.description} onChange={e => setProductEditState({ ...productEditState, description: e.target.value })}
                      rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
                  </div>
                </>
              )}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Price (CAD)</label>
                <input value={productEditState.price} onChange={e => setProductEditState({ ...productEditState, price: e.target.value })}
                  type="number" min="0" step="0.01"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              {(productEditState.field === 'price_image' || productEditState.field === 'all') && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    New Image <span className="text-gray-400 font-normal">(leave empty to keep current)</span>
                  </label>
                  <input type="file" accept="image/*" onChange={e => {
                    const f = e.target.files?.[0]
                    if (!f || !productEditState) return
                    setProductEditState({ ...productEditState, imageFile: f, imagePreview: URL.createObjectURL(f) })
                  }}
                    className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-gray-900 file:text-white hover:file:bg-gray-700 cursor-pointer" />
                  {(productEditState.imagePreview || productEditState.product.image_url) && (
                    <img src={productEditState.imagePreview ?? productEditState.product.image_url!}
                      className="mt-3 w-32 h-32 object-cover rounded-xl border border-gray-100" />
                  )}
                </div>
              )}
              {productEditError && <p className="text-xs text-red-500">{productEditError}</p>}
              {productEditSuccess && <p className="text-xs text-green-600">{productEditSuccess}</p>}
              <button onClick={handleProductEditSave} disabled={productEditUploading}
                className="w-full bg-gray-900 text-white font-medium py-2.5 rounded-full hover:bg-gray-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {productEditUploading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PORTFOLIO EDIT MODAL ── */}
      {portfolioEditState && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setPortfolioEditState(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Edit Portfolio Item</h2>
                <p className="text-xs text-gray-400 mt-0.5">{portfolioEditState.item.title}</p>
              </div>
              <button onClick={() => setPortfolioEditState(null)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Title</label>
                <input value={portfolioEditState.title} onChange={e => setPortfolioEditState({ ...portfolioEditState, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Category</label>
                <input value={portfolioEditState.category} onChange={e => setPortfolioEditState({ ...portfolioEditState, category: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Description</label>
                <textarea value={portfolioEditState.description} onChange={e => setPortfolioEditState({ ...portfolioEditState, description: e.target.value })}
                  rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  New Image <span className="text-gray-400 font-normal">(leave empty to keep current)</span>
                </label>
                <input type="file" accept="image/*" onChange={e => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  setPortfolioEditState({ ...portfolioEditState, imageFile: f, imagePreview: URL.createObjectURL(f) })
                }}
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-gray-900 file:text-white hover:file:bg-gray-700 cursor-pointer" />
                {(portfolioEditState.imagePreview || portfolioEditState.item.image_url) && (
                  <img src={portfolioEditState.imagePreview ?? portfolioEditState.item.image_url!}
                    className="mt-3 w-32 h-32 object-cover rounded-xl border border-gray-100" />
                )}
              </div>
              {portfolioEditError && <p className="text-xs text-red-500">{portfolioEditError}</p>}
              {portfolioEditSuccess && <p className="text-xs text-green-600">{portfolioEditSuccess}</p>}
              <button onClick={handlePortfolioEditSave} disabled={portfolioEditUploading}
                className="w-full bg-gray-900 text-white font-medium py-2.5 rounded-full hover:bg-gray-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                {portfolioEditUploading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}