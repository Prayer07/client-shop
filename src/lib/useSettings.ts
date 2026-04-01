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

const fetchSettings = async (): Promise<SiteSettings> => {
  const { data, error } = await supabase
    .from('site_settings')
    .select('id, value')

  if (error || !data) return defaults

  const map = Object.fromEntries(data.map(row => [row.id, row.value]))

  return {
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
}

export const useSettings = () =>
  useQuery({
    queryKey: ['site-settings'],
    queryFn: fetchSettings,
    staleTime: 1000 * 60 * 5,
  })