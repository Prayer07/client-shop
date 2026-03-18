import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'duplicate'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')

    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email }])

    if (error) {
      if (error.code === '23505') {
        setStatus('duplicate')
      } else {
        setStatus('error')
      }
      return
    }

    setEmail('')
    setStatus('success')
  }

  return (
    <section className="bg-blush/20 border-y border-blush/40">
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">

        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-5">
          <span className="text-2xl">💌</span>
        </div>

        <span className="text-xs font-semibold text-gold uppercase tracking-widest">
          Stay in the Loop
        </span>
        <h2 className="font-serif text-3xl font-bold text-brown mt-2 mb-3">
          Join Our Newsletter
        </h2>
        <p className="text-taupe text-sm leading-relaxed mb-8 max-w-md mx-auto">
          Be the first to know about seasonal offers, new treatments, exclusive
          discounts and beauty tips delivered straight to your inbox.
        </p>

        {status === 'success' ? (
          <div className="bg-white border border-blush/40 rounded-2xl px-6 py-8">
            <div className="text-3xl mb-3">🎉</div>
            <p className="font-serif text-lg font-bold text-brown mb-1">You're subscribed!</p>
            <p className="text-taupe text-sm">
              Welcome to the community. Expect beautiful things in your inbox soon.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 border border-blush rounded-full px-5 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold/40 text-brown placeholder:text-taupe/50 shadow-sm"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-brown text-cream text-sm font-medium px-7 py-3 rounded-full hover:bg-brown/80 transition-colors tracking-wide disabled:opacity-50 whitespace-nowrap"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        )}

        {status === 'duplicate' && (
          <p className="text-xs text-taupe mt-3">
            You're already subscribed — we'll keep the good stuff coming! 😊
          </p>
        )}
        {status === 'error' && (
          <p className="text-xs text-red-400 mt-3">
            Something went wrong. Please try again.
          </p>
        )}

        <p className="text-xs text-taupe/50 mt-5">
          No spam, ever. Unsubscribe anytime.
        </p>
      </div>
    </section>
  )
}