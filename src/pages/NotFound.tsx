import { Link } from 'react-router-dom'
import { useIntersectionObserver } from '../lib/useIntersectionObserver'

export default function NotFound() {
  const { ref, isVisible } = useIntersectionObserver()

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div
        ref={ref}
        className={`max-w-2xl mx-auto px-6 py-16 text-center transition-all duration-700 ${
          isVisible ? 'animate-fade-up opacity-100' : 'opacity-0'
        }`}
      >
        <span className="text-xs font-bold text-gold uppercase tracking-widest">404</span>
        <h1 className="font-serif text-4xl md:text-5xl font-black text-brown mt-4">Page not found</h1>
        <p className="text-brown/70 mt-4">Sorry, we couldn't find the page you're looking for.</p>

        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            to="/"
            className="bg-brown text-cream text-sm font-bold px-6 py-3 rounded-full tracking-wide hover:bg-brown/90"
          >
            Back to Home
          </Link>

          <Link
            to="/contact"
            className="text-sm font-bold text-brown underline underline-offset-4 decoration-gold hover:text-gold"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}
