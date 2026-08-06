import { useState, useEffect, useMemo, useCallback } from 'react'
import { FiX } from 'react-icons/fi'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useSettings } from '../lib/useSettings'
import BlurText from './reactbits/BlurText'

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Our Story', path: '/our-story' },
  { label: 'Services', path: '/services' },
  // { label: 'Portfolios', path: '/portfolios' },
  { label: 'Spa Packages', path: '/spa-packages' },
  { label: 'Consultation', path: '/consultation' },
  { label: 'Contacts', path: '/contact' },
  { label: 'Gift Cards', path: '/gift-cards' },
]

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()
  const { data: settings, isLoading } = useSettings()

  const activePath = useMemo(() => location.pathname, [location.pathname])

  useEffect(() => {
    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setIsAdmin(!!data.session)
    })

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsAdmin(!!session)
      }
    )

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  useEffect(() => {
    setIsOpen(false)
  }, [activePath])

  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut()
    navigate('/')
  }, [navigate])

  return (
    <>
      <header className="sticky top-0 z-50 bg-cream/80 backdrop-blur-md border-b border-blush/40">

        {/* MOBILE HEADER */}
        <div className="md:hidden">
          <div className="relative px-6 h-[72px] flex items-center justify-center">

            <Link to="/" className="flex items-center gap-3">
              {settings?.logo_url && (
                <img
                  src={settings.logo_url}
                  alt={settings.brand_name ?? 'Logo'}
                  className={isLoading ? `h-12 w-32 animate-pulse rounded-lg border-2 border-blush bg-gray-200` :`h-12 w-auto object-contain border-2 border-blush rounded-lg`}
                />
              )}
              <h1 className="font-verdana text-sm font-semibold text-brown truncate mr-8">
                {/* {settings?.brand_name ?? 'Lammyde Beauty & Spa Lounge'} */}
                  <BlurText
                    text={settings?.brand_name ?? 'Lammyde Beauty & Spa Lounge'}
                    animateBy='words'
                    direction='top'
                  />
              </h1>
            </Link>

            <button
              onClick={() => setIsOpen(true)}
              className="absolute right-6 p-2 rounded-lg hover:bg-blush/20"
            >
              <div className="flex flex-col gap-1.5">
                <span className="w-6 h-0.5 bg-brown" />
                <span className="w-6 h-0.5 bg-brown" />
                <span className="w-6 h-0.5 bg-brown" />
              </div>
            </button>
          </div>
        </div>

        {/* DESKTOP HEADER */}
        <div className="hidden md:block">

          {/* Brand Name */}
          <div className="max-w-6xl mx-auto py-6 text-center flex items-center justify-center gap-4">
            <Link to="/" className="flex items-center gap-4">
              {settings?.logo_url && (
                <img
                  src={settings.logo_url}
                  alt={settings.brand_name ?? 'Lammyde Beauty & Spa Lounge'}
                  className={isLoading ? `h-16 w-32 rounded-lg border-2 border-blush bg-gray-200 animate-pulse` : `h-16 w-auto object-contain border-2 border-blush rounded-lg`}
                />
              )}
              <h1 className="font-verdana text-3xl font-semibold text-brown tracking-wide">
                {/* {settings?.brand_name ?? 'Lammyde Beauty & Spa Lounge'} */}
                  <BlurText
                    text={settings?.brand_name ?? 'Lammyde Beauty & Spa Lounge'}
                    animateBy='words'
                    direction='top'
                  />
              </h1>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="border-t border-blush/40">
            <div className="max-w-6xl mx-auto">
              <ul className="flex items-center justify-center gap-10 py-4">

                {navLinks.map((link) => {
                  const isActive = activePath === link.path

                  return (
                    <li key={link.path}>
                      <Link
                        to={link.path}
                        className={`text-sm font-medium transition-colors ${
                          isActive
                            ? 'text-gold'
                            : 'text-taupe hover:text-gold'
                        }`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  )
                })}

                {isAdmin && (
                  <>
                    <li className="border-l border-blush/40 pl-6">
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
                        className="text-sm font-medium text-red-400 hover:text-red-600"
                      >
                        Sign Out
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </nav>

        </div>
      </header>

      {/* OVERLAY */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-40 bg-brown/40 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      />

      {/* MOBILE DRAWER */}
      <div
        className={`fixed top-0 right-0 h-full w-72 z-50 bg-cream shadow-2xl transform transition-transform duration-300 md:hidden flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-blush/40">
          <span className="font-semibold text-brown">Menu</span>

          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-blush/30"
          >
            <FiX />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <ul className="flex flex-col gap-2">
            {navLinks.map((link) => {
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