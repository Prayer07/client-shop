import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-2xl mx-auto px-6 py-16 text-center"
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
      </motion.div>
    </div>
  )
}
