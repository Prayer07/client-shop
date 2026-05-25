import { FiCheckCircle } from "react-icons/fi"

const signatureTreatments = [
  {
    title: "Classic Spa Facial",
    price: "CAD $45",
    desc: "Deep cleansing and hydration treatment for healthy glowing skin.",
  },
  {
    title: "Spa Deluxe Facial",
    price: "CAD $65",
    desc: "Perfect for stress relief, skin fatigue, and restoring radiance.",
  },
  {
    title: "Birthday Glow Facial",
    price: "CAD $55",
    desc: "Glow-enhancing facial designed for birthdays and special occasions.",
  },
  {
    title: "Microdermabrasion",
    price: "CAD $110",
    desc: "Advanced exfoliation treatment for smoother, brighter skin.",
  },
  {
    title: "Hydro Facial",
    price: "CAD $130",
    desc: "Deep hydration and cleansing treatment for refreshed skin.",
  },
  {
    title: "Aloe Glow Facial",
    price: "CAD $70",
    desc: "Soothing treatment for sensitive and tired skin.",
  },
]

const advancedTreatments = [
  "Hyperpigmentation",
  "Acne & Acne Scars",
  "Uneven Skin Tone",
  "Fine Lines & Photoaging",
  "Peach Fuzz Removal",
  "Skin Texture Concerns",
]

export default function SkincareTreatment() {
  return (
    <section className="bg-cream min-h-screen">
      {/* HERO */}
      <div className="relative h-[400px] overflow-hidden">
        <img
          src="https://cpndonfohihpaokcfibe.supabase.co/storage/v1/object/public/product-images/1779724590564.jpg"
          
          alt="Skincare Treatment"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/40" />

        <div className="absolute inset-0 flex items-center justify-center text-center px-6">
          <div>
            <span className="text-gold uppercase tracking-[0.3em] text-xs font-bold">
              Luxury Skincare
            </span>

            <h1 className="font-serif text-4xl md:text-6xl font-black text-white mt-4">
              Skincare Treatment
            </h1>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-6 py-20">

        {/* INTRO */}
        <div className="max-w-3xl">
          <h2 className="font-serif text-3xl font-black text-brown mb-6">
            Reveal Healthy, Radiant Skin
          </h2>

          <p className="text-brown/70 leading-relaxed text-lg">
            Refresh, hydrate, and rejuvenate your skin with customized skincare
            treatments designed to restore your natural glow. Whether you are
            looking for relaxation, deep cleansing, anti-aging support, or
            corrective skincare solutions, our treatments are tailored to meet
            your individual skin needs.
          </p>
        </div>

        {/* SIGNATURE FACIALS */}
        <div className="mt-20">
          <div className="mb-10">
            <span className="text-gold uppercase text-xs tracking-widest font-bold">
              Signature Treatments
            </span>

            <h2 className="font-serif text-3xl font-black text-brown mt-2">
              Facial Collection
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-7">
            {signatureTreatments.map((treatment) => (
              <div
                key={treatment.title}
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-[32px]
                  border border-blush/40
                  bg-white/90
                  backdrop-blur-sm
                  p-7
                  shadow-sm
                  transition-all
                  duration-500
                  hover:-translate-y-1
                  hover:shadow-2xl
                  hover:border-gold/40
                "
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-gold/0 via-gold/0 to-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Top */}
                <div className="relative z-10 flex items-start justify-between gap-5">
                  
                  {/* Left */}
                  <div className="flex-1">
                    
                    {/* Badge */}
                    <div className="inline-flex items-center rounded-full bg-blush/40 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brown/70 mb-4">
                      Signature Treatment
                    </div>

                    {/* Title */}
                    <h3 className="font-serif text-2xl font-black text-brown leading-tight">
                      {treatment.title}
                    </h3>

                    {/* Description */}
                    <p className="mt-4 text-sm leading-relaxed text-brown/60 max-w-md">
                      {treatment.desc}
                    </p>

                    {/* Bottom Info */}
                    <div className="mt-6 flex items-center gap-4 flex-wrap">
                      
                      {/* Price */}
                      <div className="rounded-full bg-gold/10 px-4 py-2">
                        <span className="text-sm font-black text-gold">
                          {treatment.price}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="my-6 h-px bg-gradient-to-r from-transparent via-blush/50 to-transparent" />

                {/* CTA */}
                <div className="relative z-10 flex items-center justify-between gap-4">
                  
                  {/* Small Text */}
                  <p className="text-xs text-brown/40 font-medium">
                    Personalized skincare experience
                  </p>

                  {/* Button */}
                  <a 
                    href="https://www.fresha.com/en-GB/a/lammyde-beauty-and-spa-lounge-airdrie-3078-chinook-winds-drive-southwest-nk7xbjda/booking?allOffer=true&menu=true&pId=2757671&cartId=dc31431f-06e1-4c46-ad6b-66c7eea4dc6b"
                    target="_blank"
                    rel="noopener noreferrer"
                    >
                    <button
                      className="
                        group/btn
                        relative
                        overflow-hidden
                        rounded-full
                        bg-brown
                        px-6
                        py-3
                        text-sm
                        font-bold
                        text-cream
                        transition-all
                        duration-300
                        hover:scale-[1.03]
                        hover:bg-brown/90
                        active:scale-[0.98]
                        shadow-lg
                        shadow-brown/10
                      "
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Book Appointment
                      </span>

                      {/* Shine */}
                      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
                    </button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ADVANCED TREATMENTS */}
        <div className="mt-24 grid md:grid-cols-2 gap-12 items-start">

          <div>
            <span className="text-gold uppercase text-xs tracking-widest font-bold">
              Advanced Care
            </span>

            <h2 className="font-serif text-3xl font-black text-brown mt-2 mb-6">
              Targeted Skin Solutions
            </h2>

            <p className="text-brown/70 leading-relaxed">
              Our advanced skincare treatments are specifically designed to
              address deeper skin concerns using professional-grade techniques
              and customized treatment plans.
            </p>

            <div className="mt-8 space-y-4">
              {advancedTreatments.map((item) => (
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

          {/* SIDE CARD */}
          <div className="bg-brown rounded-3xl p-8 text-cream shadow-xl">
            <h3 className="font-serif text-2xl font-black mb-4">
              Available Advanced Treatments
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-white/10 pb-3">
                <span>Advanced Facial Treatments</span>
                <span>____</span>
              </div>

              <div className="flex justify-between border-b border-white/10 pb-3">
                <span>Medical Facials</span>
                <span>____</span>
              </div>

              <div className="flex justify-between border-b border-white/10 pb-3">
                <span>Chemical Peels</span>
                <span>____</span>
              </div>

              <div className="flex justify-between border-b border-white/10 pb-3">
                <span>OxyGeneo Facial</span>
                <span>____</span>
              </div>

              <div className="flex justify-between">
                <span>Dermaplaning</span>
                <span>____</span>
              </div>
            </div>

            <button className="mt-8 w-full bg-gold text-brown font-bold py-3 rounded-full hover:bg-gold/80 transition">
              Book Consultation
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}