import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Service } from '../types'

const CALENDLY_URL = 'https://calendly.com/lammydebeautyspa/makeover'

declare global {
  interface Window { Calendly: any }
}

const fetchServices = async (): Promise<Service[]> => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .order('display_order', { ascending: true })
  if (error) throw new Error(error.message)
  return data
}

export default function Services() {
  const { data: services, isLoading, isError } = useQuery({
    queryKey: ['services'],
    queryFn: fetchServices,
  })

  useEffect(() => {
    if (!document.getElementById('calendly-script')) {
      const script = document.createElement('script')
      script.id = 'calendly-script'
      script.src = 'https://assets.calendly.com/assets/external/widget.js'
      script.async = true
      document.body.appendChild(script)
    }
    if (!document.getElementById('calendly-css')) {
      const link = document.createElement('link')
      link.id = 'calendly-css'
      link.rel = 'stylesheet'
      link.href = 'https://assets.calendly.com/assets/external/widget.css'
      document.head.appendChild(link)
    }
  }, [])

  const openCalendly = () => {
    if (window.Calendly) {
      window.Calendly.initPopupWidget({ url: CALENDLY_URL })
    } else {
      window.open(CALENDLY_URL, '_blank')
    }
  }

  return (
    <section className="min-h-screen bg-cream">

      {/* Header */}
      <div className="bg-blush/30 border-b border-blush/40">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <span className="text-xs font-bold text-gold uppercase tracking-widest">What We Offer</span>
          <h1 className="font-serif text-4xl font-black text-brown mt-2">Our Services</h1>
          <p className="text-brown/60 font-medium text-sm mt-3 max-w-md mx-auto leading-relaxed">
            Each treatment is thoughtfully designed to leave you feeling renewed,
            radiant and completely at ease.
          </p>
          <button
            onClick={openCalendly}
            className="mt-8 bg-brown text-cream text-sm font-bold px-8 py-3 rounded-full hover:bg-brown/80 transition-colors tracking-wide inline-block"
          >
            Book an Appointment
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-16">

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-blush/30 animate-pulse h-64" />
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="text-center py-20 text-red-400 font-medium text-sm">
            Failed to load services. Please try again later.
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && (!services || services.length === 0) && (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-full bg-blush/40 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🌸</span>
            </div>
            <p className="text-brown/50 font-semibold text-sm">
              Services coming soon. Check back shortly!
            </p>
          </div>
        )}

        {/* Grid */}
        {!isLoading && services && services.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {services.map(service => (
              <div
                key={service.id}
                className="group bg-white border border-blush/40 rounded-2xl p-6 hover:shadow-lg hover:border-gold/30 transition-all duration-300 flex flex-col"
              >
                {/* <div className="w-12 h-12 rounded-full bg-blush/30 flex items-center justify-center text-2xl mb-4 group-hover:bg-gold/10 transition-colors">
                  {service.emoji ?? '✨'}
                </div> */}
                <h3 className="font-serif font-black text-brown text-base mb-2">
                  {service.title}
                </h3>
                {service.description && (
                  <p className="text-xs font-medium text-brown/60 leading-relaxed flex-1 mb-4">
                    {service.description}
                  </p>
                )}
                <div className="flex items-center justify-between border-t border-blush/30 pt-4 mb-4">
                  {service.duration && (
                    <span className="text-xs font-semibold text-brown/50">⏱ {service.duration}</span>
                  )}
                  {service.price && (
                    <span className="text-xs font-black text-brown">${service.price}</span>
                  )}
                </div>
                <button
                  onClick={openCalendly}
                  className="w-full border-2 border-brown text-brown text-xs font-bold py-2 rounded-full hover:bg-brown hover:text-cream transition-colors tracking-wide"
                >
                  Book Now
                </button>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Bottom CTA */}
      <div className="bg-brown">
        <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-serif text-2xl font-black text-cream mb-2">
              Not sure which service is right for you?
            </h2>
            <p className="text-cream/60 font-medium text-sm leading-relaxed max-w-md">
              Fill out our consultation form and we'll recommend the perfect
              treatment for your needs and goals.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <a
              href="/consultation"
              className="bg-blush text-brown text-sm font-bold px-6 py-3 rounded-full hover:bg-blush/80 transition-colors tracking-wide"
            >
              Consultation Form
            </a>
            <button
              onClick={openCalendly}
              className="bg-gold text-brown text-sm font-bold px-6 py-3 rounded-full hover:bg-gold/80 transition-colors tracking-wide"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

    </section>
  )
}