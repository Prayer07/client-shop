import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Product } from '../types'
import ProductCard from '../components/ProductCard'

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

  return (
    <div className="flex flex-col">

      {/* Hero */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-20 flex flex-col items-center text-center">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Welcome
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight max-w-2xl">
            {/* ← Swap with client's actual headline */}
            Your Brand Headline Goes Here
          </h1>
          <p className="text-gray-500 mt-4 text-base leading-relaxed max-w-xl">
            {/* ← Swap with client's tagline or short description */}
            A short description of what your client does and who she serves.
            Make it punchy and personal.
          </p>
          <div className="flex gap-3 mt-8">
            <Link
              to="/shop"
              className="bg-gray-900 text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-gray-700 transition-colors"
            >
              Shop Now
            </Link>
            <Link
              to="/portfolio"
              className="border border-gray-300 text-gray-700 text-sm font-medium px-6 py-3 rounded-full hover:border-gray-900 hover:text-gray-900 transition-colors"
            >
              View Portfolio
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-6xl mx-auto px-4 py-16 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
            <p className="text-gray-500 text-sm mt-1">Our latest and most popular items</p>
          </div>
          <Link
            to="/shop"
            className="text-sm font-medium text-gray-900 underline underline-offset-2 hover:text-gray-600 transition-colors"
          >
            View All
          </Link>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-gray-100 animate-pulse aspect-square" />
            ))}
          </div>
        )}

        {/* Products */}
        {!isLoading && featured && featured.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featured.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* No products yet */}
        {!isLoading && (!featured || featured.length === 0) && (
          <div className="text-center py-16 text-gray-400 text-sm">
            Products coming soon. Check back shortly!
          </div>
        )}
      </section>

      {/* About / CTA Strip */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Have a custom request?</h2>
            <p className="text-gray-400 text-sm leading-relaxed max-w-md">
              Reach out and let's talk about what you need. We're always happy to work on something special.
            </p>
          </div>
          <Link
            to="/contact"
            className="bg-white text-gray-900 text-sm font-medium px-6 py-3 rounded-full hover:bg-gray-100 transition-colors shrink-0"
          >
            Contact Us
          </Link>
        </div>
      </section>

    </div>
  )
}