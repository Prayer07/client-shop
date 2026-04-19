import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { FaEnvelope } from 'react-icons/fa'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    setErrorMsg('')

    try {
      const { data, error } = await supabase.functions.invoke('subscribe-beehiiv', {
        body: { email },
      })

      if (error || !data?.success) {
        setErrorMsg('Something went wrong. Please try again.')
        setStatus('error')
        return
      }

      setEmail('')
      setStatus('success')
    } catch {
      setErrorMsg('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return (
    <section className="bg-blush/20 border-y border-blush/40">
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">

        <div className="w-14 h-14 rounded-full bg-gold/20 flex items-center justify-center mx-auto mb-5">
          <FaEnvelope className="text-2xl text-brown" />
        </div>

        <span className="text-xs font-bold text-gold uppercase tracking-widest">
          Stay in the Loop
        </span>
        <h2 className="font-serif text-3xl font-black text-brown mt-2 mb-3">
          Join Our Newsletter
        </h2>
        <p className="text-brown/60 font-medium text-sm leading-relaxed mb-8 max-w-md mx-auto">
          Be the first to know about seasonal offers, new treatments, exclusive
          discounts and beauty tips delivered straight to your inbox.
        </p>

        {status === 'success' ? (
          <div className="bg-white border border-blush/40 rounded-2xl px-6 py-8">
            <p className="font-serif text-lg font-black text-brown mb-1">You're subscribed!</p>
            <p className="text-brown/60 font-medium text-sm">
              Welcome to the community. Expect beautiful things in your inbox soon.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            {/* loading overlay to mask fetch latency */}
            <div className={`${status === 'loading' ? 'absolute inset-0 z-20 rounded-2xl skeleton pointer-events-none' : 'hidden'}`} />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className="flex-1 border border-blush rounded-full px-5 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-gold/40 text-brown font-medium placeholder:text-taupe/50 shadow-sm"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-brown text-cream text-sm font-bold px-7 py-3 rounded-full hover:bg-brown/80 transition-colors tracking-wide disabled:opacity-50 whitespace-nowrap"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="text-xs text-red-400 mt-3">{errorMsg}</p>
        )}

        <p className="text-xs text-brown/40 font-medium mt-5">
          No spam, ever. Unsubscribe anytime.
        </p>
      </div>
    </section>
  )
}