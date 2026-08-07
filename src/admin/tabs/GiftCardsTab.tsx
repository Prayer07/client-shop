import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { supabase } from "../../lib/supabase"
import { input, label, SectionHeader } from "../AdminCommon"

export default function GiftCardsTab() {
  const queryClient = useQueryClient()

  // Add design state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [themeColor, setThemeColor] = useState('#4A3A32')
  const [accentColor, setAccentColor] = useState('#C6A75E')
  const [bgColor, setBgColor] = useState('#F7F3EE')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [amounts, setAmounts] = useState('25,50,75,100,150')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Edit state
  const [editDesign, setEditDesign] = useState<any | null>(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editThemeColor, setEditThemeColor] = useState('')
  const [editAccentColor, setEditAccentColor] = useState('')
  const [editBgColor, setEditBgColor] = useState('')
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null)
  const [editAmounts, setEditAmounts] = useState('')
  const [editSaving, setEditSaving] = useState(false)
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState('')

  // Active tab within gift cards
  const [activeSection, setActiveSection] = useState<'designs' | 'orders'>('designs')

  const { data: designs, isLoading } = useQuery({
    queryKey: ['gift-card-designs-admin'],
    queryFn: fetchGiftCardDesigns,
  })

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['gift-card-orders'],
    queryFn: fetchGiftCardOrders,
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('gift_card_designs').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gift-card-designs-admin'] }),
  })

  const toggleActive = async (design: any) => {
    await supabase
      .from('gift_card_designs')
      .update({ is_active: !design.is_active })
      .eq('id', design.id)
    queryClient.invalidateQueries({ queryKey: ['gift-card-designs-admin'] })
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    await supabase.from('gift_card_orders').update({ status }).eq('id', orderId)
    queryClient.invalidateQueries({ queryKey: ['gift-card-orders'] })
  }

  const uploadImage = async (file: File) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `gift-card-${Date.now()}.${fileExt}`
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

    const display_order = (designs?.length ?? 0) + 1
    const { data: newDesign, error } = await supabase
      .from('gift_card_designs')
      .insert([{
        name, description: description || null,
        theme_color: themeColor, accent_color: accentColor,
        background_color: bgColor, image_url, display_order
      }])
      .select()
      .single()

    if (error) { setFormError('Failed to save.'); setSaving(false); return }

    // Add denominations
    const amountList = amounts.split(',').map((a, i) => ({
      design_id: newDesign.id,
      amount: parseFloat(a.trim()),
      display_order: i + 1,
    })).filter(a => !isNaN(a.amount))

    if (amountList.length > 0) {
      await supabase.from('gift_card_denominations').insert(amountList)
    }

    setName(''); setDescription('')
    setThemeColor('#4A3A32'); setAccentColor('#C6A75E'); setBgColor('#F7F3EE')
    setImageFile(null); setImagePreview(null); setAmounts('25,50,75,100,150')
    setSaving(false); setSuccessMsg('Gift card design added!')
    queryClient.invalidateQueries({ queryKey: ['gift-card-designs-admin'] })
    queryClient.invalidateQueries({ queryKey: ['gift-card-designs'] })
  }

  const openEdit = async (design: any) => {
    setEditDesign(design)
    setEditName(design.name)
    setEditDescription(design.description ?? '')
    setEditThemeColor(design.theme_color)
    setEditAccentColor(design.accent_color)
    setEditBgColor(design.background_color)
    setEditImageFile(null); setEditImagePreview(null)
    setEditError(''); setEditSuccess('')

    const dens = await fetchDenominations(design.id)
    setEditAmounts(dens.map((d: any) => d.amount).join(','))
  }

  const handleEditSave = async () => {
    if (!editDesign) return
    setEditError(''); setEditSuccess(''); setEditSaving(true)

    let image_url = editDesign.image_url
    if (editImageFile) {
      try { image_url = await uploadImage(editImageFile) }
      catch { setEditError('Image upload failed.'); setEditSaving(false); return }
    }

    const { error } = await supabase.from('gift_card_designs').update({
      name: editName, description: editDescription || null,
      theme_color: editThemeColor, accent_color: editAccentColor,
      background_color: editBgColor, image_url,
    }).eq('id', editDesign.id)

    if (error) { setEditError('Update failed.'); setEditSaving(false); return }

    // Replace denominations
    await supabase.from('gift_card_denominations').delete().eq('design_id', editDesign.id)
    const amountList = editAmounts.split(',').map((a, i) => ({
      design_id: editDesign.id,
      amount: parseFloat(a.trim()),
      display_order: i + 1,
    })).filter(a => !isNaN(a.amount))

    if (amountList.length > 0) {
      await supabase.from('gift_card_denominations').insert(amountList)
    }

    setEditSaving(false); setEditSuccess('Updated!')
    queryClient.invalidateQueries({ queryKey: ['gift-card-designs-admin'] })
    queryClient.invalidateQueries({ queryKey: ['gift-card-designs'] })
    setTimeout(() => setEditDesign(null), 800)
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    fulfilled: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  return (
    <>
      <SectionHeader label="Gift Cards" title="Manage Gift Cards" />

      {/* Inner tabs */}
      <div className="flex gap-2 mb-8">
        {[
          { id: 'designs', label: 'Card Designs' },
          { id: 'orders', label: 'Orders' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setActiveSection(t.id as any)}
            className={`text-xs font-bold px-5 py-2.5 rounded-full transition-all border ${
              activeSection === t.id
                ? 'bg-brown text-cream border-brown'
                : 'bg-white text-taupe border-blush/40 hover:border-gold/40 hover:text-brown'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── DESIGNS SECTION ── */}
      {activeSection === 'designs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Add Form */}
          <div className="bg-white border border-blush/40 rounded-2xl shadow-sm p-6">
            <SectionHeader label="New Design" title="Add Gift Card" />
            <form onSubmit={handleAdd} className="flex flex-col gap-4">
              <div>
                <label className={label}>Card Name *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Mother's Day" className={input} />
              </div>
              <div>
                <label className={label}>Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Short card message..." className={`${input} resize-none`} />
              </div>

              {/* Color pickers */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={label}>Theme Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={themeColor} onChange={e => setThemeColor(e.target.value)} className="w-10 h-10 rounded-lg border border-blush cursor-pointer" />
                    <input value={themeColor} onChange={e => setThemeColor(e.target.value)} className={`${input} flex-1 text-xs`} />
                  </div>
                </div>
                <div>
                  <label className={label}>Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={accentColor} onChange={e => setAccentColor(e.target.value)} className="w-10 h-10 rounded-lg border border-blush cursor-pointer" />
                    <input value={accentColor} onChange={e => setAccentColor(e.target.value)} className={`${input} flex-1 text-xs`} />
                  </div>
                </div>
                <div>
                  <label className={label}>Background</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-10 h-10 rounded-lg border border-blush cursor-pointer" />
                    <input value={bgColor} onChange={e => setBgColor(e.target.value)} className={`${input} flex-1 text-xs`} />
                  </div>
                </div>
              </div>

              {/* Live preview */}
              <div>
                <label className={label}>Preview</label>
                <div
                  className="rounded-xl overflow-hidden border border-blush/40"
                  style={{ backgroundColor: bgColor }}
                >
                  <div style={{ backgroundColor: themeColor }} className="px-4 py-3 text-center">
                    <p style={{ color: accentColor }} className="text-xs font-bold uppercase tracking-widest">Gift Card</p>
                    <p className="font-serif font-black text-cream text-base">{name || 'Card Name'}</p>
                  </div>
                  <div className="px-4 py-2 text-center">
                    <p style={{ color: accentColor }} className="font-serif text-xl font-black">CA$50</p>
                  </div>
                  <div style={{ backgroundColor: accentColor }} className="px-4 py-1 text-center">
                    <p style={{ color: themeColor }} className="text-xs font-bold">lammydebeautylounge.com</p>
                  </div>
                </div>
              </div>

              <div>
                <label className={label}>Card Image (optional)</label>
                <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)) } }} className="w-full text-sm text-taupe file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-brown file:text-cream hover:file:bg-brown/80 cursor-pointer" />
                {imagePreview && <img src={imagePreview} className="mt-3 w-16 h-16 object-cover rounded-full border-2 border-blush" />}
              </div>

              <div>
                <label className={label}>Amounts (CAD, comma separated)</label>
                <input value={amounts} onChange={e => setAmounts(e.target.value)} placeholder="25,50,75,100,150" className={input} />
                <p className="text-xs text-brown/40 mt-1">e.g. 25,50,75,100,150</p>
              </div>

              {formError && <p className="text-xs text-red-400">{formError}</p>}
              {successMsg && <p className="text-xs text-green-600">{successMsg}</p>}
              <button type="submit" disabled={saving} className="w-full bg-brown text-cream font-bold py-3 rounded-full hover:bg-brown/80 transition-colors text-sm disabled:opacity-50">
                {saving ? 'Saving...' : 'Add Gift Card Design'}
              </button>
            </form>
          </div>

          {/* List */}
          <div>
            <SectionHeader label="All Designs" title="Gift Card Designs" />
            {isLoading && <div className="flex flex-col gap-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-blush/30 animate-pulse" />)}</div>}
            {!isLoading && (!designs || designs.length === 0) && <p className="text-sm font-medium text-brown/50">No designs yet.</p>}
            {!isLoading && designs && designs.length > 0 && (
              <div className="flex flex-col gap-3">
                {designs.map((d: any) => (
                  <div key={d.id} className="bg-white border border-blush/40 rounded-xl p-3 shadow-sm">
                    <div className="flex items-center gap-3">
                      {/* Mini card preview */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-blush/30" style={{ backgroundColor: d.theme_color }}>
                        <div className="w-full h-full flex items-center justify-center">
                          <p className="text-xs font-black text-center leading-tight px-1" style={{ color: d.accent_color }}>{d.name}</p>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-brown truncate font-serif">{d.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${d.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-400'}`}>
                            {d.is_active ? 'Active' : 'Hidden'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => toggleActive(d)} className="text-xs text-taupe hover:text-brown font-bold transition-colors">
                          {d.is_active ? 'Hide' : 'Show'}
                        </button>
                        <button onClick={() => confirm(`Delete "${d.name}"?`) && deleteMutation.mutate(d.id)} className="text-xs text-red-300 hover:text-red-500 font-bold transition-colors">
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-blush/20">
                      <button onClick={() => openEdit(d)} className="text-xs bg-cream border border-blush/40 hover:border-gold/40 hover:text-gold text-taupe px-3 py-1 rounded-full transition-colors font-semibold">
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── ORDERS SECTION ── */}
      {activeSection === 'orders' && (
        <div>
          <SectionHeader label="Purchases" title="Gift Card Orders" />
          {ordersLoading && <div className="flex flex-col gap-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-blush/30 animate-pulse" />)}</div>}
          {!ordersLoading && (!orders || orders.length === 0) && <p className="text-sm font-medium text-brown/50">No orders yet.</p>}
          {!ordersLoading && orders && orders.length > 0 && (
            <div className="flex flex-col gap-3">
              {orders.map((order: any) => (
                <div key={order.id} className="bg-white border border-blush/40 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-sm font-black text-brown font-serif">{order.design_name} Gift Card</p>
                      <p className="text-base font-black text-gold">CA${order.amount.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColors[order.status] ?? 'bg-blush/30 text-taupe'}`}>
                        {order.status}
                      </span>
                      <p className="text-xs font-medium text-brown/40">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-xs font-bold text-gold uppercase tracking-widest mb-0.5">From</p>
                      <p className="text-xs font-semibold text-brown">{order.sender_name}</p>
                      <p className="text-xs text-brown/50">{order.sender_email}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gold uppercase tracking-widest mb-0.5">To</p>
                      <p className="text-xs font-semibold text-brown">{order.recipient_name}</p>
                      <p className="text-xs text-brown/50">{order.recipient_email}</p>
                    </div>
                  </div>
                  {order.personal_message && (
                    <div className="bg-blush/20 border border-blush/30 rounded-lg px-3 py-2 mb-3">
                      <p className="text-xs font-medium text-brown/60 italic">"{order.personal_message}"</p>
                    </div>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs text-brown/40 font-semibold self-center">Update status:</span>
                    {['pending', 'processing', 'fulfilled', 'cancelled'].map(s => (
                      <button
                        key={s}
                        onClick={() => updateOrderStatus(order.id, s)}
                        className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors border ${
                          order.status === s
                            ? 'bg-brown text-cream border-brown'
                            : 'bg-cream border-blush/40 text-taupe hover:border-gold/40 hover:text-gold'
                        }`}
                      >
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editDesign && (
        <div className="fixed inset-0 z-50 bg-brown/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setEditDesign(null)}>
          <div className="bg-cream rounded-2xl shadow-2xl w-full max-w-lg p-7 border border-blush/40 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="font-serif text-xl font-black text-brown">Edit Gift Card</h2>
                <p className="text-xs font-medium text-brown/50 mt-0.5">{editDesign.name}</p>
              </div>
              <button onClick={() => setEditDesign(null)} className="text-taupe hover:text-brown text-xl">✕</button>
            </div>
            <div className="flex flex-col gap-4">
              <div><label className={label}>Name *</label><input value={editName} onChange={e => setEditName(e.target.value)} className={input} /></div>
              <div><label className={label}>Description</label><textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} rows={2} className={`${input} resize-none`} /></div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={label}>Theme</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={editThemeColor} onChange={e => setEditThemeColor(e.target.value)} className="w-10 h-10 rounded-lg border border-blush cursor-pointer" />
                    <input value={editThemeColor} onChange={e => setEditThemeColor(e.target.value)} className={`${input} flex-1 text-xs`} />
                  </div>
                </div>
                <div>
                  <label className={label}>Accent</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={editAccentColor} onChange={e => setEditAccentColor(e.target.value)} className="w-10 h-10 rounded-lg border border-blush cursor-pointer" />
                    <input value={editAccentColor} onChange={e => setEditAccentColor(e.target.value)} className={`${input} flex-1 text-xs`} />
                  </div>
                </div>
                <div>
                  <label className={label}>Background</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={editBgColor} onChange={e => setEditBgColor(e.target.value)} className="w-10 h-10 rounded-lg border border-blush cursor-pointer" />
                    <input value={editBgColor} onChange={e => setEditBgColor(e.target.value)} className={`${input} flex-1 text-xs`} />
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div
                className="rounded-xl overflow-hidden border border-blush/40"
                style={{ backgroundColor: editBgColor }}
              >
                <div style={{ backgroundColor: editThemeColor }} className="px-4 py-3 text-center">
                  <p style={{ color: editAccentColor }} className="text-xs font-bold uppercase tracking-widest">Gift Card</p>
                  <p className="font-serif font-black text-cream text-base">{editName || 'Card Name'}</p>
                </div>
                <div className="px-4 py-2 text-center">
                  <p style={{ color: editAccentColor }} className="font-serif text-xl font-black">CA$50</p>
                </div>
                <div style={{ backgroundColor: editAccentColor }} className="px-4 py-1 text-center">
                  <p style={{ color: editThemeColor }} className="text-xs font-bold">lammydebeautylounge.com</p>
                </div>
              </div>

              <div>
                <label className={label}>New Image <span className="font-normal text-brown/40">(leave empty to keep current)</span></label>
                <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setEditImageFile(f); setEditImagePreview(URL.createObjectURL(f)) } }} className="w-full text-sm text-taupe file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-brown file:text-cream hover:file:bg-brown/80 cursor-pointer" />
                {(editImagePreview || editDesign.image_url) && <img src={editImagePreview ?? editDesign.image_url} className="mt-3 w-16 h-16 object-cover rounded-full border-2 border-blush" />}
              </div>

              <div>
                <label className={label}>Amounts (comma separated)</label>
                <input value={editAmounts} onChange={e => setEditAmounts(e.target.value)} className={input} />
                <p className="text-xs text-brown/40 mt-1">e.g. 25,50,75,100,150</p>
              </div>

              {editError && <p className="text-xs text-red-400">{editError}</p>}
              {editSuccess && <p className="text-xs text-green-600">{editSuccess}</p>}
              <button onClick={handleEditSave} disabled={editSaving} className="w-full bg-brown text-cream font-bold py-3 rounded-full hover:bg-brown/80 transition-colors text-sm disabled:opacity-50">
                {editSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

const fetchGiftCardDesigns = async () => {
  const { data, error } = await supabase
    .from('gift_card_designs')
    .select('*')
    .order('display_order', { ascending: true })
  if (error) throw error
  return data
}

const fetchGiftCardOrders = async () => {
  const { data, error } = await supabase
    .from('gift_card_orders')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

const fetchDenominations = async (designId: string) => {
  const { data, error } = await supabase
    .from('gift_card_denominations')
    .select('*')
    .eq('design_id', designId)
    .order('display_order', { ascending: true })
  if (error) throw error
  return data
}