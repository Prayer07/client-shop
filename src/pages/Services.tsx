import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { PortfolioCategory, PortfolioService } from '../types'

const CALENDLY_URL = 'https://calendly.com/lammydebeautyspa/makeover'
const FRESHA_URL = 'https://www.fresha.com/a/lammyde-beauty-and-spa-lounge-airdrie-3078-chinook-winds-drive-southwest-nk7xbjda/booking?allOffer=true&menu=true&pId=2757671&cartId=a5eb826e-fb79-4249-a8f9-82d0f4e7c58e'

const fetchCategories = async (): Promise<PortfolioCategory[]> => {
  const { data, error } = await supabase
    .from('portfolio_categories')
    .select('*')
    .order('display_order', { ascending: true })
  if (error) throw error
  return data
}

const fetchServicesByCategory = async (categoryId: string): Promise<PortfolioService[]> => {
  const { data, error } = await supabase
    .from('portfolio_services')
    .select('*')
    .eq('category_id', categoryId)
    .order('display_order', { ascending: true })
  if (error) throw error
  return data
}

function ServiceCard({ service }: { service: PortfolioService }) {
  const openBooking = (url: string) => {
    if (url === CALENDLY_URL && window.Calendly) {
      window.Calendly.initPopupWidget({ url: CALENDLY_URL })
    } else {
      window.open(url, '_blank')
    }
  }

  return (
    <div className="bg-cream border border-blush/40 rounded-2xl p-5 hover:shadow-md transition-all duration-300 flex flex-col">
      <div className="flex-1">
        <h4 className="font-serif font-black text-brown text-base mb-2">
          {service.name}
        </h4>
        {service.description && (
          <p className="text-xs font-medium text-brown/60 leading-relaxed mb-4">
            {service.description}
          </p>
        )}
      </div>
      <div className="border-t border-blush/30 pt-4 mt-2">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            {service.price && !service.is_price_tbd && (
              <span className="text-sm font-black text-brown">{service.price}</span>
            )}
            {service.is_price_tbd && (
              <span className="text-xs font-bold text-gold">Price on consultation</span>
            )}
            {service.duration && (
              <span className="text-xs font-semibold text-brown/40">{service.duration}</span>
            )}
          </div>
          <button
            onClick={() => openBooking(FRESHA_URL)}
            className="bg-brown text-cream text-xs font-bold px-4 py-2 rounded-full hover:bg-brown/80 transition-colors tracking-wide shrink-0"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  )
}

function CategorySection({ category }: { category: PortfolioCategory }) {
  const [isOpen, setIsOpen] = useState(false)

  const { data: services, isLoading } = useQuery({
    queryKey: ['portfolio-services', category.id],
    queryFn: () => fetchServicesByCategory(category.id),
    enabled: isOpen,
  })

  return (
    <div className="bg-white border border-blush/40 rounded-2xl shadow-sm overflow-hidden">

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-5 hover:bg-blush/10 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          {/* Category Image */}
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-blush/20 shrink-0 border border-blush/30">
            {category.image_url ? (
              <img
                src={category.image_url}
                alt={category.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blush/30">
                <span className="text-xs font-bold text-brown/40 text-center px-1 leading-tight">
                  No Image
                </span>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-serif font-black text-brown text-lg leading-tight">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-xs font-medium text-brown/50 mt-0.5 leading-relaxed max-w-lg">
                {category.description}
              </p>
            )}
          </div>
        </div>

        <div className={`w-8 h-8 rounded-full bg-blush/30 flex items-center justify-center text-brown font-black text-sm shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          v
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-blush/30 px-6 py-6 bg-blush/5">
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-48 rounded-2xl bg-blush/30 animate-pulse" />
              ))}
            </div>
          )}

          {!isLoading && (!services || services.length === 0) && (
            <p className="text-sm font-medium text-brown/40 text-center py-6">
              Services coming soon.
            </p>
          )}

          {!isLoading && services && services.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map(service => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Services() {
  const { data: categories, isLoading, isError } = useQuery({
    queryKey: ['portfolio-categories'],
    queryFn: fetchCategories,
  })

  return (
    <div className="min-h-screen bg-cream">

      <div className="bg-blush/30 border-b border-blush/40">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <span className="text-xs font-bold text-gold uppercase tracking-widest">
            What We Offer
          </span>
          <h1 className="font-serif text-4xl font-black text-brown mt-2">
            Our Services
          </h1>
          <p className="text-brown/60 font-medium text-sm mt-3 max-w-lg mx-auto leading-relaxed">
            From advanced skincare to glamorous beauty services and wellness experiences,
            every treatment is thoughtfully designed to help you look radiant and feel refreshed.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-14">

        <div className="bg-brown rounded-2xl px-8 py-8 mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-serif text-xl font-black text-cream mb-1">
              Not sure which service is right for you?
            </h2>
            <p className="text-cream/60 font-medium text-sm leading-relaxed max-w-md">
              Book a consultation and we'll guide you to the perfect treatment for your skin and beauty goals.
            </p>
          </div>
          <a
            href="/consultation"
            className="bg-gold text-brown text-sm font-bold px-7 py-3 rounded-full hover:bg-gold/80 transition-colors tracking-wide shrink-0"
          >
            Book Consultation
          </a>
        </div>

        {isLoading && (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-blush/30 animate-pulse" />
            ))}
          </div>
        )}

        {isError && (
          <div className="text-center py-20 text-red-400 font-medium text-sm">
            Failed to load Services. Please try again.
          </div>
        )}

        {!isLoading && categories && categories.length > 0 && (
          <div className="flex flex-col gap-4">
            {categories.map(category => (
              <CategorySection key={category.id} category={category} />
            ))}
          </div>
        )}

        <p className="text-center text-xs font-medium text-brown/40 mt-10">
          Click any category to explore services and pricing. Tap Book Now to secure your appointment.
        </p>

      </div>
    </div>
  )
}