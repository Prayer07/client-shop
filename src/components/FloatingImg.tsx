import { useEffect, useState } from "react"
import Img3 from "/images/Img3.jpg"

export default function FloatingImg() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const seen = localStorage.getItem("floating-img-seen")

    if (!seen) {
      const timer = setTimeout(() => {
        setIsOpen(true)
        localStorage.setItem("floating-img-seen", "true")
      }, 4000)

      return () => clearTimeout(timer)
    }
  }, [])

  return (
    <>
      {/* OVERLAY (when expanded) */}
      {isExpanded && (
        <div
          onClick={() => setIsExpanded(false)}
          className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
        />
      )}

      {/* FLOATING CARD */}
      <div
        className={`fixed bottom-6 right-6 z-[101] transition-all duration-500 ${
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
        }`}
      >
        <div
          className={`relative rounded-2xl overflow-hidden shadow-2xl bg-white border border-blush/30 transition-all duration-300 ${
            isExpanded ? "w-[90vw] max-w-[600px]" : "w-[260px]"
          }`}
        >
          {/* CLOSE */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/50 text-white"
          >
            ✕
          </button>

          {/* IMAGE */}
          <img
            src={Img3}
            alt="Promo"
            className={`w-full object-cover transition-all duration-300 ${
              isExpanded ? "h-auto" : "h-[180px]"
            }`}
          />

          {/* EXPAND BUTTON */}
          {!isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-brown text-cream text-xs px-4 py-2 rounded-full shadow"
            >
              View Details
            </button>
          )}
        </div>
      </div>

      {/* SIDE TOGGLE */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-[99] bg-brown text-cream px-3 py-3 rounded-l-xl shadow-lg"
      >
        {isOpen ? "→" : "←"}
      </button>
    </>
  )
}