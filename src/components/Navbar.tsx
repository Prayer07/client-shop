import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useSettings } from '../lib/useSettings'

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Services', path: '/services' },
  { label: 'Portfolio', path: '/portfolio' },
  { label: 'Shop', path: '/shop' },
  { label: 'Consultation', path: '/consultation' },
  { label: 'Contact', path: '/contact' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { data: settings } = useSettings()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setIsAdmin(!!data.session))
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => setIsAdmin(!!session))
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Close drawer on route change
  useEffect(() => { setIsOpen(false) }, [location.pathname])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <>
      <nav className={`sticky top-0 z-50 transition-shadow bg-cream ${scrolled ? 'shadow-md' : 'border-b border-blush/40'}`}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-3">
            {settings?.logo_url ? (
              <>
              <img
                src={settings.logo_url}
                alt={settings.brand_name ?? 'Logo'}
                className="h-10 w-auto object-contain"
              /> 
              <span className="font-serif text-2xl font-bold text-brown tracking-wide">
                {settings?.brand_name ?? 'BrandName'}
              </span>
              </>
            ) : (
              <span className="font-serif text-2xl font-bold text-brown tracking-wide">
                {settings?.brand_name ?? 'BrandName'}
              </span>
            )}
          </Link>

          {/* Desktop Links */}
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`text-sm font-medium tracking-wide transition-colors hover:text-gold ${
                    location.pathname === link.path
                      ? 'text-gold border-b-2 border-gold pb-0.5'
                      : 'text-taupe'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {isAdmin && (
              <>
                <li>
                  <Link
                    to="/admin/dashboard"
                    className={`text-sm font-medium tracking-wide transition-colors hover:text-gold ${
                      location.pathname === '/admin/dashboard'
                        ? 'text-gold border-b-2 border-gold pb-0.5'
                        : 'text-taupe'
                    }`}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-blush hover:text-brown transition-colors"
                  >
                    Sign Out
                  </button>
                </li>
              </>
            )}
          </ul>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-blush/20 transition-colors"
            onClick={() => setIsOpen(true)}
            aria-label="Open menu"
          >
            <span className="block w-6 h-0.5 bg-brown" />
            <span className="block w-6 h-0.5 bg-brown" />
            <span className="block w-5 h-0.5 bg-brown" />
          </button>
        </div>
      </nav>

      {/* Mobile Side Drawer Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-brown/40 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Side Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 z-50 bg-cream shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-blush/40">
          {settings?.logo_url ? (
            <img src={settings.logo_url} alt="Logo" className="h-20 w-auto object-contain" />
          ) : (
            <span className="font-serif text-lg font-bold text-brown">
              {settings?.brand_name ?? 'BrandName'}
            </span>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-blush/30 transition-colors text-brown text-lg"
          >
            ✕
          </button>
        </div>

        {/* Drawer Links */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <ul className="flex flex-col gap-1">
            {navLinks.map(link => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-colors ${
                    location.pathname === link.path
                      ? 'bg-brown text-cream'
                      : 'text-taupe hover:bg-blush/30 hover:text-brown'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            {isAdmin && (
              <>
                <li className="mt-4 mb-2">
                  <span className="text-xs font-bold text-gold uppercase tracking-widest px-4">Admin</span>
                </li>
                <li>
                  <Link
                    to="/admin/dashboard"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-colors ${
                      location.pathname === '/admin/dashboard'
                        ? 'bg-brown text-cream'
                        : 'text-taupe hover:bg-blush/30 hover:text-brown'
                    }`}
                  >
                    Dashboard
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Drawer Footer */}
        {isAdmin && (
          <div className="px-6 py-5 border-t border-blush/40">
            <button
              onClick={handleLogout}
              className="w-full text-sm font-bold text-red-400 hover:text-red-600 transition-colors py-2"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </>
  )
}