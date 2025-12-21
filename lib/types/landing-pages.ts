// Landing Pages CMS Types

export interface LandingPage {
  id: string
  slug: string
  title: string
  meta_title: string | null
  meta_description: string | null
  meta_keywords: string[] | null
  og_image_url: string | null
  canonical_url: string | null
  published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface LandingPageSection {
  id: string
  page_id: string
  section_type: SectionType
  section_order: number
  visible: boolean
  content: SectionContent
  created_at: string
  updated_at: string
}

export type SectionType =
  | 'hero'
  | 'problem'
  | 'solution'
  | 'features'
  | 'pilot'
  | 'cta'
  | 'testimonial'
  | 'differentiators'
  | 'accreditation'

// Section content types
export interface HeroContent {
  badge?: string
  title: string
  subtitle?: string
  cta_primary?: { text: string; href: string }
  cta_secondary?: { text: string; href: string }
  trust_badges?: string[]
  image_url?: string
  tagline?: string
}

export interface ProblemContent {
  eyebrow?: string
  title: string
  intro?: string
  cards: Array<{ icon?: string; title: string; text: string }>
  conclusion?: string
}

export interface SolutionContent {
  eyebrow?: string
  title: string
  subtitle?: string
  points: Array<{ title: string; description: string }>
}

export interface FeaturesContent {
  eyebrow?: string
  title: string
  subtitle?: string
  rows: Array<{
    title: string
    description: string
    benefits?: string[]
    image_url?: string
    reverse?: boolean
  }>
}

export interface PilotContent {
  eyebrow?: string
  title: string
  subtitle?: string
  duration?: string
  steps: Array<{ title: string; description: string }>
  includes?: string[]
  cta?: { text: string; href: string }
}

export interface CTAContent {
  title: string
  subtitle?: string
  tagline?: string
  cta_primary?: { text: string; href: string }
  cta_secondary?: { text: string; href: string }
}

export interface DifferentiatorsContent {
  eyebrow?: string
  title: string
  columns: Array<{
    title: string
    items: string[]
  }>
}

export interface AccreditationContent {
  title: string
  badges: Array<{ name: string; logo_url?: string }>
  description?: string
}

export type SectionContent =
  | HeroContent
  | ProblemContent
  | SolutionContent
  | FeaturesContent
  | PilotContent
  | CTAContent
  | DifferentiatorsContent
  | AccreditationContent
  | Record<string, unknown>

export interface ContentSnippet {
  id: string
  snippet_type: 'testimonial' | 'stat' | 'logo' | 'faq'
  name: string
  content: Record<string, unknown>
  active: boolean
  created_at: string
  updated_at: string
}

export interface LandingPageSnippet {
  id: string
  page_id: string
  snippet_id: string
  section_type: string
  display_order: number
}

// Analytics Types
export interface AnalyticsSession {
  id: string
  session_id: string
  first_page_slug: string | null
  referrer: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  utm_term: string | null
  utm_content: string | null
  user_agent: string | null
  browser: string | null
  browser_version: string | null
  os: string | null
  device_type: 'desktop' | 'tablet' | 'mobile' | null
  screen_width: number | null
  screen_height: number | null
  language: string | null
  timezone: string | null
  country: string | null
  region: string | null
  city: string | null
  ip_hash: string | null
  created_at: string
  last_seen_at: string
}

export interface AnalyticsPageView {
  id: string
  session_id: string
  page_slug: string
  page_title: string | null
  page_url: string | null
  referrer: string | null
  time_on_page_seconds: number | null
  scroll_depth_percent: number | null
  created_at: string
}

export interface AnalyticsEvent {
  id: string
  session_id: string
  page_slug: string
  event_type: 'click' | 'scroll' | 'form_start' | 'form_submit' | 'video_play'
  event_category: string | null
  element_id: string | null
  element_text: string | null
  element_href: string | null
  event_value: string | null
  created_at: string
}

export interface Lead {
  id: string
  page_slug: string
  session_id: string | null
  email: string
  name: string | null
  phone: string | null
  organization_name: string | null
  organization_type: string | null
  role: string | null
  country: string | null
  source: string | null
  utm_source: string | null
  utm_medium: string | null
  utm_campaign: string | null
  referrer: string | null
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'closed'
  notes: string | null
  created_at: string
  updated_at: string
}

// Composite types for page data
export interface LandingPageWithSections extends LandingPage {
  sections: LandingPageSection[]
}
