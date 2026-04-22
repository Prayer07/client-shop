import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Product } from '../types'
import ProductCard from '../components/ProductCard'
import Newsletter from '../components/Newsletter'
import { useSettings } from '../lib/useSettings'
import { motion } from 'framer-motion'
import heroImg from '../../images/img2.jpg'

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
  const { data: settings, isLoading: settingsLoading, isError: settingsError, refetch: refetchSettings } = useSettings()

  return (
    <div className="flex flex-col">

      {/* Hero */}
      <section className="relative overflow-hidden bg-blush/30 border-b border-blush/40">
        <img src={heroImg} alt="Hero" className="absolute inset-0 -z-20 w-full h-full object-cover" />
        <div className="absolute inset-0 -z-10 animated-gradient opacity-60 pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto px-6 py-24 flex flex-col items-center text-center fade-up"
        >
          {settingsLoading ? (
            <div className="w-full flex flex-col items-center gap-4">
              <div className="skeleton h-4 w-28 rounded-full mb-2" />
              <div className="skeleton h-20 md:h-28 w-full md:w-3/4 rounded-xl mb-3" />
              <div className="skeleton h-5 w-2/3 rounded-md" />
              <div className="flex gap-4 mt-8">
                <div className="skeleton rounded-full h-10 w-36" />
                <div className="skeleton rounded-full h-10 w-36" />
              </div>
            </div>
          ) : settingsError ? (
            <div className="w-full flex flex-col items-center gap-4">
              <div className="text-brown/80 font-semibold">Unable to load site content.</div>
              <div className="text-brown/60 text-sm">Check your internet connection and try again.</div>
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => void refetchSettings()}
                  className="bg-brown text-cream text-sm font-bold px-6 py-2 rounded-full"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : (
            <>
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
                  className="bg-brown text-cream text-sm font-bold px-8 py-3 rounded-full tracking-wide
                  transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-brown/80"
                >
                  Book Now
                </Link>

                <Link
                  to="/portfolio"
                  className="border-2 border-brown/40 text-brown text-sm font-bold px-8 py-3 rounded-full tracking-wide
                  transition-all duration-200 hover:scale-105 active:scale-95 hover:border-brown hover:bg-brown/5"
                >
                  View Portfolio
                </Link>
              </div>
            </>
          )}
        </motion.div>
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
            className="text-sm font-bold text-brown underline underline-offset-4 decoration-gold
            transition-all duration-200 hover:text-gold hover:scale-105"
          >
            View All
          </Link>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-blush/30 skeleton aspect-square shadow-sm"
              />
            ))}
          </div>
        )}

        {/* Products */}
        {!isLoading && featured && featured.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 items-stretch">
            {featured.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="h-full hover:scale-[1.03] transition-transform duration-200"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && (!featured || featured.length === 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 text-brown/50 font-medium text-sm"
          >
            Products coming soon. Check back shortly!
          </motion.div>
        )}
      </section>

      {/* About */}
      <section className="bg-blush/20 border-y border-blush/40">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-center"
        >
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
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-64 h-64 rounded-full overflow-hidden border-4 border-cream bg-blush/50 flex items-center justify-center shrink-0 shadow-sm"
            >
              {settings?.about_image ? (
                <img
                  src={settings.about_image}
                  alt="Brand"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-brown/40 font-semibold text-sm">Brand Photo</span>
              )}
            </motion.div>
          </div>
        </motion.div>
      </section>

      <Newsletter />

      {/* CTA */}
      <section className="bg-brown">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div>
            <h2 className="font-serif text-2xl font-black text-cream mb-2">
              Have a custom request?
            </h2>
            <p className="text-cream/60 font-medium text-sm leading-relaxed max-w-md">
              Reach out and let's talk about what you need.
            </p>
          </div>

          <Link
            to="/contact"
            className="bg-gold text-brown text-sm font-bold px-8 py-3 rounded-full tracking-wide
            transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-gold/80"
          >
            Contact Us
          </Link>
        </motion.div>
      </section>

    </div>
  )
}