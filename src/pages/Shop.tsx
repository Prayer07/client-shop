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
    <section className="max-w-6xl mx-auto px-4 py-12">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shop</h1>
        <p className="text-gray-500 mt-1 text-sm">Browse our collection and place an order</p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-gray-100 animate-pulse aspect-square" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="text-center py-20 text-red-500 text-sm">
          Failed to load products. Please try again later.
        </div>
      )}

      {/* Empty state — no products at all */}
      {!isLoading && !isError && products?.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-sm">No products available yet. Check back soon!</p>
        </div>
      )}

      {/* Empty state — search returned nothing */}
      {!isLoading && !isError && products && products.length > 0 && filtered?.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-sm">No products match "<span className="font-medium text-gray-600">{search}</span>"</p>
          <button
            onClick={() => setSearch('')}
            className="mt-3 text-sm text-gray-900 underline underline-offset-2"
          >
            Clear search
          </button>
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && filtered && filtered.length > 0 && (
        <>
          <p className="text-xs text-gray-400 mb-4">
            {filtered.length} {filtered.length === 1 ? 'product' : 'products'} found
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </>
      )}

    </section>
  )
}