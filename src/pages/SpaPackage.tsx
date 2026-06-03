import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type{ SpaPackage } from '../types'

const FRESHA_URL = 'https://www.fresha.com/a/lammyde-beauty-and-spa-lounge-airdrie-3078-chinook-winds-drive-southwest-nk7xbjda/booking?allOffer=true&menu=true&pId=2757671&cartId=a5eb826e-fb79-4249-a8f9-82d0f4e7c58e'

const fetchPackages = async (): Promise<SpaPackage[]> => {
  const { data, error } = await supabase
    .from('spa_packages')
    .select('*')
    .order('display_order', { ascending: true })
  if (error) throw error
  return data
}

const packageEmojis: Record<string, string> = {
  'Self-Care Weekend Package': '🌸',
  'Clean-Me-Up Trio': '✨',
  '"I Love My Body" Package': '💛',
  'Annual Wellness Membership': '🌿',
}

export default function SpaPackages() {
  const { data: packages, isLoading, isError } = useQuery({
    queryKey: ['spa-packages'],
    queryFn: fetchPackages,
  })

  return (
    <div className="min-h-screen bg-cream">

      {/* Header */}
      <div className="bg-blush/30 border-b border-blush/40">
        <div className="max-w-5xl mx-auto px-6 py-16 text-center">
          <span className="text-xs font-bold text-gold uppercase tracking-widest">
            Luxury Wellness
          </span>
          <h1 className="font-serif text-4xl font-black text-brown mt-2">
            Spa Packages
          </h1>
          <p className="text-brown/60 font-medium text-sm mt-3 max-w-lg mx-auto leading-relaxed">
            Reconnect with your body, mind, and spirit through our luxury wellness experiences
            thoughtfully designed to promote relaxation, restoration, and self-care.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-14">

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-blush/30 animate-pulse" />
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="text-center py-20 text-red-400 font-medium text-sm">
            Failed to load packages. Please try again.
          </div>
        )}

        {/* Packages Grid */}
        {!isLoading && packages && packages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {packages.map(pkg => (
              <div
                key={pkg.id}
                className={`rounded-2xl border overflow-hidden flex flex-col shadow-sm hover:shadow-lg transition-all duration-300 ${
                  pkg.name === 'Annual Wellness Membership'
                    ? 'bg-brown border-brown'
                    : 'bg-white border-blush/40'
                }`}
              >
                {/* Card Header */}
                <div className={`px-6 pt-6 pb-4 ${
                  pkg.name === 'Annual Wellness Membership' ? '' : ''
                }`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-blush/30 flex items-center justify-center text-2xl shrink-0">
                      {packageEmojis[pkg.name] ?? '✨'}
                    </div>
                    {pkg.price && (
                      <div className={`text-right shrink-0`}>
                        <span className={`font-black text-xl font-serif ${
                          pkg.name === 'Annual Wellness Membership' ? 'text-gold' : 'text-brown'
                        }`}>
                          {pkg.price}
                          <span className="text-xs font-normal text-brown/60 ml-2">
                            ({pkg.duration || 'N/A'})
                          </span>
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className={`font-serif font-black text-xl leading-tight mb-2 ${
                    pkg.name === 'Annual Wellness Membership' ? 'text-cream' : 'text-brown'
                  }`}>
                    {pkg.name}
                  </h3>
                  {pkg.description && (
                    <p className={`text-sm font-medium leading-relaxed ${
                      pkg.name === 'Annual Wellness Membership' ? 'text-cream/60' : 'text-brown/60'
                    }`}>
                      {pkg.description}
                    </p>
                  )}
                </div>

                {/* Includes List */}
                {pkg.includes && pkg.includes.length > 0 && (
                  <div className={`px-6 py-4 flex-1 border-t ${
                    pkg.name === 'Annual Wellness Membership'
                      ? 'border-cream/10'
                      : 'border-blush/30 bg-blush/5'
                  }`}>
                    <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${
                      pkg.name === 'Annual Wellness Membership' ? 'text-gold' : 'text-gold'
                    }`}>
                      What's Included
                    </p>
                    <ul className="flex flex-col gap-2">
                      {pkg.includes.map((item, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-gold text-xs mt-0.5 shrink-0">✦</span>
                          <span className={`text-xs font-medium leading-relaxed ${
                            pkg.name === 'Annual Wellness Membership' ? 'text-cream/70' : 'text-brown/70'
                          }`}>
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Book Button */}
                <div className={`px-6 py-5 border-t ${
                  pkg.name === 'Annual Wellness Membership'
                    ? 'border-cream/10'
                    : 'border-blush/30'
                }`}>
                  <a
                    href={FRESHA_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`block w-full text-center text-sm font-bold py-3 rounded-full transition-colors tracking-wide ${
                      pkg.name === 'Annual Wellness Membership'
                        ? 'bg-gold text-brown hover:bg-gold/80'
                        : 'bg-brown text-cream hover:bg-brown/80'
                    }`}
                  >
                    Book This Package
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && (!packages || packages.length === 0) && (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-full bg-blush/40 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🌿</span>
            </div>
            <p className="text-brown/50 font-semibold text-sm">
              Packages coming soon. Check back shortly!
            </p>
          </div>
        )}

        {/* Gift Note */}
        <div className="mt-14 bg-blush/20 border border-blush/40 rounded-2xl px-8 py-10 text-center">
          <span className="text-xs font-bold text-gold uppercase tracking-widest">
            Perfect Gift Idea
          </span>
          <h2 className="font-serif text-2xl font-black text-brown mt-2 mb-3">
            Treat Someone Special
          </h2>
          <p className="text-brown/60 font-medium text-sm leading-relaxed max-w-md mx-auto mb-7">
            Our spa packages make the perfect gift for birthdays, anniversaries,
            Mother's Day and special occasions. Give the gift of self-care.
          </p>
          <a
            href="/contact"
            className="inline-block bg-brown text-cream text-sm font-bold px-8 py-3 rounded-full hover:bg-brown/80 transition-colors tracking-wide"
          >
            Enquire About Gift Cards
          </a>
        </div>

      </div>
    </div>
  )
}