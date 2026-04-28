import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { PortfolioItem } from '../types'
import { FiImage } from 'react-icons/fi'
import { useIntersectionObserver } from '../lib/useIntersectionObserver'

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
    <section className="min-h-screen bg-cream">

      <div className="relative overflow-hidden bg-blush/30 border-b border-blush/40">
        <div className="absolute inset-0 -z-10 animated-gradient opacity-60 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 py-16 text-center fade-up">
          <span className="text-xs font-bold text-gold uppercase tracking-widest">Our Work</span>
          <h1 className="font-serif text-4xl font-black text-brown mt-2">Portfolio</h1>
          <p className="text-brown/60 font-medium text-sm mt-3 max-w-md mx-auto leading-relaxed">
            A curated collection of our work, projects and creations
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-14">

        <div className="flex items-center justify-center gap-3 mb-12">
          <span className="w-16 h-px bg-gold/40" />
          <span className="text-gold text-xs font-bold uppercase tracking-widest">Gallery</span>
          <span className="w-16 h-px bg-gold/40" />
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-blush/30 skeleton aspect-square" />
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="text-center py-20 text-red-400 font-medium text-sm">
            Failed to load portfolio. Please try again later.
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && (!items || items.length === 0) && (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-full bg-blush/40 flex items-center justify-center mx-auto mb-4">
              <FiImage className="text-2xl text-brown" />
            </div>
            <p className="text-brown/50 font-semibold text-sm">
              Portfolio coming soon. Check back shortly!
            </p>
          </div>
        )}

        {/* Grid */}
        {!isLoading && items && items.length > 0 && (
          <PortfolioGrid items={items} />
        )}

        {/* Bottom CTA */}
        <div className="mt-20 text-center bg-blush/20 border border-blush/40 rounded-2xl px-6 py-12">
          <span className="text-xs font-bold text-gold uppercase tracking-widest">Interested?</span>
          <h2 className="font-serif text-2xl font-black text-brown mt-2 mb-3">
            Like what you see?
          </h2>
          <p className="text-brown/60 font-medium text-sm leading-relaxed max-w-md mx-auto mb-7">
            Get in touch and let's create something beautiful together.
          </p>
          <a
            href="/contact"
            className="inline-block bg-brown text-cream text-sm font-bold px-8 py-3 rounded-full hover:bg-brown/80 transition-colors tracking-wide"
          >
            Get in Touch
          </a>
        </div>

      </div>
    </section>
  )
}

// ─── Portfolio Grid Component ────────────────────────────────────────────────────
function PortfolioGrid({ items }: { items: PortfolioItem[] }) {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 })

  return (
    <div ref={ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
      {items.map((item, i) => (
        <div
          key={item.id}
          className={`group bg-cream rounded-2xl border border-blush/40 overflow-hidden hover:shadow-lg transition-all duration-300 ${
            isVisible ? 'animate-fade-up' : 'opacity-0'
          }`}
          style={{
            animationDelay: isVisible ? `${i * 100}ms` : '0',
          }}
        >
          <div className="aspect-square overflow-hidden bg-blush/20 relative">
            <div className="absolute inset-0 z-0 skeleton" aria-hidden="true" />
            {item.image_url ? (
              <img
                src={item.image_url}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 image-figure relative z-10"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-brown/30 font-semibold text-sm relative z-10">
                No Image
              </div>
            )}
          </div>
          <div className="p-5">
            {item.category && (
              <span className="text-xs font-bold text-gold uppercase tracking-widest">
                {item.category}
              </span>
            )}
            <h3 className="font-serif font-black text-brown mt-1 text-base">
              {item.title}
            </h3>
            {item.description && (
              <p className="text-sm font-medium text-brown/60 mt-2 leading-relaxed">
                {item.description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}