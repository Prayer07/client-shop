import { Link } from 'react-router-dom'

// ← Drop your client's social links here when she provides them
const socialLinks = [
  { label: 'Instagram', url: 'https://instagram.com/placeholder' },
  { label: 'Facebook', url: 'https://facebook.com/placeholder' },
  { label: 'TikTok', url: 'https://tiktok.com/@placeholder' },
]

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Brand */}
        <div>
          <h3 className="text-white font-bold text-lg mb-2">BrandName</h3>
          <p className="text-sm leading-relaxed">
            A short tagline or description about the brand goes here.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white font-semibold mb-3">Quick Links</h4>
          <ul className="flex flex-col gap-2 text-sm">
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/portfolio" className="hover:text-white transition-colors">Portfolio</Link></li>
            <li><Link to="/shop" className="hover:text-white transition-colors">Shop</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>

        {/* Socials */}
        <div>
          <h4 className="text-white font-semibold mb-3">Follow Us</h4>
          <ul className="flex flex-col gap-2 text-sm">
            {socialLinks.map(social => (
              <li key={social.label}>
                <a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

      </div>

      <div className="border-t border-gray-800 text-center text-xs py-4 text-gray-600">
        © {new Date().getFullYear()} BrandName. All rights reserved.
      </div>
    </footer>
  )
}