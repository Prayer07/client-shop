import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Invalid email or password')
      setLoading(false)
      return
    }

    navigate('/admin/dashboard')
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-brown">Lammyde Beauty and Spa Lounge</h1>
          <div className="flex items-center justify-center gap-3 mt-3">
            <span className="w-10 h-px bg-gold/40" />
            <span className="text-gold text-xs uppercase tracking-widest font-medium">Admin Portal</span>
            <span className="w-10 h-px bg-gold/40" />
          </div>
        </div>

        <div className="bg-white border border-blush/40 rounded-2xl shadow-sm p-8">
          <div className="mb-6">
            <h2 className="font-serif text-xl font-bold text-brown">Welcome back</h2>
            <p className="text-taupe text-xs mt-1">Sign in to manage your shop</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-brown block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full border border-blush rounded-lg px-3 py-2.5 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-gold/40 text-brown placeholder:text-taupe/50"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-brown block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-blush rounded-lg px-3 py-2.5 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-gold/40 text-brown placeholder:text-taupe/50"
              />
            </div>

            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brown text-cream font-medium py-3 rounded-full hover:bg-brown/80 transition-colors text-sm tracking-wide disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}