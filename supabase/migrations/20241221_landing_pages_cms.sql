-- Landing Pages CMS and Analytics Schema
-- This migration creates tables for:
-- 1. CMS-managed landing page content
-- 2. Custom analytics tracking (page views, clicks, sessions)
-- 3. Lead capture from forms

-- ============================================
-- LANDING PAGES CMS
-- ============================================

-- Main landing pages table
CREATE TABLE IF NOT EXISTS landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL, -- 'schools', 'healthcare', etc.
  title TEXT NOT NULL,
  meta_title TEXT, -- SEO title (if different from title)
  meta_description TEXT,
  meta_keywords TEXT[],
  og_image_url TEXT,
  canonical_url TEXT,
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content sections for each landing page
CREATE TABLE IF NOT EXISTS landing_page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES landing_pages(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL, -- 'hero', 'problem', 'solution', 'features', 'pilot', 'cta', 'testimonial'
  section_order INTEGER NOT NULL DEFAULT 0,
  visible BOOLEAN DEFAULT true,
  content JSONB NOT NULL DEFAULT '{}',
  -- content structure varies by section_type, examples:
  -- hero: { badge, title, subtitle, cta_primary, cta_secondary, trust_badges, image_url }
  -- problem: { eyebrow, title, intro, cards: [{icon, text}], conclusion }
  -- features: { eyebrow, title, subtitle, rows: [{title, description, benefits, image_url, reverse}] }
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_id, section_type)
);

-- Reusable content snippets (testimonials, stats, etc.)
CREATE TABLE IF NOT EXISTS content_snippets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  snippet_type TEXT NOT NULL, -- 'testimonial', 'stat', 'logo', 'faq'
  name TEXT NOT NULL, -- internal reference name
  content JSONB NOT NULL DEFAULT '{}',
  -- testimonial: { quote, author_name, author_title, author_avatar, sentiment }
  -- stat: { value, label, description }
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table for snippets used on pages
CREATE TABLE IF NOT EXISTS landing_page_snippets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES landing_pages(id) ON DELETE CASCADE,
  snippet_id UUID NOT NULL REFERENCES content_snippets(id) ON DELETE CASCADE,
  section_type TEXT NOT NULL, -- which section this snippet appears in
  display_order INTEGER DEFAULT 0,
  UNIQUE(page_id, snippet_id, section_type)
);

-- ============================================
-- CUSTOM ANALYTICS
-- ============================================

-- Session tracking
CREATE TABLE IF NOT EXISTS analytics_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL, -- client-generated UUID stored in cookie
  first_page_slug TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  user_agent TEXT,
  browser TEXT,
  browser_version TEXT,
  os TEXT,
  device_type TEXT, -- 'desktop', 'tablet', 'mobile'
  screen_width INTEGER,
  screen_height INTEGER,
  language TEXT,
  timezone TEXT,
  country TEXT,
  region TEXT,
  city TEXT,
  ip_hash TEXT, -- hashed IP for privacy
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW()
);

-- Page view events
CREATE TABLE IF NOT EXISTS analytics_page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  page_slug TEXT NOT NULL,
  page_title TEXT,
  page_url TEXT,
  referrer TEXT,
  time_on_page_seconds INTEGER, -- populated on next pageview or unload
  scroll_depth_percent INTEGER, -- max scroll depth reached
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Click/interaction events
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  page_slug TEXT NOT NULL,
  event_type TEXT NOT NULL, -- 'click', 'scroll', 'form_start', 'form_submit', 'video_play'
  event_category TEXT, -- 'cta', 'navigation', 'outbound', 'form'
  element_id TEXT, -- DOM element ID
  element_text TEXT, -- button/link text
  element_href TEXT, -- for links
  event_value TEXT, -- additional context
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LEAD CAPTURE
-- ============================================

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug TEXT NOT NULL,
  session_id TEXT,

  -- Contact info
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,

  -- Organization info
  organization_name TEXT,
  organization_type TEXT, -- 'school', 'district', 'consulting'
  role TEXT,
  country TEXT,

  -- Source tracking
  source TEXT, -- 'pilot_request', 'contact_form', 'demo_request'
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  referrer TEXT,

  -- Status
  status TEXT DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'converted', 'closed'
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_landing_pages_slug ON landing_pages(slug);
CREATE INDEX IF NOT EXISTS idx_landing_pages_published ON landing_pages(published) WHERE published = true;

CREATE INDEX IF NOT EXISTS idx_sections_page_id ON landing_page_sections(page_id);
CREATE INDEX IF NOT EXISTS idx_sections_type ON landing_page_sections(section_type);

CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON analytics_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON analytics_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_utm ON analytics_sessions(utm_source, utm_medium, utm_campaign);

CREATE INDEX IF NOT EXISTS idx_page_views_session ON analytics_page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_page ON analytics_page_views(page_slug);
CREATE INDEX IF NOT EXISTS idx_page_views_created ON analytics_page_views(created_at);

CREATE INDEX IF NOT EXISTS idx_events_session ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_page ON analytics_events(page_slug);
CREATE INDEX IF NOT EXISTS idx_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created ON analytics_events(created_at);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_page ON leads(page_slug);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_page_snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Public read access for published landing pages
CREATE POLICY "Public can read published landing pages"
  ON landing_pages FOR SELECT
  USING (published = true);

CREATE POLICY "Public can read sections of published pages"
  ON landing_page_sections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM landing_pages
      WHERE landing_pages.id = landing_page_sections.page_id
      AND landing_pages.published = true
    )
  );

CREATE POLICY "Public can read active snippets"
  ON content_snippets FOR SELECT
  USING (active = true);

-- Analytics: allow anonymous inserts (for tracking)
CREATE POLICY "Anyone can insert analytics sessions"
  ON analytics_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can insert page views"
  ON analytics_page_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can insert events"
  ON analytics_events FOR INSERT
  WITH CHECK (true);

-- Leads: allow anonymous inserts (for forms)
CREATE POLICY "Anyone can submit leads"
  ON leads FOR INSERT
  WITH CHECK (true);

-- Service role has full access (for admin dashboard)
-- Note: Service role bypasses RLS by default

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to tables
CREATE TRIGGER update_landing_pages_updated_at
  BEFORE UPDATE ON landing_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_landing_page_sections_updated_at
  BEFORE UPDATE ON landing_page_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_snippets_updated_at
  BEFORE UPDATE ON content_snippets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get page view stats
CREATE OR REPLACE FUNCTION get_page_analytics(
  p_slug TEXT,
  p_start_date TIMESTAMPTZ DEFAULT NOW() - INTERVAL '30 days',
  p_end_date TIMESTAMPTZ DEFAULT NOW()
)
RETURNS TABLE (
  total_views BIGINT,
  unique_sessions BIGINT,
  avg_time_on_page NUMERIC,
  avg_scroll_depth NUMERIC,
  top_referrers JSONB,
  top_utm_sources JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_views,
    COUNT(DISTINCT pv.session_id)::BIGINT as unique_sessions,
    ROUND(AVG(pv.time_on_page_seconds)::NUMERIC, 1) as avg_time_on_page,
    ROUND(AVG(pv.scroll_depth_percent)::NUMERIC, 1) as avg_scroll_depth,
    (
      SELECT jsonb_agg(jsonb_build_object('referrer', r.referrer, 'count', r.cnt))
      FROM (
        SELECT s.referrer, COUNT(*) as cnt
        FROM analytics_sessions s
        JOIN analytics_page_views pv2 ON s.session_id = pv2.session_id
        WHERE pv2.page_slug = p_slug
          AND pv2.created_at BETWEEN p_start_date AND p_end_date
          AND s.referrer IS NOT NULL
        GROUP BY s.referrer
        ORDER BY cnt DESC
        LIMIT 10
      ) r
    ) as top_referrers,
    (
      SELECT jsonb_agg(jsonb_build_object('source', u.utm_source, 'count', u.cnt))
      FROM (
        SELECT s.utm_source, COUNT(*) as cnt
        FROM analytics_sessions s
        JOIN analytics_page_views pv2 ON s.session_id = pv2.session_id
        WHERE pv2.page_slug = p_slug
          AND pv2.created_at BETWEEN p_start_date AND p_end_date
          AND s.utm_source IS NOT NULL
        GROUP BY s.utm_source
        ORDER BY cnt DESC
        LIMIT 10
      ) u
    ) as top_utm_sources
  FROM analytics_page_views pv
  WHERE pv.page_slug = p_slug
    AND pv.created_at BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql;
