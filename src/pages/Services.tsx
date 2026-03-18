import { useEffect } from 'react'

const services = [
  {
    id: 1,
    emoji: '💆‍♀️',
    title: 'Massage Therapy',
    description:
      'Melt away tension with our signature full-body massage. Tailored to your pressure preference — from gentle Swedish relaxation to deep tissue relief.',
    duration: '60 – 90 mins',
    price: 'From $85',
  },
  {
    id: 2,
    emoji: '✨',
    title: 'Facial Treatment',
    description:
      'A deeply cleansing, hydrating facial customised for your skin type. Includes steam, exfoliation, extractions, mask and moisturiser.',
    duration: '60 mins',
    price: 'From $95',
  },
  {
    id: 3,
    emoji: '🌿',
    title: 'Body Wrap',
    description:
      'Detoxify and nourish your skin with our luxurious body wrap. Leaves your skin feeling silky, refreshed and deeply hydrated.',
    duration: '75 mins',
    price: 'From $110',
  },
  {
    id: 4,
    emoji: '🌸',
    title: 'Scrub & Exfoliation',
    description:
      'Buff away dull skin with our full body sugar or salt scrub treatment. Restores your natural glow and preps skin for deeper treatments.',
    duration: '45 mins',
    price: 'From $75',
  },
  {
    id: 5,
    emoji: '👁️',
    title: 'Lash & Brow',
    description:
      'Lash lifts, lash extensions, brow tinting, lamination and shaping. Wake up every morning looking effortlessly polished.',
    duration: '45 – 90 mins',
    price: 'From $65',
  },
  {
    id: 6,
    emoji: '💅',
    title: 'Manicure & Pedicure',
    description:
      'Treat your hands and feet to a relaxing, thorough nail care session. Includes soak, scrub, massage, cuticle care and polish.',
    duration: '45 – 60 mins',
    price: 'From $55',
  },
  {
    id: 7,
    emoji: '🕯️',
    title: 'Spa Packages',
    description:
      'The full experience. Combine your favourite treatments into a curated spa day. Perfect for birthdays, special occasions or just because.',
    duration: '2 – 4 hrs',
    price: 'From $180',
  },
  {
    id: 8,
    emoji: '🪒',
    title: 'Waxing',
    description:
      'Smooth, long-lasting results with our professional waxing services. Available for face, arms, legs, underarms and more.',
    duration: '20 – 45 mins',
    price: 'From $35',
  },
]

const CALENDLY_URL = 'https://calendly.com/lammydebeautyspa/makeover'

declare global {
  interface Window {
    Calendly: any
  }
}

export default function Services() {
  // Load Calendly widget script
  useEffect(() => {
    const existingScript = document.getElementById('calendly-script')
    if (!existingScript) {
      const script = document.createElement('script')
      script.id = 'calendly-script'
      script.src = 'https://assets.calendly.com/assets/external/widget.js'
      script.async = true
      document.body.appendChild(script)
    }

    const existingLink = document.getElementById('calendly-css')
    if (!existingLink) {
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

      {/* Page Header */}
      <div className="bg-blush/30 border-b border-blush/40">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <span className="text-xs font-semibold text-gold uppercase tracking-widest">
            What We Offer
          </span>
          <h1 className="font-serif text-4xl font-bold text-brown mt-2">Our Services</h1>
          <p className="text-taupe text-sm mt-3 max-w-md mx-auto leading-relaxed">
            Each treatment is thoughtfully designed to leave you feeling renewed,
            radiant and completely at ease.
          </p>
          <button
            onClick={openCalendly}
            className="mt-8 bg-brown text-cream text-sm font-medium px-8 py-3 rounded-full hover:bg-brown/80 transition-colors tracking-wide inline-block"
          >
            Book an Appointment
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className="max-w-6xl mx-auto px-6 py-16">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {services.map(service => (
            <div
              key={service.id}
              className="group bg-white border border-blush/40 rounded-2xl p-6 hover:shadow-lg hover:border-gold/30 transition-all duration-300 flex flex-col"
            >
              {/* Emoji Icon */}
              <div className="w-12 h-12 rounded-full bg-blush/30 flex items-center justify-center text-2xl mb-4 group-hover:bg-gold/10 transition-colors">
                {service.emoji}
              </div>

              {/* Info */}
              <h3 className="font-serif font-bold text-brown text-base mb-2">
                {service.title}
              </h3>
              <p className="text-xs text-taupe leading-relaxed flex-1 mb-4">
                {service.description}
              </p>

              {/* Meta */}
              <div className="flex items-center justify-between border-t border-blush/30 pt-4 mb-4">
                <span className="text-xs text-taupe">⏱ {service.duration}</span>
                <span className="text-xs font-semibold text-brown">{service.price}</span>
              </div>

              {/* Book Button */}
              <button
                onClick={openCalendly}
                className="w-full border border-brown text-brown text-xs font-medium py-2 rounded-full hover:bg-brown hover:text-cream transition-colors tracking-wide"
              >
                Book Now
              </button>
            </div>
          ))}
        </div>

      </div>

      {/* Bottom CTA */}
      <div className="bg-brown">
        <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-cream mb-2">
              Not sure which service is right for you?
            </h2>
            <p className="text-cream/60 text-sm leading-relaxed max-w-md">
              Fill out our consultation form and we'll recommend the perfect
              treatment for your needs and goals.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <a
              href="/consultation"
              className="bg-blush text-brown text-sm font-semibold px-6 py-3 rounded-full hover:bg-blush/80 transition-colors tracking-wide"
            >
              Consultation Form
            </a>
            <button
              onClick={openCalendly}
              className="bg-gold text-brown text-sm font-semibold px-6 py-3 rounded-full hover:bg-gold/80 transition-colors tracking-wide"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>

    </section>
  )
}