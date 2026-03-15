export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  created_at: string
}

export interface PortfolioItem {
  id: string
  title: string
  category: string | null
  description: string | null
  image_url: string | null
  created_at: string
}

export interface BuyRequest {
  customerName: string
  customerPhone: string
  productName: string
}

export interface ContactFormData {
  name: string
  email: string
  message: string
}