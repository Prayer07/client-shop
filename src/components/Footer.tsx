import { Link } from 'react-router-dom'
import { useSettings } from '../lib/useSettings';

export default function Footer() {
  const { data: settings } = useSettings()

  const socials = [
    { label: 'Instagram', url: settings?.social_instagram },
    { label: 'Facebook', url: settings?.social_facebook },
    { label: 'TikTok', url: settings?.social_tiktok },
  ].filter(s => s.url && !s.url.includes('placeholder'))

  return (
    <footer className="bg-brown text-cream/70 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* Brand */}
        <div>
          {settings?.logo_url ? (
            <img
              src={settings.logo_url}
              alt={settings.brand_name ?? 'Logo'}
              className="h-14 w-auto object-contain mb-3 border-2 border-blush rounded-lg"
            />
          ) : (
            <h3 className="font-serif text-cream text-xl font-bold mb-3 tracking-wide">
              {settings?.brand_name ?? 'Lammyde Beauty & Spa Lounge'}
            </h3>
          )}
          <p className="text-sm leading-relaxed text-cream/60">
            {settings?.hero_tagline ?? 'Beauty is curated, confidence is restored, and self-care becomes a lifestyle.'}
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-cream font-bold mb-4 text-sm uppercase tracking-widest">Quick Links</h4>
          <ul className="flex flex-col gap-2.5 text-sm">
            {[
              { label: 'Home', path: '/' },
              { label: 'Our Story', path: '/our-story' },
              { label: 'Services', path: '/services' },
              //{ label: 'Portfolios', path: '/portfolios' },
              { label: 'Spa Packages', path: '/spa-packages' },
              { label: 'Contact', path: '/contact' },
            ].map(link => (
              <li key={link.path}>
                <Link to={link.path} className="hover:text-gold transition-colors font-medium">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact & Socials */}
        <div>
          <h4 className="text-cream font-bold mb-4 text-sm uppercase tracking-widest">Get in Touch</h4>
          <ul className="flex flex-col gap-2.5 text-sm text-cream/60 mb-6">
            {settings?.contact_email && !settings.contact_email.includes('placeholder') && (
              <li className="font-medium">{settings.contact_email}</li>
            )}
            {settings?.contact_whatsapp && !settings.contact_whatsapp.includes('placeholder') && (
              <li className="font-medium">+{settings.contact_whatsapp}</li>
            )}
            {settings?.contact_location && (
              <li className="font-medium">{settings.contact_location}</li>
            )}
          </ul>

          {socials.length > 0 && (
            <div>
              <h4 className="text-cream font-bold mb-3 text-sm uppercase tracking-widest">Follow Us</h4>
              <ul className="flex flex-col gap-2.5 text-sm">
                {socials.map(s => (
                  <li key={s.label}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-gold transition-colors font-medium"
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

      <div className="border-t border-cream/10 text-center text-xs py-5 text-cream/30 tracking-wide font-medium">
        © {new Date().getFullYear()} {settings?.brand_name ?? 'Lammyde Beauty & Spa Lounge'}. All rights reserved.
      </div>
    </footer>
  )
}