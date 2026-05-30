export interface Product {
  id: string
  name: string
  description: string | null
  price: number
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

export interface PortfolioItem {
  id: string
  title: string
  category: string | null
  description: string | null
  image_url: string | null
  created_at: string
}

export interface PortfolioCategory {
  id: string
  name: string
  description: string | null
  emoji: string | null
  image_url: string | null
  display_order: number
  created_at: string
}

export interface PortfolioService {
  id: string
  category_id: string
  name: string
  description: string | null
  price: string | null
  duration: string | null
  is_price_tbd: boolean
  display_order: number
  created_at: string
}

export interface SpaPackage {
  id: string
  name: string
  description: string | null
  includes: string[]
  price: string | null
  display_order: number
  created_at: string
}

export interface Service {
  id: string
  emoji: string | null
  title: string
  description: string | null
  duration: string | null
  price: string | null
  booking_url: string | null
  display_order: number
  created_at: string
}

export interface SiteSettings {
  brand_name: string
  hero_headline: string
  hero_tagline: string
  about_text: string
  contact_email: string
  contact_whatsapp: string
  contact_location: string
  social_instagram: string
  social_facebook: string
  social_tiktok: string
  logo_url: string | null
  about_image: string | null
}