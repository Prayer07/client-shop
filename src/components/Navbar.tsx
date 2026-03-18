import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Consultation', path: '/consultation' },
  { label: 'My Portfolio', path: '/portfolio' },
  { label: 'Services', path: '/services' },
  { label: 'Contact-Us', path: '/contact' },
  { label: 'Newsletter', path: '/newsletter' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <nav className={`sticky top-0 z-50 transition-shadow bg-cream ${scrolled ? 'shadow-md' : 'border-b border-blush/40'}`}>
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="font-serif text-2xl font-bold text-brown tracking-wide">
          Lammyde Beauty and Spa Lounge
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
          className="md:hidden flex flex-col gap-1.5 p-1"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={`block w-6 h-0.5 bg-brown transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-brown transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-brown transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-blush/30 bg-cream px-6 pb-5">
          <ul className="flex flex-col gap-4 pt-4">
            {navLinks.map(link => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-sm font-medium tracking-wide transition-colors hover:text-gold ${
                    location.pathname === link.path ? 'text-gold' : 'text-taupe'
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
                    onClick={() => setIsOpen(false)}
                    className="text-sm font-medium text-taupe hover:text-gold transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => { setIsOpen(false); handleLogout() }}
                    className="text-sm font-medium text-blush hover:text-brown transition-colors"
                  >
                    Sign Out
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </nav>
  )
}