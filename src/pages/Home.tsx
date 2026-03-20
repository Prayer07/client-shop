import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Product } from '../types'
import ProductCard from '../components/ProductCard'
import Newsletter from '../components/Newsletter'
import { useSettings } from '../lib/useSettings'

const fetchFeaturedProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(4)
  if (error) throw new Error(error.message)
  return data
}

export default function Home() {
  const { data: featured, isLoading } = useQuery({
    queryKey: ['featured-products'],
    queryFn: fetchFeaturedProducts,
  })
  const { data: settings } = useSettings()

  return (
    <div className="flex flex-col">

      {/* Hero */}
      <section className="bg-blush/30 border-b border-blush/40">
        <div className="max-w-6xl mx-auto px-6 py-24 flex flex-col items-center text-center">
          <span className="text-xs font-bold text-gold uppercase tracking-widest mb-5">
            Welcome
          </span>
          <h1 className="font-serif text-5xl md:text-6xl font-black text-brown leading-tight max-w-2xl">
            {settings?.hero_headline ?? 'Your Brand Headline Goes Here'}
          </h1>
          <p className="text-brown/70 font-medium mt-5 text-base leading-relaxed max-w-xl">
            {settings?.hero_tagline ?? 'A short description of what your client does and who she serves.'}
          </p>
          <div className="flex gap-4 mt-10">
            <Link
              to="/services"
              className="bg-brown text-cream text-sm font-bold px-8 py-3 rounded-full hover:bg-brown/80 transition-colors tracking-wide"
            >
              Book Now
            </Link>
            <Link
              to="/portfolio"
              className="border-2 border-brown/40 text-brown text-sm font-bold px-8 py-3 rounded-full hover:border-brown hover:bg-brown/5 transition-colors tracking-wide"
            >
              View Portfolio
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="bg-gold/10 border-y border-gold/20 py-4">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-center gap-3">
          <span className="w-16 h-px bg-gold/40" />
          <span className="text-gold text-xs font-bold uppercase tracking-widest">
            Handcrafted with love
          </span>
          <span className="w-16 h-px bg-gold/40" />
        </div>
      </div>

      {/* Featured Products */}
      <section className="max-w-6xl mx-auto px-6 py-20 w-full">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-xs font-bold text-gold uppercase tracking-widest">Collection</span>
            <h2 className="font-serif text-3xl font-black text-brown mt-1">Featured Products</h2>
            <p className="text-brown/60 font-medium text-sm mt-2">Our latest and most loved items</p>
          </div>
          <Link
            to="/shop"
            className="text-sm font-bold text-brown underline underline-offset-4 decoration-gold hover:text-gold transition-colors"
          >
            View All
          </Link>
        </div>

        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-blush/30 animate-pulse aspect-square" />
            ))}
          </div>
        )}

        {!isLoading && featured && featured.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {!isLoading && (!featured || featured.length === 0) && (
          <div className="text-center py-16 text-brown/50 font-medium text-sm">
            Products coming soon. Check back shortly!
          </div>
        )}
      </section>

      {/* About Strip */}
      <section className="bg-blush/20 border-y border-blush/40">
        <div className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <span className="text-xs font-bold text-gold uppercase tracking-widest">About</span>
            <h2 className="font-serif text-3xl font-black text-brown mt-2 mb-4">
              A little about the brand
            </h2>
            <p className="text-brown/70 font-medium text-sm leading-relaxed">
              {settings?.about_text ?? 'This is a short paragraph about your brand, your story, and what makes you special.'}
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            <div className="w-64 h-64 rounded-full overflow-hidden border-4 border-cream bg-blush/50 flex items-center justify-center shrink-0">
              {settings?.about_image ? (
                <img
                  src={settings.about_image}
                  alt="Brand"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-brown/40 font-semibold text-sm">Brand Photo</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <Newsletter />

      {/* CTA Strip */}
      <section className="bg-brown">
        <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-serif text-2xl font-black text-cream mb-2">
              Have a custom request?
            </h2>
            <p className="text-cream/60 font-medium text-sm leading-relaxed max-w-md">
              Reach out and let's talk about what you need. We're always happy
              to work on something special just for you.
            </p>
          </div>
          <Link
            to="/contact"
            className="bg-gold text-brown text-sm font-bold px-8 py-3 rounded-full hover:bg-gold/80 transition-colors tracking-wide shrink-0"
          >
            Contact Us
          </Link>
        </div>
      </section>

    </div>
  )
}