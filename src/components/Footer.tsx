import { Link } from 'react-router-dom'

const socialLinks = [
  { label: 'Instagram', url: 'https://instagram.com/placeholder' },
  { label: 'Facebook', url: 'https://facebook.com/placeholder' },
  { label: 'TikTok', url: 'https://tiktok.com/@placeholder' },
]

export default function Footer() {
  return (
    <footer className="bg-brown text-cream/70 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* Brand */}
        <div>
          <h3 className="font-serif text-cream text-xl font-bold mb-3 tracking-wide">BrandName</h3>
          <p className="text-sm leading-relaxed text-cream/60">
            A short tagline or description about the brand goes here.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-cream font-semibold mb-4 text-sm uppercase tracking-widest">Quick Links</h4>
          <ul className="flex flex-col gap-2.5 text-sm">
            {[
              { label: 'Home', path: '/' },
              { label: 'Portfolio', path: '/portfolio' },
              { label: 'Shop', path: '/shop' },
              { label: 'Contact', path: '/contact' },
            ].map(link => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className="hover:text-gold transition-colors"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Socials */}
        <div>
          <h4 className="text-cream font-semibold mb-4 text-sm uppercase tracking-widest">Follow Us</h4>
          <ul className="flex flex-col gap-2.5 text-sm">
            {socialLinks.map(social => (
              <li key={social.label}>
                <a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="border-t border-cream/10 text-center text-xs py-5 text-cream/30 tracking-wide">
        © {new Date().getFullYear()} BrandName. All rights reserved.
      </div>
    </footer>
  )
}