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
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        
        {/* Product Image */}
        <div className="aspect-square overflow-hidden bg-gray-50">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              loading="lazy"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
              No Image
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-sm truncate">{product.name}</h3>
          {product.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
          )}
          <div className="flex items-center justify-between mt-3">
            <span className="font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gray-900 text-white text-xs font-medium px-4 py-2 rounded-full hover:bg-gray-700 transition-colors"
            >
              Buy
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <BuyModal
          product={product}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}