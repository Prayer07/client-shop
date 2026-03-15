import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { PortfolioItem } from '../types'

const fetchPortfolio = async (): Promise<PortfolioItem[]> => {
  const { data, error } = await supabase
    .from('portfolio_items')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export default function Portfolio() {
  const { data: items, isLoading, isError } = useQuery({
    queryKey: ['portfolio'],
    queryFn: fetchPortfolio,
  })

  return (
    <section className="max-w-6xl mx-auto px-4 py-12">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Portfolio</h1>
        <p className="text-gray-500 mt-1 text-sm">A collection of our work and projects</p>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-gray-100 animate-pulse aspect-square" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="text-center py-20 text-red-500 text-sm">
          Failed to load portfolio. Please try again later.
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && (!items || items.length === 0) && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-sm">No portfolio items yet. Check back soon!</p>
        </div>
      )}

      {/* Grid */}
      {!isLoading && items && items.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="aspect-square overflow-hidden bg-gray-50">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                    No Image
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                {item.category && (
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {item.category}
                  </span>
                )}
                <h3 className="font-semibold text-gray-900 mt-1">{item.title}</h3>
                {item.description && (
                  <p className="text-sm text-gray-500 mt-1 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </section>
  )
}