import { Link } from 'react-router-dom'
// import { useQuery } from '@tanstack/react-query'
import { memo, useMemo } from 'react'
// import { supabase } from '../lib/supabase'
// import type { Product } from '../types'
// import ProductCard from '../components/ProductCard'
import Newsletter from '../components/Newsletter'
import { useSettings } from '../lib/useSettings'
import { useIntersectionObserver } from '../lib/useIntersectionObserver'
import heroImg from '../../images/img2.webp'
import BlurText from '../components/reactbits/BlurText'
import TextType from '../components/reactbits/TextType'

// const fetchFeaturedProducts = async (): Promise<Product[]> => {
//   const { data, error } = await supabase
//     .from('products')
//     .select('*')
//     .order('created_at', { ascending: false })
//     .limit(4)

//   if (error) throw new Error(error.message)
//   return data
// }

export default function Home() {
  // const { data: featured = [], isLoading } = useQuery({
  //   queryKey: ['featured-products'],
  //   queryFn: fetchFeaturedProducts,
  //   staleTime: 1000 * 60 * 5,
  //   gcTime: 1000 * 60 * 10,
  //   refetchOnWindowFocus: false,
  // })

  const {
    data: settings,
    isLoading: settingsLoading,
    isError: settingsError,
    refetch,
  } = useSettings()

  const heroHeadline = useMemo(
    () => settings?.hero_headline || 'Your Brand Headline Goes Here',
    [settings?.hero_headline]
  )

  const heroTagline = useMemo(
    () => settings?.hero_tagline || 'Luxury beauty crafted for you.',
    [settings?.hero_tagline]
  )

  return (
    <div className="flex flex-col">

      {/* HERO */}
      <section className="relative overflow-hidden min-h-[calc(100vh-72px)] border-b border-blush/40">
        <img
          src={heroImg}
          alt="Hero"
          className="absolute inset-0 -z-20 w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />

        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blush/70 via-cream/40 to-transparent" />

        <div className="max-w-6xl mx-auto px-6 min-h-[calc(100vh-72px)] flex flex-col justify-center items-center text-center">

          {settingsLoading ? (
            <HeroSkeleton />
          ) : settingsError ? (
            <ErrorState onRetry={refetch} />
          ) : (
            <>
              <span className="text-2xl md:text-6xl font-bold text-white uppercase tracking-widest mb-5">
                Find your glow.Bring out the elevated you.
              </span>

              <div className="h-[120px] flex items-center justify-center">
                <h1 className="font-serif text-3xl md:text-5xl font-black text-brown max-w-3xl leading-tight">
                  <TextType
                    text={[heroHeadline]}
                    typingSpeed={75}
                    pauseDuration={1500}
                    showCursor
                    cursorCharacter="_"
                  />
                </h1>
              </div>

              <div className="h-[40px] flex items-center justify-center">
                <BlurText
                  text={heroTagline}
                  delay={120}
                  animateBy="words"
                  direction="top"
                  className="text-xl md:text-2xl mt-6 text-brown/75 max-w-xl"
                />
              </div>

              <div className="flex gap-4 mt-10">
                <CTAButton to="/services" primary>
                  Book Now
                </CTAButton>

                <CTAButton to="/services">
                  View our Services
                </CTAButton>
              </div>
            </>
          )}
        </div>
      </section>

      {/* FEATURED */}
      {/* <section className="max-w-6xl mx-auto px-6 py-24 w-full">
        <SectionHeader
          eyebrow="Collection"
          title="Featured Products"
          subtitle="Our latest and most loved items"
        />

        {isLoading ? (
          <ProductSkeleton />
        ) : (
          <ProductsGrid products={featured} />
        )}
      </section> */}

      <AboutSection settings={settings} />

      <Newsletter />

      <CTASection />
    </div>
  )
}

const HeroSkeleton = memo(() => (
  <div className="space-y-5 w-full max-w-3xl animate-pulse">
    <div className="h-4 w-24 bg-blush/30 rounded mx-auto" />
    <div className="h-24 bg-blush/30 rounded-xl" />
    <div className="h-6 w-2/3 bg-blush/30 rounded mx-auto" />
  </div>
))

const ErrorState = memo(({ onRetry }: { onRetry: () => void }) => (
  <div className="text-center">
    <p className="text-brown mb-4">Unable to load content.</p>
    <button
      onClick={() => void onRetry()}
      className="bg-brown text-cream px-6 py-3 rounded-full"
    >
      Retry
    </button>
  </div>
))

const CTAButton = memo(
  ({
    to,
    children,
    primary = false,
  }: {
    to: string
    children: React.ReactNode
    primary?: boolean
  }) => (
    <Link
      to={to}
      className={`px-8 py-3 rounded-full text-sm font-bold transition-all duration-300 hover:scale-105 ${
        primary
          ? 'bg-brown text-cream hover:bg-brown/85'
          : 'border-2 border-brown/30 text-brown hover:bg-brown/5'
      }`}
    >
      {children}
    </Link>
  )
)

// const SectionHeader = memo(
//   ({
//     eyebrow,
//     title,
//     subtitle,
//   }: {
//     eyebrow: string
//     title: string
//     subtitle: string
//   }) => (
//     <div className="mb-12">
//       <span className="text-xs font-bold text-gold uppercase tracking-widest">
//         {eyebrow}
//       </span>
//       <h2 className="font-serif text-4xl font-black text-brown mt-2">
//         {title}
//       </h2>
//       <p className="text-brown/60 mt-2">{subtitle}</p>
//     </div>
//   )
// )

// const ProductSkeleton = memo(() => (
//   <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
//     {Array.from({ length: 4 }).map((_, i) => (
//       <div key={i} className="aspect-square rounded-2xl bg-blush/20 animate-pulse" />
//     ))}
//   </div>
// ))

// const ProductsGrid = memo(({ products }: { products: Product[] }) => {
//   const { ref, isVisible } = useIntersectionObserver({
//     threshold: 0.2,
//     // triggerOnce: true,
//   })

//   return (
//     <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-5">
//       {products.map((product, i) => (
//         <div
//           key={product.id}
//           className={`transition-all duration-500 ${
//             isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
//           }`}
//           style={{ transitionDelay: `${i * 80}ms` }}
//         >
//           <ProductCard product={product} />
//         </div>
//       ))}
//     </div>
//   )
// })

const AboutSection = memo(({ settings }: { settings: any }) => {
  const { ref, isVisible } = useIntersectionObserver({
    threshold: 0.2,
    // triggerOnce: true,
  })

  return (
    <section className="bg-blush/20 border-y border-blush/40">
      <div
        ref={ref}
        className={`max-w-6xl mx-auto px-6 py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        {/* TEXT */}
        <div>
          <span className="text-xs font-bold text-gold uppercase tracking-widest">
            About us
          </span>

          <h2 className="font-serif text-3xl md:text-4xl font-black text-brown mt-2 mb-4">
            A little about the brand
          </h2>

          <p className="text-brown/70 font-medium text-sm leading-relaxed max-w-md">
            {settings?.about_text ??
              'This is a short paragraph about your brand, your story, and what makes you special.'}
          </p>
        </div>

        {/* IMAGE / LOGO */}
        <div className="flex justify-center md:justify-end">
          <div className="relative w-64 h-64 rounded-full overflow-hidden border-4 border-cream bg-blush/50 shadow-md group">

            {settings?.about_image ? (
              <img
                src={settings.about_image}
                alt="Brand"
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : settings?.logo_url ? (
              <img
                src={settings.logo_url}
                alt="Logo"
                loading="lazy"
                decoding="async"
                className="w-2/3 h-2/3 object-contain mx-auto my-auto"
              />
            ) : (
              <span className="text-brown/40 font-semibold text-sm flex items-center justify-center h-full">
                Brand
              </span>
            )}

          </div>
        </div>
      </div>
    </section>
  )
}
)

const CTASection = memo(() => (
  <section className="bg-brown py-20 text-center">
    <h2 className="text-cream font-serif text-4xl font-black mb-4">
      Want to book your own spa experience?
    </h2>
    <CTAButton to="/contact" primary>
      Email me at: booking@lammydebeautylounge.com
    </CTAButton>
  </section>
))