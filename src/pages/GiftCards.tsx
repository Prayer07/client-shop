import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '../lib/supabase'
import type { GiftCardDesign, GiftCardDenomination } from '../types'

const CLIENT_WHATSAPP = import.meta.env.VITE_CLIENT_WHATSAPP

const fetchDesigns = async (): Promise<GiftCardDesign[]> => {
  const { data, error } = await supabase
    .from('gift_card_designs')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
  if (error) throw error
  return data
}

const fetchDenominations = async (designId: string): Promise<GiftCardDenomination[]> => {
  const { data, error } = await supabase
    .from('gift_card_denominations')
    .select('*')
    .eq('design_id', designId)
    .order('display_order', { ascending: true })
  if (error) throw error
  return data
}

const schema = z.object({
  sender_name: z.string().min(2, 'Your name is required'),
  sender_email: z.string().email('Enter a valid email'),
  recipient_name: z.string().min(2, 'Recipient name is required'),
  recipient_email: z.string().email('Enter a valid recipient email'),
  personal_message: z.string().optional(),
})
type FormData = z.infer<typeof schema>

function GiftCardPreview({
  design,
  amount,
  senderName,
  recipientName,
}: {
  design: GiftCardDesign
  amount: number
  senderName?: string
  recipientName?: string
}) {
  return (
    <div
      style={{ backgroundColor: design.background_color }}
      className="rounded-2xl overflow-hidden border shadow-lg w-full"
    >
      {/* Top band */}
      <div
        style={{ backgroundColor: design.theme_color }}
        className="px-6 py-5 text-center"
      >
        {design.image_url && (
          <img
            src={design.image_url}
            alt={design.name}
            className="w-14 h-14 rounded-full object-cover mx-auto mb-3 border-2"
            style={{ borderColor: design.accent_color }}
          />
        )}
        <p
          style={{ color: design.accent_color }}
          className="text-xs font-bold uppercase tracking-widest mb-1"
        >
          Lammyde Beauty & Spa Lounge
        </p>
        <h2
          style={{ color: '#F7F3EE' }}
          className="font-serif text-2xl font-black"
        >
          {design.name} Gift Card
        </h2>
      </div>

      {/* Amount */}
      <div
        className="px-6 py-4 text-center border-b"
        style={{ borderColor: design.accent_color + '40' }}
      >
        <p
          style={{ color: design.theme_color }}
          className="font-serif text-4xl font-black"
        >
          CA${amount.toFixed(2)}
        </p>
      </div>

      {/* Details */}
      <div className="px-6 py-5">
        {design.description && (
          <p
            style={{ color: design.theme_color + 'AA' }}
            className="text-xs font-medium leading-relaxed text-center mb-4"
          >
            {design.description}
          </p>
        )}
        {(recipientName || senderName) && (
          <div className="flex flex-col gap-2">
            {recipientName && (
              <div className="flex items-center justify-between">
                <span
                  style={{ color: design.theme_color + '80' }}
                  className="text-xs font-bold uppercase tracking-widest"
                >
                  To
                </span>
                <span
                  style={{ color: design.theme_color }}
                  className="text-sm font-black font-serif"
                >
                  {recipientName}
                </span>
              </div>
            )}
            {senderName && (
              <div className="flex items-center justify-between">
                <span
                  style={{ color: design.theme_color + '80' }}
                  className="text-xs font-bold uppercase tracking-widest"
                >
                  From
                </span>
                <span
                  style={{ color: design.theme_color }}
                  className="text-sm font-black font-serif"
                >
                  {senderName}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer strip */}
      <div
        style={{ backgroundColor: design.accent_color }}
        className="px-6 py-2 text-center"
      >
        <p
          style={{ color: design.theme_color }}
          className="text-xs font-bold uppercase tracking-widest"
        >
          lammydebeautylounge.com
        </p>
      </div>
    </div>
  )
}

function GiftCardModal({
  design,
  onClose,
}: {
  design: GiftCardDesign
  onClose: () => void
}) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [step, setStep] = useState<'amount' | 'details' | 'success'>('amount')
  const [submitting, setSubmitting] = useState(false)

  const { data: denominations } = useQuery({
    queryKey: ['denominations', design.id],
    queryFn: () => fetchDenominations(design.id),
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const senderName = watch('sender_name')
  const recipientName = watch('recipient_name')

  const onSubmit = async (data: FormData) => {
    if (!selectedAmount) return
    setSubmitting(true)

    const { error } = await supabase.from('gift_card_orders').insert([{
      design_id: design.id,
      design_name: design.name,
      amount: selectedAmount,
      sender_name: data.sender_name,
      sender_email: data.sender_email,
      recipient_name: data.recipient_name,
      recipient_email: data.recipient_email,
      personal_message: data.personal_message || null,
      status: 'pending',
    }])

    if (error) { setSubmitting(false); return }

    const message = encodeURIComponent(
      `Hello! I'd like to purchase a Gift Card.\n\n` +
      `Gift Card: ${design.name}\n` +
      `Amount: CA$${selectedAmount.toFixed(2)}\n\n` +
      `From: ${data.sender_name} (${data.sender_email})\n` +
      `To: ${data.recipient_name} (${data.recipient_email})\n\n` +
      `Message: ${data.personal_message || 'None'}`
    )
    window.open(`https://wa.me/${CLIENT_WHATSAPP}?text=${message}`, '_blank')
    setSubmitting(false)
    setStep('success')
  }

  const inputClass = 'w-full border border-blush rounded-lg px-3 py-2.5 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-gold/40 text-brown font-medium placeholder:text-taupe/40'
  const labelClass = 'text-sm font-bold text-brown block mb-1'

  return (
    <div
      className="fixed inset-0 z-50 bg-brown/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-cream rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-blush/40"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{ backgroundColor: design.theme_color }}
          className="px-6 py-4 flex items-center justify-between rounded-t-2xl"
        >
          <div>
            <p
              style={{ color: design.accent_color }}
              className="text-xs font-bold uppercase tracking-widest"
            >
              Gift Card
            </p>
            <h2 className="font-serif text-xl font-black text-cream">
              {design.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-cream/60 hover:text-cream text-xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {step === 'amount' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Preview */}
                <GiftCardPreview
                  design={design}
                  amount={selectedAmount ?? 50}
                />

                {/* Amount Selection */}
                <div>
                  <p className="text-xs font-bold text-gold uppercase tracking-widest mb-4">
                    Select Amount (CAD)
                  </p>
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {denominations?.map(d => (
                      <button
                        key={d.id}
                        onClick={() => setSelectedAmount(d.amount)}
                        className={`py-4 rounded-xl border-2 font-black text-lg font-serif transition-all ${
                          selectedAmount === d.amount
                            ? 'border-brown bg-brown text-cream'
                            : 'border-blush/40 text-brown hover:border-brown/40'
                        }`}
                      >
                        ${d.amount}
                      </button>
                    ))}
                  </div>

                  {design.description && (
                    <div className="bg-blush/20 border border-blush/40 rounded-xl p-4 mb-6">
                      <p className="text-xs font-medium text-brown/70 leading-relaxed">
                        {design.description}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => selectedAmount && setStep('details')}
                    disabled={!selectedAmount}
                    className="w-full bg-brown text-cream font-bold py-3 rounded-full hover:bg-brown/80 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'details' && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Live preview */}
                <GiftCardPreview
                  design={design}
                  amount={selectedAmount!}
                  senderName={senderName}
                  recipientName={recipientName}
                />

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <p className="text-xs font-bold text-gold uppercase tracking-widest">
                    Gift Details
                  </p>

                  <div>
                    <label className={labelClass}>Your Name *</label>
                    <input {...register('sender_name')} placeholder="Jane Doe" className={inputClass} />
                    {errors.sender_name && <p className="text-xs text-red-400 mt-1">{errors.sender_name.message}</p>}
                  </div>

                  <div>
                    <label className={labelClass}>Your Email *</label>
                    <input {...register('sender_email')} placeholder="you@email.com" className={inputClass} />
                    {errors.sender_email && <p className="text-xs text-red-400 mt-1">{errors.sender_email.message}</p>}
                  </div>

                  <div>
                    <label className={labelClass}>Recipient Name *</label>
                    <input {...register('recipient_name')} placeholder="e.g. Mum" className={inputClass} />
                    {errors.recipient_name && <p className="text-xs text-red-400 mt-1">{errors.recipient_name.message}</p>}
                  </div>

                  <div>
                    <label className={labelClass}>Recipient Email *</label>
                    <input {...register('recipient_email')} placeholder="recipient@email.com" className={inputClass} />
                    {errors.recipient_email && <p className="text-xs text-red-400 mt-1">{errors.recipient_email.message}</p>}
                  </div>

                  <div>
                    <label className={labelClass}>Personal Message</label>
                    <textarea
                      {...register('personal_message')}
                      rows={3}
                      placeholder="Add a heartfelt message..."
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  <div className="flex gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setStep('amount')}
                      className="flex-1 border-2 border-brown/30 text-brown font-bold py-3 rounded-full text-sm hover:border-brown transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-brown text-cream font-bold py-3 rounded-full hover:bg-brown/80 transition-colors text-sm disabled:opacity-50"
                    >
                      {submitting ? 'Processing...' : 'Send via WhatsApp'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-10">
              <div className="w-20 h-20 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-5">
                <span className="text-4xl">🎁</span>
              </div>
              <h2 className="font-serif text-2xl font-black text-brown mb-3">
                Gift Card Request Sent!
              </h2>
              <p className="text-brown/60 font-medium text-sm leading-relaxed max-w-sm mx-auto mb-2">
                Your WhatsApp message has been sent to us. We'll process your
                gift card and get back to you as soon as possible.
              </p>
              <p className="text-xs font-semibold text-gold mb-8">
                {design.name} Gift Card · CA${selectedAmount?.toFixed(2)}
              </p>
              <button
                onClick={onClose}
                className="bg-brown text-cream text-sm font-bold px-8 py-3 rounded-full hover:bg-brown/80 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function GiftCards() {
  const [selectedDesign, setSelectedDesign] = useState<GiftCardDesign | null>(null)

  const { data: designs, isLoading, isError } = useQuery({
    queryKey: ['gift-card-designs'],
    queryFn: fetchDesigns,
  })

  return (
    <div className="min-h-screen bg-cream">

      {/* Header */}
      <div className="bg-blush/30 border-b border-blush/40">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <span className="text-xs font-bold text-gold uppercase tracking-widest">
            Give the Gift of Beauty
          </span>
          <h1 className="font-serif text-4xl font-black text-brown mt-2">
            Gift Cards
          </h1>
          <p className="text-brown/60 font-medium text-sm mt-3 max-w-lg mx-auto leading-relaxed">
            The perfect gift for every occasion. Choose a design, pick an amount
            and send a beautiful spa experience to someone you love.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-14">

        {/* How it works */}
        <div className="bg-brown rounded-2xl px-8 py-8 mb-12">
          <p className="text-xs font-bold text-gold uppercase tracking-widest text-center mb-6">
            How It Works
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { step: '01', title: 'Choose a Design', desc: 'Pick the perfect card for your occasion' },
              { step: '02', title: 'Select an Amount', desc: 'Choose from CA$25 to CA$150' },
              { step: '03', title: 'Send via WhatsApp', desc: 'We process and deliver your gift card' },
            ].map(item => (
              <div key={item.step}>
                <p className="font-serif text-3xl font-black text-gold mb-2">{item.step}</p>
                <p className="font-serif font-black text-cream text-base mb-1">{item.title}</p>
                <p className="text-cream/50 font-medium text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-blush/30 animate-pulse" />
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="text-center py-20 text-red-400 font-medium text-sm">
            Failed to load gift cards. Please try again.
          </div>
        )}

        {/* Grid */}
        {!isLoading && designs && designs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {designs.map(design => (
              <div
                key={design.id}
                className="group cursor-pointer rounded-2xl overflow-hidden border border-blush/40 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                onClick={() => setSelectedDesign(design)}
              >
                {/* Card top */}
                <div
                  style={{ backgroundColor: design.theme_color }}
                  className="px-5 py-8 text-center"
                >
                  {design.image_url && (
                    <img
                      src={design.image_url}
                      alt={design.name}
                      className="w-12 h-12 rounded-full object-cover mx-auto mb-3 border-2"
                      style={{ borderColor: design.accent_color }}
                    />
                  )}
                  <p
                    style={{ color: design.accent_color }}
                    className="text-xs font-bold uppercase tracking-widest mb-1"
                  >
                    Gift Card
                  </p>
                  <h3
                    className="font-serif text-xl font-black text-cream"
                  >
                    {design.name}
                  </h3>
                </div>

                {/* Card bottom */}
                <div
                  style={{ backgroundColor: design.background_color }}
                  className="px-5 py-4"
                >
                  {design.description && (
                    <p
                      style={{ color: design.theme_color + '99' }}
                      className="text-xs font-medium leading-relaxed mb-4 line-clamp-2"
                    >
                      {design.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <p
                      style={{ color: design.theme_color + '80' }}
                      className="text-xs font-semibold"
                    >
                      CA$25 — CA$150
                    </p>
                    <button
                      style={{ backgroundColor: design.theme_color, color: '#F7F3EE' }}
                      className="text-xs font-bold px-4 py-2 rounded-full hover:opacity-80 transition-opacity"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && (!designs || designs.length === 0) && (
          <div className="text-center py-24">
            <p className="text-brown/50 font-semibold text-sm">
              Gift cards coming soon. Check back shortly!
            </p>
          </div>
        )}

      </div>

      {/* Modal */}
      {selectedDesign && (
        <GiftCardModal
          design={selectedDesign}
          onClose={() => setSelectedDesign(null)}
        />
      )}
    </div>
  )
}