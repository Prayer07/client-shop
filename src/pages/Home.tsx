import { Link } from 'react-router-dom'
import Newsletter from '../components/Newsletter'

export default function Home() {

  return (
    <div className="flex flex-col">

      {/* Hero */}
      <section className="bg-blush/30 border-b border-blush/40">
        <div className="max-w-6xl mx-auto px-6 py-24 flex flex-col items-center text-center">
          <span className="text-xs font-semibold text-gold uppercase tracking-widest mb-5">
            Welcome
          </span>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-brown leading-tight max-w-2xl">
            Your Brand Headline Goes Here
          </h1>
          <p className="text-taupe mt-5 text-base leading-relaxed max-w-xl">
            A short description of what your client does and who she serves.
            Make it warm, personal and inviting.
          </p>
          <div className="flex gap-4 mt-10">
            {/* <Link
              to="/shop"
              className="bg-brown text-cream text-sm font-medium px-8 py-3 rounded-full hover:bg-brown/80 transition-colors tracking-wide"
            >
              Shop Now
            </Link> */}
            <Link
              to="/portfolio"
              className="border border-brown/30 text-brown text-sm font-medium px-8 py-3 rounded-full hover:border-brown hover:bg-brown/5 transition-colors tracking-wide"
            >
              View My Portfolio
            </Link>
          </div>
        </div>
      </section>

      {/* Divider Strip */}
      <div className="bg-gold/10 border-y border-gold/20 py-4">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-center gap-3">
          <span className="w-16 h-px bg-gold/40" />
          <span className="text-gold text-xs uppercase tracking-widest font-medium">
            Handcrafted with love
          </span>
          <span className="w-16 h-px bg-gold/40" />
        </div>
      </div>

      <Newsletter/>

      {/* About Strip */}
      <section className="bg-blush/20 border-y border-blush/40">
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-xs font-semibold text-gold uppercase tracking-widest">About</span>
            <h2 className="font-serif text-3xl font-bold text-brown mt-2 mb-4">
              A little about the brand
            </h2>
            <p className="text-taupe text-sm leading-relaxed">
              This is a short paragraph about your client, her story, what she does,
              and what makes her brand special. Keep it warm, personal and authentic.
              Replace this with her actual story when she provides it.
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            <div className="w-64 h-64 rounded-full bg-blush/50 border-4 border-cream flex items-center justify-center text-taupe text-sm">
              Brand Photo
            </div>
          </div>
        </div>
      </section>

      {/* CTA Strip */}
      <section className="bg-brown">
        <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-cream mb-2">
              Have a custom request?
            </h2>
            <p className="text-cream/60 text-sm leading-relaxed max-w-md">
              Reach out and let's talk about what you need. We're always happy
              to work on something special just for you.
            </p>
          </div>
          <Link
            to="/contact"
            className="bg-gold text-brown text-sm font-semibold px-8 py-3 rounded-full hover:bg-gold/80 transition-colors tracking-wide shrink-0"
          >
            Contact Us
          </Link>
        </div>
      </section>

    </div>
  )
}