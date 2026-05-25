import { FiCheckCircle } from "react-icons/fi"

const nailServices = [
  {
    title: "Classic Manicure",
    price: "CAD $___",
    desc: "A clean and refreshing manicure designed to maintain healthy, polished nails.",
  },
  {
    title: "Spa Manicure",
    price: "CAD $___",
    desc: "Relaxing nail treatment with hydration and gentle exfoliation for soft, nourished hands.",
  },
  {
    title: "Deluxe Spa Manicure",
    price: "CAD $___",
    desc: "Luxury manicure experience featuring deep hydration, massage, and premium care.",
  },
  {
    title: "Spa Pedicure",
    price: "CAD $___",
    desc: "Revitalizing foot care treatment designed for relaxation and smooth, refreshed feet.",
  },
  {
    title: "Deluxe Spa Pedicure",
    price: "CAD $___",
    desc: "An indulgent pedicure experience with advanced exfoliation, massage, and hydration.",
  },
]

const nailAddons = [
  "Gel Polish",
  "Basic Polish (Quick-Dry Nail Lacquer)",
  "Dip Powder Polish",
  "Nail Art",
  "Paraffin Wax Treatment",
  "Hot Stone Massage",
  "Aromatherapy",
]

const browLashServices = [
  {
    title: "Brow Lamination",
    price: "CAD $___",
  },
  {
    title: "Brow Tint",
    price: "CAD $___",
  },
  {
    title: "Lash Lift",
    price: "CAD $___",
  },
  {
    title: "Lash Tint",
    price: "CAD $___",
  },
  {
    title: "Brow & Lash Combo",
    price: "CAD $___",
  },
]

export default function BeautyLounge() {
  return (
    <section className="bg-cream min-h-screen">

      {/* HERO */}
      <div className="relative h-[420px] overflow-hidden">
        <img
          src="https://cpndonfohihpaokcfibe.supabase.co/storage/v1/object/public/product-images/1779729540389.jpeg"
          alt="Beauty Lounge"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/45" />

        <div className="absolute inset-0 flex items-center justify-center text-center px-6">
          <div>
            <span className="text-gold uppercase tracking-[0.3em] text-xs font-bold">
              Luxury Beauty Lounge
            </span>

            <h1 className="font-serif text-4xl md:text-6xl font-black text-white mt-4">
              Beauty Lounge
            </h1>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-6 py-20">

        {/* INTRO */}
        <div className="max-w-3xl">
          <h2 className="font-serif text-3xl font-black text-brown mb-6">
            Beauty, Elegance & Confidence
          </h2>

          <p className="text-brown/70 leading-relaxed text-lg">
            Step into a beauty experience where elegance, luxury, and culture
            come together. At Lammyde Beauty Spa & Lounge, our Beauty Lounge is
            designed to help you look polished, confident, and unforgettable.
          </p>

          <p className="text-brown/70 leading-relaxed text-lg mt-6">
            From flawless glam makeup to nail care, brow enhancement, and lash
            services, every experience is thoughtfully curated to enhance your
            natural beauty and elevate your confidence.
          </p>
        </div>

        {/* NAIL SERVICES */}
        <div className="mt-20">

          <div className="mb-10">
            <span className="text-gold uppercase text-xs tracking-widest font-bold">
              Nail Care Services
            </span>

            <h2 className="font-serif text-3xl font-black text-brown mt-2">
              Manicure & Pedicure Collection
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-7">
            {nailServices.map((service) => (
              <div
                key={service.title}
                className="
                  rounded-[28px]
                  border
                  border-blush/40
                  bg-white
                  p-7
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-xl
                  hover:border-gold/30
                "
              >
                <div className="flex items-start justify-between gap-4">

                  <div className="flex-1">
                    <h3 className="font-serif text-2xl font-black text-brown">
                      {service.title}
                    </h3>

                    <p className="mt-4 text-sm leading-relaxed text-brown/60">
                      {service.desc}
                    </p>
                  </div>

                  <div className="rounded-full bg-gold/10 px-4 py-2 shrink-0">
                    <span className="text-sm font-black text-gold">
                      {service.price}
                    </span>
                  </div>
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <span className="text-xs font-semibold text-brown/40">
                    Luxury Nail Care
                  </span>
                  <a 
                    href="https://www.fresha.com/en-GB/a/lammyde-beauty-and-spa-lounge-airdrie-3078-chinook-winds-drive-southwest-nk7xbjda/booking?allOffer=true&menu=true&pId=2757671&cartId=dc31431f-06e1-4c46-ad6b-66c7eea4dc6b"
                    target="_blank"
                    rel="noopener noreferrer"
                    >
                    <button
                      className="
                        rounded-full
                        bg-brown
                        px-5
                        py-3
                        text-sm
                        font-bold
                        text-cream
                        transition-all
                        duration-300
                        hover:bg-brown/90
                        hover:scale-[1.02]
                      "
                    >
                      Book Appointment
                    </button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ADD-ONS + BROW/LASH */}
        <div className="mt-24 grid md:grid-cols-2 gap-12 items-start">

          {/* ADD-ONS */}
          <div>
            <span className="text-gold uppercase text-xs tracking-widest font-bold">
              Premium Add-Ons
            </span>

            <h2 className="font-serif text-3xl font-black text-brown mt-2 mb-6">
              Enhance Your Experience
            </h2>

            <p className="text-brown/70 leading-relaxed">
              Complete your beauty experience with luxurious add-on treatments
              designed to elevate relaxation, comfort, and long-lasting results.
            </p>

            <div className="mt-8 space-y-4">
              {nailAddons.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-brown/70"
                >
                  <FiCheckCircle className="text-gold shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* BROW & LASH CARD */}
          <div className="bg-brown rounded-[32px] p-8 text-cream shadow-xl">
            <span className="text-gold uppercase text-xs tracking-widest font-bold">
              Brow & Lash Services
            </span>

            <h3 className="font-serif text-3xl font-black mt-3 mb-6">
              Perfectly Defined Beauty
            </h3>

            <div className="space-y-5">
              {browLashServices.map((service) => (
                <div
                  key={service.title}
                  className="flex items-center justify-between border-b border-white/10 pb-4"
                >
                  <span className="font-medium">
                    {service.title}
                  </span>

                  <span className="text-gold font-bold">
                    {service.price}
                  </span>
                </div>
              ))}
            </div>

            <button
              className="
                mt-8
                w-full
                rounded-full
                bg-gold
                py-3
                font-bold
                text-brown
                transition-all
                duration-300
                hover:bg-gold/80
                hover:scale-[1.01]
              "
            >
              Book Beauty Session
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}