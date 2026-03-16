import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Product } from '../types'

const schema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  phone: z
    .string()
    .min(7, 'Enter a valid phone number')
    .regex(/^\+?[0-9\s\-()]+$/, 'Invalid phone number'),
})

type FormData = z.infer<typeof schema>

interface Props {
  product: Product
  onClose: () => void
}

const CLIENT_WHATSAPP = import.meta.env.VITE_CLIENT_WHATSAPP

export default function BuyModal({ product, onClose }: Props) {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = (data: FormData) => {
    const message = encodeURIComponent(
      `Hello! I'd like to order the following:\n\n` +
      `🛍️ Product: ${product.name}\n` +
      `💰 Price: $${product.price.toFixed(2)} CAD\n\n` +
      `👤 My Name: ${data.name}\n` +
      `📞 My Number: ${data.phone}`
    )
    window.open(`https://wa.me/${CLIENT_WHATSAPP}?text=${message}`, '_blank')
    setSubmitted(true)
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-brown/40 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-cream rounded-2xl shadow-2xl w-full max-w-md p-7 border border-blush/40"
        onClick={e => e.stopPropagation()}
      >
        {!submitted ? (
          <>
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-serif text-xl font-bold text-brown">Request to Buy</h2>
                <p className="text-xs text-taupe mt-1">
                  {product.name} —{' '}
                  <span className="font-medium text-brown">
                    ${product.price.toFixed(2)} CAD
                  </span>
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-taupe hover:text-brown transition-colors text-xl leading-none mt-0.5"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-brown block mb-1">Your Name</label>
                <input
                  {...register('name')}
                  placeholder="e.g. Jane Doe"
                  className="w-full border border-blush rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold/50 text-brown placeholder:text-taupe/50"
                />
                {errors.name && (
                  <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-brown block mb-1">Your Phone Number</label>
                <input
                  {...register('phone')}
                  placeholder="e.g. +1 234 567 8900"
                  className="w-full border border-blush rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold/50 text-brown placeholder:text-taupe/50"
                />
                {errors.phone && (
                  <p className="text-xs text-red-400 mt-1">{errors.phone.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-brown text-cream font-medium py-3 rounded-full hover:bg-brown/80 transition-colors text-sm tracking-wide mt-2"
              >
                Send Request via WhatsApp
              </button>
            </form>
          </>
        ) : (
          /* Success */
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎉</span>
            </div>
            <h2 className="font-serif text-xl font-bold text-brown mb-2">Request Sent!</h2>
            <p className="text-sm text-taupe leading-relaxed">
              Your product request has been sent to the seller.<br />
              You will get a response as soon as possible.
            </p>
            <button
              onClick={onClose}
              className="mt-7 bg-brown text-cream text-sm font-medium px-8 py-3 rounded-full hover:bg-brown/80 transition-colors tracking-wide"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}