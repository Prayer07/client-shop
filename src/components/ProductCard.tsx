import { useState } from 'react'
import type { Product } from '../types'
import BuyModal from './BuyModal'

interface Props {
  product: Product
}

export default function ProductCard({ product }: Props) {
  const [showModal, setShowModal] = useState(false)

  return (
    <>
      <div className="bg-cream rounded-2xl border border-blush/40 overflow-hidden hover:shadow-lg transition-shadow group">

        {/* Image */}
        <div className="aspect-square overflow-hidden bg-blush/20">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-taupe/50 text-xs">
              No Image
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-serif font-semibold text-brown text-sm truncate">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-xs text-taupe mt-1 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          )}
          <div className="flex items-center justify-between mt-4">
            <span className="font-semibold text-brown text-sm">
              ${product.price.toFixed(2)}
              <span className="text-xs text-taupe font-normal ml-1">CAD</span>
            </span>
            <button
              onClick={() => setShowModal(true)}
              className="bg-brown text-cream text-xs font-medium px-4 py-2 rounded-full hover:bg-brown/80 transition-colors tracking-wide"
            >
              Buy
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <BuyModal product={product} onClose={() => setShowModal(false)} />
      )}
    </>
  )
}