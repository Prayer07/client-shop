import { useState, useEffect, useMemo, useCallback } from 'react'
import { FiLogOut, FiX } from 'react-icons/fi'
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

// border + shadow only (shared by the pills and the drawer)
const glassEdge =
  'border border-white/50 ' +
  'shadow-[0_8px_32px_rgba(60,40,30,0.15),inset_0_1px_0_rgba(255,255,255,0.7),inset_0_-1px_0_rgba(255,255,255,0.2)]'

// header pills
const glass = `bg-white/30 backdrop-blur-xl backdrop-saturate-150 ${glassEdge}`

// drawer: slightly stronger so the text stays readable
const glassDrawer = `bg-white/40 backdrop-blur-2xl backdrop-saturate-150 ${glassEdge}`

const Sheen = () => (
  <span
    aria-hidden
    className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] bg-gradient-to-b from-white/40 via-transparent to-transparent"
  />
)

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()
  const { data: settings } = useSettings()

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

  const pillWidth = isAdmin ? 'max-w-[90rem]' : 'max-w-6xl'
  const brandShow = isAdmin ? 'hidden 2xl:block' : 'hidden xl:block'
  const linkPad = isAdmin ? 'px-3' : 'px-3 lg:px-4'

  return (
    <>
      <header className="sticky top-0 z-50 px-4 pt-3 pb-2">

        {/* MOBILE */}
        <div className={`${glass} relative md:hidden h-14 rounded-full pl-3 pr-2 flex items-center justify-between`}>
          <Sheen />
          <Link to="/" className="relative z-10 flex items-center gap-2 min-w-0">
            <img src="/logo.png" alt="Logo" className="h-9 w-auto object-contain rounded-full" />
            <h1 className="text-base font-semibold text-brown truncate">
              <BlurText
                text={settings?.brand_name ?? 'Lammyde Beauty & Spa Lounge'}
                animateBy="words"
                direction="top"
                className="font-serif"
              />
            </h1>
          </Link>

          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open menu"
            className="relative z-10 h-10 w-10 shrink-0 rounded-full bg-white/40 border border-white/60 flex items-center justify-center active:scale-95 transition"
          >
            <div className="flex flex-col gap-1">
              <span className="w-5 h-0.5 bg-brown rounded" />
              <span className="w-5 h-0.5 bg-brown rounded" />
              <span className="w-5 h-0.5 bg-brown rounded" />
            </div>
          </button>
        </div>

        {/* DESKTOP */}
        <div className={`${glass} relative hidden md:flex ${pillWidth} mx-auto h-16 rounded-full px-3 items-center justify-between gap-4`}>
          <Sheen />

          <Link to="/" className="relative z-10 flex items-center gap-3 pl-1 shrink-0">
            <img src="/logo.png" alt="Logo" className="h-10 w-auto object-contain rounded-full" />
            <h1 className={`${brandShow} whitespace-nowrap text-xl font-semibold text-brown tracking-wide`}>
              <BlurText
                text={settings?.brand_name ?? 'Lammyde Beauty & Spa Lounge'}
                animateBy="words"
                direction="top"
                className="font-serif"
              />
            </h1>
          </Link>

          <nav className="relative z-10">
            <ul className="flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = activePath === link.path
                return (
                  <li key={link.path}>
                    <Link
                      to={link.path}
                      className={`block whitespace-nowrap rounded-full ${linkPad} py-2 text-[13px] lg:text-sm font-medium transition-all duration-300 ${
                        isActive
                          ? 'bg-white/60 text-brown shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_2px_8px_rgba(60,40,30,0.12)]'
                          : 'text-brown/70 hover:bg-white/30 hover:text-brown'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                )
              })}

              {/* admin only: Dashboard pill + sign-out icon */}
              {isAdmin && (
                <>
                  <li className="ml-2 pl-3 border-l border-white/50">
                    <Link
                      to="/mainadmin/dashboard"
                      className={`block whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                        activePath === '/mainadmin/dashboard'
                          ? 'bg-brown text-cream shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]'
                          : 'bg-white/40 text-brown hover:bg-white/60'
                      }`}
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      aria-label="Sign out"
                      title="Sign out"
                      className="h-10 w-10 flex items-center justify-center rounded-full text-red-500 hover:bg-red-500/10 transition"
                    >
                      <FiLogOut size={18} />
                    </button>
                  </li>
                </>
              )}
            </ul>
          </nav>
        </div>
      </header>

      {/* OVERLAY */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-40 bg-brown/30 backdrop-blur-sm md:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      />

      {/* MOBILE DRAWER: floating glass panel */}
      <div
        aria-hidden={!isOpen}
        className={`${glassDrawer} fixed top-3 right-3 z-50 h-[calc(100dvh-1.5rem)] w-72 rounded-3xl md:hidden flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-[110%] pointer-events-none'
        }`}
      >
        <Sheen />

        <div className="relative z-10 flex items-center justify-between px-6 py-5">
          <span className="font-serif font-semibold text-brown">Menu</span>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-white/40 border border-white/60 text-brown"
          >
            <FiX />
          </button>
        </div>

        <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-6">
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive = activePath === link.path
              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`flex items-center px-4 py-3 rounded-2xl text-sm font-semibold transition ${
                      isActive
                        ? 'bg-white/60 text-brown shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]'
                        : 'text-brown/70 hover:bg-white/30 hover:text-brown'
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
          <div className="relative z-10 px-4 py-5 border-t border-white/40 flex flex-col gap-2">
            <Link
              to="/mainadmin/dashboard"
              className="flex items-center justify-center rounded-2xl bg-brown text-cream px-4 py-3 text-sm font-semibold"
            >
              Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 rounded-2xl bg-white/40 border border-white/60 px-4 py-3 text-sm font-semibold text-red-500"
            >
              <FiLogOut /> Sign Out
            </button>
          </div>
        )}
      </div>
    </>
  )
}