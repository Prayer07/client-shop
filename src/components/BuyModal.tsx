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

// ← Swap with client's actual WhatsApp number (full international, no +)
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
      `💰 Price: $${product.price.toFixed(2)}\n\n` +
      `👤 My Name: ${data.name}\n` +
      `📞 My Number: ${data.phone}`
    )

    window.open(`https://wa.me/${CLIENT_WHATSAPP}?text=${message}`, '_blank')
    setSubmitted(true)
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Modal */}
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
        onClick={e => e.stopPropagation()}
      >
        {!submitted ? (
          <>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Request to Buy</h2>
                <p className="text-sm text-gray-500 mt-0.5">{product.name} — ${product.price.toFixed(2)}</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Your Name</label>
                <input
                  {...register('name')}
                  placeholder="e.g. Jane Doe"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Your Phone Number</label>
                <input
                  {...register('phone')}
                  placeholder="e.g. +1 234 567 8900"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>}
              </div>

              <button
                type="submit"
                className="w-full bg-gray-900 text-white font-medium py-2.5 rounded-full hover:bg-gray-700 transition-colors text-sm"
              >
                Send Request via WhatsApp
              </button>
            </form>
          </>
        ) : (
          // Success State
          <div className="text-center py-6">
            <div className="text-4xl mb-3">🎉</div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Request Sent!</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Your product request has been sent to the seller.<br />
              You will get a response as soon as possible.
            </p>
            <button
              onClick={onClose}
              className="mt-6 bg-gray-900 text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-gray-700 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}