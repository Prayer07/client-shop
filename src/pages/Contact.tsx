import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '../lib/supabase'

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type FormData = z.infer<typeof schema>

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    setServerError('')
    const { error } = await supabase.from('enquiries').insert([data])
    if (error) {
      setServerError('Something went wrong. Please try again.')
      return
    }
    reset()
    setSubmitted(true)
  }

  return (
    <section className="min-h-screen bg-cream">

      {/* Page Header */}
      <div className="bg-blush/30 border-b border-blush/40">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <span className="text-xs font-semibold text-gold uppercase tracking-widest">Reach Out</span>
          <h1 className="font-serif text-4xl font-bold text-brown mt-2">Get in Touch</h1>
          <p className="text-taupe text-sm mt-3 max-w-md mx-auto leading-relaxed">
            Have a question, a custom order request, or just want to say hi?
            We'd love to hear from you.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-start">

          {/* Left — Info */}
          <div>

            {/* Decorative */}
            <div className="flex items-center gap-3 mb-8">
              <span className="w-10 h-px bg-gold/40" />
              <span className="text-gold text-xs uppercase tracking-widest font-medium">Contact Info</span>
            </div>

            <div className="flex flex-col gap-6 mb-10">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-blush/50 flex items-center justify-center shrink-0 text-base">
                  📧
                </div>
                <div>
                  <p className="text-xs font-semibold text-gold uppercase tracking-widest mb-0.5">Email</p>
                  <p className="text-sm text-brown">placeholder@email.com</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-blush/50 flex items-center justify-center shrink-0 text-base">
                  💬
                </div>
                <div>
                  <p className="text-xs font-semibold text-gold uppercase tracking-widest mb-0.5">WhatsApp</p>
                  <p className="text-sm text-brown">+1 (placeholder) 000-0000</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-blush/50 flex items-center justify-center shrink-0 text-base">
                  📍
                </div>
                <div>
                  <p className="text-xs font-semibold text-gold uppercase tracking-widest mb-0.5">Location</p>
                  <p className="text-sm text-brown">Canada</p>
                </div>
              </div>
            </div>

            {/* Socials */}
            <div>
              <p className="text-xs font-semibold text-gold uppercase tracking-widest mb-4">
                Follow Us
              </p>
              <div className="flex gap-3">
                {[
                  { label: 'Instagram', url: 'https://instagram.com/placeholder' },
                  { label: 'Facebook', url: 'https://facebook.com/placeholder' },
                  { label: 'TikTok', url: 'https://tiktok.com/@placeholder' },
                ].map(s => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-blush text-brown text-xs font-medium px-4 py-2 rounded-full hover:bg-blush/40 hover:border-blush transition-colors tracking-wide"
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>

          </div>

          {/* Right — Form */}
          <div className="bg-white border border-blush/40 rounded-2xl shadow-sm p-7">
            {!submitted ? (
              <>
                <div className="mb-6">
                  <h2 className="font-serif text-2xl font-bold text-brown">Send an Enquiry</h2>
                  <p className="text-taupe text-xs mt-1">
                    We'll get back to you as soon as possible.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <div>
                    <label className="text-sm font-medium text-brown block mb-1">Full Name</label>
                    <input
                      {...register('name')}
                      placeholder="Jane Doe"
                      className="w-full border border-blush rounded-lg px-3 py-2.5 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-gold/40 text-brown placeholder:text-taupe/50"
                    />
                    {errors.name && (
                      <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-brown block mb-1">Email Address</label>
                    <input
                      {...register('email')}
                      placeholder="jane@example.com"
                      className="w-full border border-blush rounded-lg px-3 py-2.5 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-gold/40 text-brown placeholder:text-taupe/50"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-brown block mb-1">Subject</label>
                    <input
                      {...register('subject')}
                      placeholder="Custom order, general question..."
                      className="w-full border border-blush rounded-lg px-3 py-2.5 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-gold/40 text-brown placeholder:text-taupe/50"
                    />
                    {errors.subject && (
                      <p className="text-xs text-red-400 mt-1">{errors.subject.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-brown block mb-1">Message</label>
                    <textarea
                      {...register('message')}
                      rows={4}
                      placeholder="Tell us more..."
                      className="w-full border border-blush rounded-lg px-3 py-2.5 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-gold/40 text-brown placeholder:text-taupe/50 resize-none"
                    />
                    {errors.message && (
                      <p className="text-xs text-red-400 mt-1">{errors.message.message}</p>
                    )}
                  </div>

                  {serverError && (
                    <p className="text-xs text-red-400">{serverError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-brown text-cream font-medium py-3 rounded-full hover:bg-brown/80 transition-colors text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-10">
                <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✅</span>
                </div>
                <h2 className="font-serif text-2xl font-bold text-brown mb-2">
                  Message Received!
                </h2>
                <p className="text-sm text-taupe leading-relaxed">
                  Thanks for reaching out. We'll get back to you as soon as possible.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-7 bg-brown text-cream text-sm font-medium px-8 py-3 rounded-full hover:bg-brown/80 transition-colors tracking-wide"
                >
                  Send Another
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  )
}