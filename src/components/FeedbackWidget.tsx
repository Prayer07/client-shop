import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '../lib/supabase'

const schema = z.object({
  feedback: z.string().min(10, 'Please share a bit more — at least 10 characters'),
  service_type: z.string().optional(),
})
type FormData = z.infer<typeof schema>

const services = [
  'Facial Treatment', 'Brow Services', 'Manicure', 'Pedicure',
  'Waxing', 'Makeup', 'Spa Package', 'General'
]

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    if (rating === 0) { setError('Please select a star rating.'); return }
    setError(''); setSubmitting(true)

    const { error: dbError } = await supabase.from('feedbacks').insert([{
      feedback: data.feedback,
      rating,
      service_type: data.service_type || null,
    }])

    if (dbError) { setError('Something went wrong. Please try again.'); setSubmitting(false); return }

    // Fire email notification
    await supabase.functions.invoke('send-form-email', {
      body: {
        type: 'feedback',
        data: {
          feedback: data.feedback,
          rating,
          service_type: data.service_type || 'Not specified',
        }
      }
    })

    setSubmitting(false)
    setSubmitted(true)
    reset()
    setRating(0)
  }

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(() => { setSubmitted(false); setError('') }, 400)
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-brown text-cream font-bold text-xs px-4 py-3 rounded-full shadow-lg hover:bg-brown/80 transition-all hover:scale-105 tracking-wide"
        style={{ writingMode: 'horizontal-tb' }}
      >
        Share Feedback
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-brown/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
          onClick={handleClose}
        >
          <div
            className="bg-cream rounded-2xl shadow-2xl w-full max-w-md border border-blush/40 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-brown px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gold uppercase tracking-widest">Your Voice Matters</p>
                <h2 className="font-serif text-lg font-black text-cream">Share Your Experience</h2>
              </div>
              <button onClick={handleClose} className="text-cream/60 hover:text-cream text-xl">✕</button>
            </div>

            <div className="p-6">
              {!submitted ? (
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

                  {/* Star Rating */}
                  <div>
                    <label className="text-sm font-bold text-brown block mb-2">
                      How was your experience? *
                    </label>
                    <div className="flex gap-2">
                      {[1,2,3,4,5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="text-3xl transition-transform hover:scale-110"
                        >
                          <span className={
                            star <= (hoveredRating || rating)
                              ? 'text-gold'
                              : 'text-blush'
                          }>
                            ★
                          </span>
                        </button>
                      ))}
                    </div>
                    {rating > 0 && (
                      <p className="text-xs font-semibold text-gold mt-1">
                        {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][rating]}
                      </p>
                    )}
                  </div>

                  {/* Service Type */}
                  <div>
                    <label className="text-sm font-bold text-brown block mb-1">
                      Which service? <span className="font-normal text-brown/40">(optional)</span>
                    </label>
                    <select
                      {...register('service_type')}
                      className="w-full border border-blush rounded-lg px-3 py-2.5 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-gold/40 text-brown font-medium"
                    >
                      <option value="">Select a service...</option>
                      {services.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Feedback text */}
                  <div>
                    <label className="text-sm font-bold text-brown block mb-1">
                      Your Feedback *
                    </label>
                    <textarea
                      {...register('feedback')}
                      rows={4}
                      placeholder="Tell us about your experience. What did you love? What could be better?"
                      className="w-full border border-blush rounded-lg px-3 py-2.5 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-gold/40 text-brown font-medium placeholder:text-taupe/40 resize-none"
                    />
                    {errors.feedback && <p className="text-xs text-red-400 mt-1">{errors.feedback.message}</p>}
                  </div>

                  {error && <p className="text-xs text-red-400">{error}</p>}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-brown text-cream font-bold py-3 rounded-full hover:bg-brown/80 transition-colors text-sm tracking-wide disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Feedback'}
                  </button>

                  <p className="text-xs text-brown/40 text-center font-medium">
                    Your feedback is anonymous and helps us improve.
                  </p>
                </form>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🌸</span>
                  </div>
                  <h3 className="font-serif text-xl font-black text-brown mb-2">
                    Thank You!
                  </h3>
                  <p className="text-brown/60 font-medium text-sm leading-relaxed mb-6">
                    Your feedback means the world to us. We're always working to give
                    you the best experience possible.
                  </p>
                  <button
                    onClick={handleClose}
                    className="bg-brown text-cream text-sm font-bold px-8 py-3 rounded-full hover:bg-brown/80 transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}