import { useState, useEffect, useMemo, useCallback } from 'react'
import { FiX } from 'react-icons/fi'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Our Story', path: '/our-story' },
  { label: 'Services', path: '/services' },
  { label: 'Portfolios', path: '/portfolio' },
  { label: 'Spa Packages', path: '/spa-packages' },
  { label: 'Contact', path: '/contact' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()

  // Memo active path
  const activePath = useMemo(() => location.pathname, [location.pathname])

  // Auth state (cleaner)
  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setIsAdmin(!!data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsAdmin(!!session)
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  // Optimized scroll (less re-renders)
  useEffect(() => {
    let ticking = false

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 10)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Close on route change
  useEffect(() => {
    setIsOpen(false)
  }, [activePath])

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut()
    navigate('/')
  }, [navigate])

  return (
    <>
      {/* NAVBAR */}
      <nav
        className={`sticky top-[72px] z-40 transition-all duration-300 backdrop-blur-md bg-cream/70 ${
          scrolled ? 'shadow-md' : 'border-b border-blush/40'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-[64px] flex items-center justify-between">

          {/* Desktop Links */}
          <ul className="hidden md:flex items-center gap-8 flex-1 justify-center">
            {navLinks.map(link => {
              const isActive = activePath === link.path

              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`relative text-sm font-medium tracking-wide transition-colors ${
                      isActive ? 'text-gold' : 'text-taupe hover:text-gold'
                    }`}
                  >
                    {link.label}

                    {/* Smooth underline */}
                    <span
                      className={`absolute left-0 -bottom-1 h-[2px] bg-gold transition-all duration-300 ${
                        isActive ? 'w-full' : 'w-0 group-hover:w-full'
                      }`}
                    />
                  </Link>
                </li>
              )
            })}

            {isAdmin && (
              <>
                <li className="ml-2 pl-2 border-l border-blush/40">
                  <Link
                    to="/admin/dashboard"
                    className={`text-sm font-medium ${
                      activePath === '/admin/dashboard'
                        ? 'text-gold'
                        : 'text-taupe hover:text-gold'
                    }`}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-red-400 hover:text-red-600 transition-colors"
                  >
                    Sign Out
                  </button>
                </li>
              </>
            )}
          </ul>

          {/* Mobile Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="md:hidden ml-auto p-2 rounded-lg hover:bg-blush/20 transition"
          >
            <div className="flex flex-col gap-1.5">
              <span className="w-6 h-0.5 bg-brown" />
              <span className="w-6 h-0.5 bg-brown" />
              <span className="w-6 h-0.5 bg-brown" />
            </div>
          </button>
        </div>
      </nav>

      {/* OVERLAY (always mounted for smoother animation) */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-40 bg-brown/40 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      />

      {/* DRAWER (no mount/unmount → smoother) */}
      <div
        className={`fixed top-0 right-0 h-full w-72 z-50 bg-cream shadow-2xl transform transition-transform duration-300 md:hidden flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-blush/40">
          <span className="font-serif text-lg font-bold text-brown">Menu</span>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-blush/30"
          >
            <FiX />
          </button>
        </div>

        {/* Links */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <ul className="flex flex-col gap-1">
            {navLinks.map(link => {
              const isActive = activePath === link.path

              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition ${
                      isActive
                        ? 'bg-brown text-cream'
                        : 'text-taupe hover:bg-blush/30 hover:text-brown'
                    }`}
                  >
                    {link.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Footer */}
        {isAdmin && (
          <div className="px-6 py-5 border-t border-blush/40">
            <button
              onClick={handleLogout}
              className="w-full text-sm font-bold text-red-400 hover:text-red-600"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </>
  )
}