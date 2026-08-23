import { useQuery } from '@tanstack/react-query'
import { supabase } from './supabase'
import type { SiteSettings } from '../types'

const defaults: SiteSettings = {
  brand_name: 'BrandName',
  hero_headline: 'Your Brand Headline Goes Here',
  hero_tagline: 'A short description of what your client does and who she serves.',
  about_text: 'This is a short paragraph about your brand, your story, and what makes you special.',
  about_image: null,
  contact_email: 'placeholder@email.com',
  contact_whatsapp: 'placeholder',
  contact_location: 'Canada',
  social_instagram: 'https://instagram.com/placeholder',
  social_facebook: 'https://facebook.com/placeholder',
  social_tiktok: 'https://tiktok.com/@placeholder',
  logo_url: null,
}

const CACHE_KEY = 'site_settings_cache'

const loadFromCache = (): SiteSettings | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as SiteSettings
  } catch {
    return null
  }
}

const saveToCache = (s: SiteSettings) => {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(s)) } catch { void 0 }
}

const fetchSettings = async (): Promise<SiteSettings> => {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('id, value')

    if (error || !data) throw error ?? new Error('No settings')

    const map = Object.fromEntries(data.map(row => [row.id, row.value]))

    const settings: SiteSettings = {
      brand_name: map.brand_name ?? defaults.brand_name,
      hero_headline: map.hero_headline ?? defaults.hero_headline,
      hero_tagline: map.hero_tagline ?? defaults.hero_tagline,
      about_text: map.about_text ?? defaults.about_text,
      about_image: map.about_image ?? defaults.about_image,
      contact_email: map.contact_email ?? defaults.contact_email,
      contact_whatsapp: map.contact_whatsapp ?? defaults.contact_whatsapp,
      contact_location: map.contact_location ?? defaults.contact_location,
      social_instagram: map.social_instagram ?? defaults.social_instagram,
      social_facebook: map.social_facebook ?? defaults.social_facebook,
      social_tiktok: map.social_tiktok ?? defaults.social_tiktok,
      logo_url: map.logo_url ?? defaults.logo_url,
    }

    saveToCache(settings)
    return settings
  } catch {
    const cached = loadFromCache()
    if (cached) return cached
    // No cached settings and fetch failed — surface an error so callers can show an offline message
    throw new Error('Failed to fetch settings and no cache available')
  }
}

export const useSettings = () =>
  useQuery({
    queryKey: ['site-settings'],
    queryFn: fetchSettings,
    // staleTime: 1000 * 60 * 5,
    staleTime: 0,
    // only use cached initial data if it contains meaningful text (avoid empty-string defaults)
    initialData: (() => {
      const cached = loadFromCache()
      if (!cached) return undefined
      const hasContent = Boolean(
        (cached.hero_headline && cached.hero_headline.trim()) ||
        (cached.hero_tagline && cached.hero_tagline.trim()) ||
        (cached.brand_name && cached.brand_name.trim()) ||
        (cached.about_text && cached.about_text.trim()) ||
        (cached.logo_url && cached.logo_url.trim())
      )
      return hasContent ? cached : undefined
    })(),
  })