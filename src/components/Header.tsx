import { Link } from 'react-router-dom'
import { useSettings } from '../lib/useSettings'
import { memo, useMemo } from 'react'
import BlurText from './reactbits/BlurText'

function Header() {
  const { data: settings, isLoading } = useSettings()

  // Memoize brand name to prevent unnecessary re-renders
  const brandName = useMemo(() => {
    return settings?.brand_name || 'Lammyde Beauty'
  }, [settings?.brand_name])

  return (
    <header className="sticky top-0 z-50 bg-cream/80 backdrop-blur-md border-b border-blush/40">
      <div className="max-w-6xl mx-auto px-6 h-[72px] flex items-center justify-between">
        
        {/* Logo / Brand */}
        <Link
          to="/"
          className="flex items-center gap-3 group"
        >
          {/* Logo Placeholder (prevents layout shift) */}
          <div className="h-12 w-12 rounded-md bg-blush/20 flex items-center justify-center overflow-hidden">
            {isLoading ? (
              <div className="h-full w-full animate-pulse bg-blush/30" />
            ) : settings?.logo_url ? (
              <img
                src={settings.logo_url}
                alt={brandName}
                className="h-full w-full object-contain"
                loading="lazy"
              />
            ) : (
              <span className="text-sm font-bold text-brown">
                {brandName.charAt(0)}
              </span>
            )}
          </div>

          {/* Brand Name */}
          <div className="overflow-hidden">
            {isLoading ? (
              <div className="h-5 w-32 rounded-md animate-pulse bg-blush/30" />
            ) : (
              <BlurText
                text={brandName}
                delay={120}
                animateBy="words"
                direction="top"
                className="font-serif text-xl md:text-2xl font-semibold text-brown tracking-wide"
              />
            )}
          </div>
        </Link>

        {/* Future Nav / Actions */}
        <div className="hidden md:flex items-center gap-6 text-sm text-brown/80">
          {/* placeholder for nav items */}
        </div>
      </div>
    </header>
  )
}

export default memo(Header)