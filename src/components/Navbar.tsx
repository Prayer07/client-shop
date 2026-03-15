import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Portfolio', path: '/portfolio' },
  { label: 'Shop', path: '/shop' },
  { label: 'Contact', path: '/contact' },
  // { label: 'Admin', path: '/admin' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    // Check session on mount
    supabase.auth.getSession().then(({ data }) => {
      setIsAdmin(!!data.session)
    })

    // Listen for login/logout changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="text-xl font-bold tracking-tight text-gray-900">
          BrandName
        </Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex items-center gap-8">
          {navLinks.map(link => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-black ${
                  location.pathname === link.path
                    ? 'text-black border-b-2 border-black pb-0.5'
                    : 'text-gray-500'
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}

          {/* Admin only links */}
          {isAdmin && (
            <>
              <li>
                <Link
                  to="/admin/dashboard"
                  className={`text-sm font-medium transition-colors hover:text-black ${
                    location.pathname === '/admin/dashboard'
                      ? 'text-black border-b-2 border-black pb-0.5'
                      : 'text-gray-500'
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

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-1"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={`block w-6 h-0.5 bg-gray-800 transition-all ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-gray-800 transition-all ${isOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-gray-800 transition-all ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4">
          <ul className="flex flex-col gap-4 pt-4">
            {navLinks.map(link => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-sm font-medium transition-colors hover:text-black ${
                    location.pathname === link.path ? 'text-black' : 'text-gray-500'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            {/* Admin only — mobile */}
            {isAdmin && (
              <>
                <li>
                  <Link
                    to="/admin/dashboard"
                    onClick={() => setIsOpen(false)}
                    className={`text-sm font-medium transition-colors hover:text-black ${
                      location.pathname === '/admin/dashboard' ? 'text-black' : 'text-gray-500'
                    }`}
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => { setIsOpen(false); handleLogout() }}
                    className="text-sm font-medium text-red-400 hover:text-red-600 transition-colors"
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