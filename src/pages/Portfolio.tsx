const portfolioItems = [
  {
    id: 1,
    title: 'Project One',
    category: 'Category',
    image: 'https://placehold.co/600x600?text=Project+One',
    description: 'A short description of this project or piece of work.',
  },
  {
    id: 2,
    title: 'Project Two',
    category: 'Category',
    image: 'https://placehold.co/600x600?text=Project+Two',
    description: 'A short description of this project or piece of work.',
  },
  {
    id: 3,
    title: 'Project Three',
    category: 'Category',
    image: 'https://placehold.co/600x600?text=Project+Three',
    description: 'A short description of this project or piece of work.',
  },
  {
    id: 4,
    title: 'Project Four',
    category: 'Category',
    image: 'https://placehold.co/600x600?text=Project+Four',
    description: 'A short description of this project or piece of work.',
  },
  {
    id: 5,
    title: 'Project Five',
    category: 'Category',
    image: 'https://placehold.co/600x600?text=Project+Five',
    description: 'A short description of this project or piece of work.',
  },
  {
    id: 6,
    title: 'Project Six',
    category: 'Category',
    image: 'https://placehold.co/600x600?text=Project+Six',
    description: 'A short description of this project or piece of work.',
  },
]

export default function Portfolio() {
  return (
    <section className="min-h-screen bg-cream">

      {/* Page Header */}
      <div className="bg-blush/30 border-b border-blush/40">
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <span className="text-xs font-semibold text-gold uppercase tracking-widest">Our Work</span>
          <h1 className="font-serif text-4xl font-bold text-brown mt-2">Portfolio</h1>
          <p className="text-taupe text-sm mt-3 max-w-md mx-auto leading-relaxed">
            A curated collection of our work, projects and creations
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-6 py-14">

        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <span className="w-16 h-px bg-gold/40" />
          <span className="text-gold text-xs uppercase tracking-widest font-medium">Gallery</span>
          <span className="w-16 h-px bg-gold/40" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {portfolioItems.map(item => (
            <div
              key={item.id}
              className="group bg-cream rounded-2xl border border-blush/40 overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              {/* Image */}
              <div className="aspect-square overflow-hidden bg-blush/20">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Info */}
              <div className="p-5">
                <span className="text-xs font-semibold text-gold uppercase tracking-widest">
                  {item.category}
                </span>
                <h3 className="font-serif font-semibold text-brown mt-1 text-base">
                  {item.title}
                </h3>
                <p className="text-sm text-taupe mt-2 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-20 text-center bg-blush/20 border border-blush/40 rounded-2xl px-6 py-12">
          <span className="text-xs font-semibold text-gold uppercase tracking-widest">
            Interested?
          </span>
          <h2 className="font-serif text-2xl font-bold text-brown mt-2 mb-3">
            Like what you see?
          </h2>
          <p className="text-taupe text-sm leading-relaxed max-w-md mx-auto mb-7">
            Get in touch and let's create something beautiful together.
            We'd love to hear about your project.
          </p>
          <a
            href="/contact"
            className="inline-block bg-brown text-cream text-sm font-medium px-8 py-3 rounded-full hover:bg-brown/80 transition-colors tracking-wide"
          >
            Get in Touch
          </a>
        </div>

      </div>
    </section>
  )
}