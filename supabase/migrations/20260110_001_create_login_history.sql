-- Migration: Create Login History Table
-- Purpose: Track user login events with detailed metadata for admin monitoring
-- Date: 2026-01-10

-- ============================================================================
-- Login History Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User reference
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Login metadata
  login_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'unknown')),
  browser TEXT,
  os TEXT,

  -- Login method
  auth_method TEXT DEFAULT 'password' CHECK (auth_method IN ('password', 'magic_link', 'oauth_google', 'oauth_github')),

  -- Success/failure tracking
  success BOOLEAN DEFAULT TRUE,
  failure_reason TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Indexes for Common Queries
-- ============================================================================

-- User lookup
CREATE INDEX idx_login_history_user_id ON login_history(user_id);

-- Time-based queries (most recent first)
CREATE INDEX idx_login_history_login_at ON login_history(login_at DESC);

-- Composite for user activity timeline
CREATE INDEX idx_login_history_user_login ON login_history(user_id, login_at DESC);

-- IP-based lookups for security analysis
CREATE INDEX idx_login_history_ip ON login_history(ip_address) WHERE ip_address IS NOT NULL;

-- Recent logins (for dashboard metrics)
CREATE INDEX idx_login_history_recent ON login_history(login_at DESC) WHERE success = TRUE;

-- ============================================================================
-- Row Level Security
-- ============================================================================

ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;

-- Admins can view all login history
CREATE POLICY "Admins can view all login history"
  ON login_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Users can view their own login history
CREATE POLICY "Users can view their own login history"
  ON login_history
  FOR SELECT
  USING (user_id = auth.uid());

-- Only service role can insert (via API routes)
-- No INSERT policy for regular users - must go through API

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE login_history IS 'Tracks all user login events with device/location metadata for security auditing and admin monitoring';
COMMENT ON COLUMN login_history.user_id IS 'Reference to the user who logged in';
COMMENT ON COLUMN login_history.login_at IS 'Timestamp of the login attempt';
COMMENT ON COLUMN login_history.ip_address IS 'IP address of the client (from x-forwarded-for header)';
COMMENT ON COLUMN login_history.user_agent IS 'Full user agent string from browser';
COMMENT ON COLUMN login_history.device_type IS 'Parsed device type: desktop, mobile, tablet, or unknown';
COMMENT ON COLUMN login_history.browser IS 'Parsed browser name and version';
COMMENT ON COLUMN login_history.os IS 'Parsed operating system name and version';
COMMENT ON COLUMN login_history.auth_method IS 'Authentication method used: password, magic_link, oauth_google, oauth_github';
COMMENT ON COLUMN login_history.success IS 'Whether the login attempt was successful';
COMMENT ON COLUMN login_history.failure_reason IS 'Reason for login failure (if success=false)';
