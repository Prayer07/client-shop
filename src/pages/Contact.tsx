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
    <section className="max-w-6xl mx-auto px-4 py-12">

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

        {/* Left — Info */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Get in Touch</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-8">
            Have a question, a custom order request, or just want to say hi?
            Fill out the form and we'll get back to you as soon as possible.
          </p>

          <div className="flex flex-col gap-5">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Email</p>
              <p className="text-sm text-gray-700">placeholder@email.com</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">WhatsApp</p>
              <p className="text-sm text-gray-700">+1 (placeholder) 000-0000</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Location</p>
              <p className="text-sm text-gray-700">Canada</p>
            </div>
          </div>

          {/* Socials */}
          <div className="mt-8">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Follow Us</p>
            <div className="flex gap-4">
              <a
                href="https://instagram.com/placeholder"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-700 hover:text-black transition-colors"
              >
                Instagram
              </a>
              <a
                href="https://facebook.com/placeholder"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-700 hover:text-black transition-colors"
              >
                Facebook
              </a>
              <a
                href="https://tiktok.com/@placeholder"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-700 hover:text-black transition-colors"
              >
                TikTok
              </a>
            </div>
          </div>
        </div>

        {/* Right — Form */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          {!submitted ? (
            <>
              <h2 className="text-lg font-bold text-gray-900 mb-5">Send an Enquiry</h2>

              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Full Name</label>
                  <input
                    {...register('name')}
                    placeholder="Jane Doe"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Email Address</label>
                  <input
                    {...register('email')}
                    placeholder="jane@example.com"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Subject</label>
                  <input
                    {...register('subject')}
                    placeholder="Custom order, general question..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Message</label>
                  <textarea
                    {...register('message')}
                    rows={4}
                    placeholder="Tell us more..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none"
                  />
                  {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
                </div>

                {serverError && (
                  <p className="text-xs text-red-500">{serverError}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gray-900 text-white font-medium py-2.5 rounded-full hover:bg-gray-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">✅</div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Message Received!</h2>
              <p className="text-sm text-gray-500 leading-relaxed">
                Thanks for reaching out. We'll get back to you as soon as possible.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 bg-gray-900 text-white text-sm font-medium px-6 py-2.5 rounded-full hover:bg-gray-700 transition-colors"
              >
                Send Another
              </button>
            </div>
          )}
        </div>

      </div>
    </section>
  )
}