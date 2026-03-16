import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Product } from '../types'
import ProductCard from '../components/ProductCard'
import SearchBar from '../components/SearchBar'

const fetchProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export default function Shop() {
  const [search, setSearch] = useState('')

  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  })

  const filtered = products?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <section className="min-h-screen bg-cream">

      {/* Page Header */}
      <div className="bg-blush/30 border-b border-blush/40">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <span className="text-xs font-semibold text-gold uppercase tracking-widest">Our Collection</span>
          <h1 className="font-serif text-4xl font-bold text-brown mt-2">Shop</h1>
          <p className="text-taupe text-sm mt-3 max-w-md mx-auto leading-relaxed">
            Browse our handpicked collection and place an order directly via WhatsApp
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">

        {/* Search */}
        <div className="flex justify-center mb-10">
          <SearchBar value={search} onChange={setSearch} />
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-blush/30 animate-pulse aspect-square" />
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="text-center py-20 text-red-400 text-sm">
            Failed to load products. Please try again later.
          </div>
        )}

        {/* No products at all */}
        {!isLoading && !isError && products?.length === 0 && (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-full bg-blush/40 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🛍️</span>
            </div>
            <p className="text-taupe text-sm">No products available yet. Check back soon!</p>
          </div>
        )}

        {/* Search returned nothing */}
        {!isLoading && !isError && products && products.length > 0 && filtered?.length === 0 && (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-full bg-blush/40 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔍</span>
            </div>
            <p className="text-taupe text-sm">
              No products match{' '}
              <span className="font-medium text-brown">"{search}"</span>
            </p>
            <button
              onClick={() => setSearch('')}
              className="mt-4 text-sm text-brown underline underline-offset-4 decoration-gold hover:text-gold transition-colors"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && filtered && filtered.length > 0 && (
          <>
            <p className="text-xs text-taupe mb-6 text-center">
              {filtered.length} {filtered.length === 1 ? 'product' : 'products'} found
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filtered.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}

      </div>
    </section>
  )
}