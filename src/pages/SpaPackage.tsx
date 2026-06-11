import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { SpaPackage } from '../types'

const FRESHA_URL =
  'https://www.fresha.com/a/lammyde-beauty-and-spa-lounge-airdrie-3078-chinook-winds-drive-southwest-nk7xbjda/booking?allOffer=true&menu=true&pId=2757671&cartId=a5eb826e-fb79-4249-a8f9-82d0f4e7c58e'

const fetchPackages = async (): Promise<SpaPackage[]> => {
  const { data, error } = await supabase
    .from('spa_packages')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) throw error

  return data
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
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <span className="text-xs font-bold text-gold uppercase tracking-widest">
            Luxury Wellness
          </span>

          <h1 className="font-serif text-4xl font-black text-brown mt-2">
            Spa Packages
          </h1>

          <p className="text-brown/60 font-medium text-sm mt-3 max-w-lg mx-auto leading-relaxed">
            Reconnect with your body, mind, and spirit through our luxury
            wellness experiences thoughtfully designed to promote relaxation,
            restoration, and self-care.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-14">
        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-[340px] rounded-3xl bg-blush/30 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="text-center py-20 text-red-400 font-medium text-sm">
            Failed to load packages. Please try again.
          </div>
        )}

        {/* Packages */}
        {!isLoading && packages && packages.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {packages.map((pkg) => {
              const isMembership =
                pkg.name === 'Annual Wellness Membership'

              return (
                <div
                  key={pkg.id}
                  className={`rounded-3xl border overflow-hidden flex flex-col h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    isMembership
                      ? 'bg-brown border-brown'
                      : 'bg-white border-blush/40'
                  }`}
                >
                  {/* Content */}
                  <div className="p-7 flex-1 flex flex-col">
                    {/* Top */}
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div>
                        <span
                          className={`text-[10px] uppercase tracking-[0.25em] font-bold ${
                            isMembership ? 'text-gold' : 'text-gold'
                          }`}
                        >
                          SPA PACKAGE
                        </span>

                        <h3
                          className={`font-serif text-2xl font-black mt-3 leading-tight ${
                            isMembership
                              ? 'text-cream'
                              : 'text-brown'
                          }`}
                        >
                          {pkg.name}
                        </h3>
                      </div>

                      <div className="text-right shrink-0">
                        {pkg.price && (
                          <div
                            className={`font-serif text-3xl font-black ${
                              isMembership
                                ? 'text-gold'
                                : 'text-gold'
                            }`}
                          >
                            CA${pkg.price}
                          </div>
                        )}

                        {pkg.duration && (
                          <div
                            className={`text-xs mt-1 font-medium ${
                              isMembership
                                ? 'text-cream/60'
                                : 'text-brown/50'
                            }`}
                          >
                            {pkg.duration}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="flex-1">
                      {pkg.description && (
                        <p
                          className={`text-sm leading-8 ${
                            isMembership
                              ? 'text-cream/75'
                              : 'text-brown/65'
                          }`}
                        >
                          {pkg.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer */}
                  <div
                    className={`p-6 border-t ${
                      isMembership
                        ? 'border-white/10'
                        : 'border-blush/30'
                    }`}
                  >
                    <a
                      href={FRESHA_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block w-full text-center py-3.5 rounded-full text-sm font-bold tracking-wide transition-all duration-300 hover:scale-[1.02] ${
                        isMembership
                          ? 'bg-gold text-brown hover:bg-gold/90'
                          : 'bg-brown text-cream hover:bg-brown/90'
                      }`}
                    >
                      Book This Package
                    </a>
                  </div>
                </div>
              )
            })}
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

        {/* Gift Cards */}
        <div className="mt-16 bg-blush/20 border border-blush/40 rounded-3xl px-8 py-12 text-center">
          <span className="text-xs font-bold text-gold uppercase tracking-widest">
            Perfect Gift Idea
          </span>

          <h2 className="font-serif text-3xl font-black text-brown mt-2 mb-4">
            Treat Someone Special
          </h2>

          <p className="text-brown/60 font-medium text-sm leading-relaxed max-w-md mx-auto mb-8">
            Our spa packages make the perfect gift for birthdays,
            anniversaries, Mother's Day, and other special occasions.
            Give the gift of self-care.
          </p>

          <a
            href="/contact"
            className="inline-block bg-brown text-cream text-sm font-bold px-8 py-3 rounded-full hover:bg-brown/90 transition-all duration-300"
          >
            Enquire About Gift Cards
          </a>
        </div>
      </div>
    </div>
  )
}