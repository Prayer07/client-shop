import { useSettings } from '../lib/useSettings'

const storyParagraphs = [
  `At Lammyde Beauty & Spa Lounge, beauty is more than appearance — it is confidence, care, and the joy reflected in every smile. Our passion has always been rooted in helping people feel beautiful, refreshed, and confident in their own skin.`,
  `The inspiration behind Lammyde began with a simple but powerful lesson from my mother. She often said, "If you love seeing beautiful things, do not just admire them — take a step to create them, because those smiles can bring positive impact to lives around you." Those words became the foundation of a vision built on beauty, purpose, and transformation.`,
  `Driven by my passion for beauty and wellness, I decided to invest fully in my craft by pursuing professional training in clinical aesthetics at the National Institute of Wellness and Esthetics (N.I.W.E). As a graduate of professional and clinical aesthetics, I gained not only the technical knowledge of skincare and beauty treatments, but also a deeper understanding of the importance of confidence, self-care, and wellness in people's everyday lives.`,
  `Lammyde Beauty & Spa Lounge was therefore created as more than just a business — it was built to become a sanctuary and a community for beauty lovers and self-care enthusiasts. Our goal is to meet you wherever you are in your beauty and wellness journey while helping you grow into the most confident version of yourself.`,
  `From skincare treatments and beauty enhancements to makeup artistry and wellness care, every experience is thoughtfully designed with excellence, professionalism, and intentional care.`,
  `Lammyde Beauty & Spa Lounge is more than a beauty destination; it is a place where beauty is curated, confidence is restored, and self-care becomes a lifestyle.`,
]

const values = [
  { emoji: '💛', title: 'Excellence', description: 'Every treatment is delivered with the highest standard of care and professionalism.' },
  { emoji: '🌿', title: 'Wellness', description: 'We believe true beauty starts from within — mind, body and spirit.' },
  { emoji: '✨', title: 'Confidence', description: 'Our goal is to help every client walk out feeling radiant and self-assured.' },
  { emoji: '🤝', title: 'Community', description: 'We are more than a spa — we are a sanctuary for beauty lovers and self-care enthusiasts.' },
]

export default function OurStory() {
  const { data: settings } = useSettings()

  return (
    <div className="min-h-screen bg-cream">

      {/* Hero — Photo Background */}
      <div className="relative bg-brown overflow-hidden">
        {settings?.about_image ? (
          <>
            <img
              src={"/images/img4.webp"}
              alt="Lammyde Beauty & Spa Lounge"
              className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-brown/60 via-brown/40 to-brown/80" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-brown via-brown/90 to-taupe/80" />
        )}

        <div className="relative max-w-4xl mx-auto px-6 py-28 text-center">
          <span className="text-xs font-bold text-gold uppercase tracking-widest">
            Who We Are
          </span>
          <h1 className="font-serif text-5xl md:text-6xl font-black text-cream mt-3 leading-tight">
            Our Story
          </h1>
          <div className="flex items-center justify-center gap-3 mt-6">
            <span className="w-16 h-px bg-gold/50" />
            <span className="text-gold text-sm font-semibold tracking-widest">
              Lammyde Beauty & Spa Lounge
            </span>
            <span className="w-16 h-px bg-gold/50" />
          </div>
          <p className="text-cream/70 font-medium text-base mt-6 max-w-xl mx-auto leading-relaxed">
            Beauty is more than appearance — it is confidence, wellness, and the joy reflected in every smile.
          </p>
        </div>
      </div>

      {/* Story Content */}
      <div className="max-w-3xl mx-auto px-6 py-20">

        {/* Opening quote */}
        <div className="bg-blush/30 border-l-4 border-gold rounded-r-2xl px-8 py-6 mb-14">
          <p className="font-serif text-xl font-bold text-brown leading-relaxed italic">
            "If you love seeing beautiful things, do not just admire them — take a step to create them,
            because those smiles can bring positive impact to lives around you."
          </p>
          <p className="text-taupe font-semibold text-sm mt-3">— The inspiration behind Lammyde</p>
        </div>

        {/* Story paragraphs */}
        <div className="space-y-6 mb-20">
          {storyParagraphs.map((para, i) => (
            <p key={i} className="text-brown/80 font-medium text-base leading-relaxed">
              {para}
            </p>
          ))}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-14">
          <span className="flex-1 h-px bg-blush/60" />
          <span className="text-gold text-xs font-bold uppercase tracking-widest">Our Values</span>
          <span className="flex-1 h-px bg-blush/60" />
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-20">
          {values.map(v => (
            <div
              key={v.title}
              className="bg-white border border-blush/40 rounded-2xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-blush/30 flex items-center justify-center text-2xl mb-4">
                {v.emoji}
              </div>
              <h3 className="font-serif font-black text-brown text-lg mb-2">{v.title}</h3>
              <p className="text-brown/60 font-medium text-sm leading-relaxed">{v.description}</p>
            </div>
          ))}
        </div>

        {/* Credentials Strip */}
        <div className="bg-brown rounded-2xl px-8 py-10 text-center mb-20">
          <span className="text-xs font-bold text-gold uppercase tracking-widest">Credentials</span>
          <h2 className="font-serif text-2xl font-black text-cream mt-2 mb-4">
            Professionally Trained & Certified
          </h2>
          <p className="text-cream/60 font-medium text-sm leading-relaxed max-w-lg mx-auto">
            Graduate of Professional and Clinical Aesthetics from the
            <span className="text-gold font-bold"> National Institute of Wellness and Esthetics (N.I.W.E)</span>.
            Combining technical expertise with a deep passion for beauty and wellness.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <span className="text-xs font-bold text-gold uppercase tracking-widest">Ready to Begin?</span>
          <h2 className="font-serif text-3xl font-black text-brown mt-2 mb-4">
            Start Your Beauty Journey
          </h2>
          <p className="text-brown/60 font-medium text-sm leading-relaxed max-w-md mx-auto mb-8">
            We would love to welcome you to our sanctuary. Book a consultation
            or browse our services to find the perfect treatment for you.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="/portfolios"
              className="bg-brown text-cream text-sm font-bold px-8 py-3 rounded-full hover:bg-brown/80 transition-colors tracking-wide"
            >
              View Our Services
            </a>
            <a
              href="/contact"
              className="border-2 border-brown/30 text-brown text-sm font-bold px-8 py-3 rounded-full hover:border-brown transition-colors tracking-wide"
            >
              Get in Touch
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}