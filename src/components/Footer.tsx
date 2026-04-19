import { Link } from 'react-router-dom'
import { useSettings } from '../lib/useSettings'

export default function Footer() {
  const { data: settings } = useSettings()

  const socials = [
    { label: 'Instagram', url: settings?.social_instagram },
    { label: 'Facebook', url: settings?.social_facebook },
    { label: 'TikTok', url: settings?.social_tiktok },
  ].filter(s => s.url && !s.url.includes('placeholder'))

  return (
    <footer className="relative bg-brown text-cream/70 mt-auto">
      <div className="absolute inset-0 -z-10 animated-gradient opacity-10 pointer-events-none" />
      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10 fade-up">

        <div>
          <h3 className="font-serif text-cream text-xl font-bold mb-3 tracking-wide image-figure">
            {settings?.brand_name ?? 'BrandName'}
          </h3>
          <p className="text-sm leading-relaxed text-cream/60">
            {settings?.hero_tagline ?? 'A short tagline about the brand.'}
          </p>
        </div>

        <div>
          <h4 className="text-cream font-semibold mb-4 text-sm uppercase tracking-widest">Quick Links</h4>
          <ul className="flex flex-col gap-2.5 text-sm">
            {[
              { label: 'Home', path: '/' },
              { label: 'Services', path: '/services' },
              { label: 'Portfolio', path: '/portfolio' },
              { label: 'Shop', path: '/shop' },
              { label: 'Consultation', path: '/consultation' },
              { label: 'Contact', path: '/contact' },
            ].map(link => (
              <li key={link.path}>
                <Link to={link.path} className="hover:text-gold transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-cream font-semibold mb-4 text-sm uppercase tracking-widest">Get in Touch</h4>
          <ul className="flex flex-col gap-2.5 text-sm text-cream/60">
            {settings?.contact_email && !settings.contact_email.includes('placeholder') && (
              <li>{settings.contact_email}</li>
            )}
            {settings?.contact_whatsapp && !settings.contact_whatsapp.includes('placeholder') && (
              <li>+{settings.contact_whatsapp}</li>
            )}
            {settings?.contact_location && (
              <li>{settings.contact_location}</li>
            )}
          </ul>

          {socials.length > 0 && (
            <div className="mt-5">
              <h4 className="text-cream font-semibold mb-3 text-sm uppercase tracking-widest">Follow Us</h4>
              <ul className="flex flex-col gap-2.5 text-sm">
                {socials.map(s => (
                  <li key={s.label}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-gold transition-colors"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

      </div>

      <div className="border-t border-cream/10 text-center text-xs py-5 text-cream/30 tracking-wide">
        © {new Date().getFullYear()} {settings?.brand_name ?? 'BrandName'}. All rights reserved.
      </div>
    </footer>
  )
}