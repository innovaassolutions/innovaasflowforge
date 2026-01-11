'use client'

/**
 * Branding Settings Page
 *
 * Allows tenants (coaches, consultants, institutions) to configure their
 * branding including logo, colors, messaging, and email settings.
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft,
  Palette,
  Type,
  Mail,
  Image as ImageIcon,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Check,
  Upload,
  Trash2,
  Calendar,
  Globe,
  RefreshCw,
  Clock,
  XCircle
} from 'lucide-react'

interface DomainStatus {
  configured: boolean
  domain: string | null
  status: 'pending' | 'verified' | 'failed' | null
  url?: string
  started_at?: string
  error?: string
  cloudflare_status?: string
  ssl_status?: string
  dns_instructions?: {
    record_type: string
    host: string
    target: string
    apex_domain: string
    message: string
  }
}

interface TenantProfile {
  id: string
  slug: string
  display_name: string
  tenant_type: 'coach' | 'consultant' | 'school'
  brand_config: {
    logo?: { url: string; alt?: string; position?: 'left' | 'center' | 'right' }
    colors: {
      primary: string
      primaryHover?: string
      secondary: string
      background: string
      backgroundSubtle?: string
      text: string
      textMuted: string
      border: string
    }
    fonts?: {
      heading: string
      body: string
    }
    tagline?: string
    welcomeMessage?: string
    completionMessage?: string
    showPoweredBy?: boolean
    booking?: {
      enabled: boolean
      url: string
      buttonText?: string
    }
  }
  email_config: {
    replyTo?: string
    senderName?: string
    emailFooter?: string
  }
  is_active: boolean
}

const DEFAULT_COLORS = {
  primary: '#F25C05',
  primaryHover: '#DC5204',
  secondary: '#1D9BA3',
  background: '#FFFEFB',
  backgroundSubtle: '#FAF8F3',
  text: '#171614',
  textMuted: '#71706B',
  border: '#E6E2D6',
}

export default function BrandingSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [tenant, setTenant] = useState<TenantProfile | null>(null)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  // Custom domain state
  const [domainStatus, setDomainStatus] = useState<DomainStatus | null>(null)
  const [domainInput, setDomainInput] = useState('')
  const [configuringDomain, setConfiguringDomain] = useState(false)
  const [removingDomain, setRemovingDomain] = useState(false)
  const [checkingDomainStatus, setCheckingDomainStatus] = useState(false)
  const [domainError, setDomainError] = useState<string | null>(null)
  const [domainCopied, setDomainCopied] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    displayName: '',
    slug: '',
    tagline: '',
    welcomeMessage: '',
    completionMessage: '',
    showPoweredBy: true,
    colors: { ...DEFAULT_COLORS },
    replyTo: '',
    senderName: '',
    emailFooter: '',
    logoUrl: '',
    logoAlt: '',
    logoPosition: 'left' as 'left' | 'center' | 'right',
    bookingEnabled: false,
    bookingUrl: '',
    bookingButtonText: '',
  })

  useEffect(() => {
    loadTenantProfile()
  }, [])

  async function loadTenantProfile() {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      // Fetch tenant profile
      const { data: tenantData, error: tenantError } = await (supabase
        .from('tenant_profiles') as any)
        .select('*')
        .eq('user_id', user.id)
        .single() as { data: TenantProfile | null; error: any }

      if (tenantError || !tenantData) {
        if (tenantError?.code === 'PGRST116' || !tenantData) {
          // No tenant profile found
          setError('No branding profile found. Please contact support.')
        } else {
          setError('Failed to load branding settings')
        }
        setLoading(false)
        return
      }

      setTenant(tenantData)

      // Populate form with existing data
      const brandConfig = tenantData.brand_config || {}
      const emailConfig = tenantData.email_config || {}

      setFormData({
        displayName: tenantData.display_name || '',
        slug: tenantData.slug || '',
        tagline: brandConfig.tagline || '',
        welcomeMessage: brandConfig.welcomeMessage || '',
        completionMessage: brandConfig.completionMessage || '',
        showPoweredBy: brandConfig.showPoweredBy !== false,
        colors: {
          primary: brandConfig.colors?.primary || DEFAULT_COLORS.primary,
          primaryHover: brandConfig.colors?.primaryHover || DEFAULT_COLORS.primaryHover,
          secondary: brandConfig.colors?.secondary || DEFAULT_COLORS.secondary,
          background: brandConfig.colors?.background || DEFAULT_COLORS.background,
          backgroundSubtle: brandConfig.colors?.backgroundSubtle || DEFAULT_COLORS.backgroundSubtle,
          text: brandConfig.colors?.text || DEFAULT_COLORS.text,
          textMuted: brandConfig.colors?.textMuted || DEFAULT_COLORS.textMuted,
          border: brandConfig.colors?.border || DEFAULT_COLORS.border,
        },
        replyTo: emailConfig.replyTo || '',
        senderName: emailConfig.senderName || '',
        emailFooter: emailConfig.emailFooter || '',
        logoUrl: brandConfig.logo?.url || '',
        logoAlt: brandConfig.logo?.alt || '',
        logoPosition: brandConfig.logo?.position || 'left',
        bookingEnabled: brandConfig.booking?.enabled || false,
        bookingUrl: brandConfig.booking?.url || '',
        bookingButtonText: brandConfig.booking?.buttonText || '',
      })
    } catch (err) {
      console.error('Error loading tenant:', err)
      setError('Failed to load branding settings')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setSaving(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user || !tenant) {
        setError('Not authenticated')
        return
      }

      // Validate slug
      const slugRegex = /^[a-z0-9-]+$/
      if (!slugRegex.test(formData.slug)) {
        setError('URL slug can only contain lowercase letters, numbers, and hyphens')
        return
      }

      if (formData.slug.length < 3) {
        setError('URL slug must be at least 3 characters')
        return
      }

      // Check if slug is unique (if changed)
      if (formData.slug !== tenant.slug) {
        const { data: existingSlug } = await supabase
          .from('tenant_profiles')
          .select('id')
          .eq('slug', formData.slug)
          .neq('id', tenant.id)
          .single()

        if (existingSlug) {
          setError('This URL slug is already taken. Please choose another.')
          return
        }
      }

      // Build updated brand_config
      const updatedBrandConfig = {
        ...tenant.brand_config,
        colors: formData.colors,
        tagline: formData.tagline || null,
        welcomeMessage: formData.welcomeMessage || null,
        completionMessage: formData.completionMessage || null,
        showPoweredBy: formData.showPoweredBy,
        logo: formData.logoUrl ? {
          url: formData.logoUrl,
          alt: formData.logoAlt || formData.displayName,
          position: formData.logoPosition,
        } : null,
        booking: {
          enabled: formData.bookingEnabled,
          url: formData.bookingUrl || '',
          buttonText: formData.bookingButtonText || null,
        },
      }

      // Build updated email_config
      const updatedEmailConfig = {
        replyTo: formData.replyTo || null,
        senderName: formData.senderName || null,
        emailFooter: formData.emailFooter || null,
      }

      // Update tenant profile
      const { error: updateError } = await (supabase
        .from('tenant_profiles') as any)
        .update({
          display_name: formData.displayName,
          slug: formData.slug,
          brand_config: updatedBrandConfig,
          email_config: updatedEmailConfig,
        })
        .eq('id', tenant.id)

      if (updateError) {
        console.error('Update error:', updateError)
        setError('Failed to save settings')
        return
      }

      setSuccess('Branding settings saved successfully!')

      // Reload to get fresh data
      await loadTenantProfile()
    } catch (err) {
      console.error('Save error:', err)
      setError('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  function copyLandingPageUrl() {
    if (!tenant) return
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://flowforge.innovaas.co'
    const tenantType = tenant.tenant_type === 'school' ? 'institution' : tenant.tenant_type
    const url = `${baseUrl}/${tenantType}/${tenant.slug}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !tenant) return

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
    if (!validTypes.includes(file.type)) {
      setError('Please upload a PNG, JPEG, WebP, or SVG image')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Logo must be smaller than 2MB')
      return
    }

    setUploadingLogo(true)
    setError(null)

    try {
      const supabase = createClient()

      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${tenant.id}-logo-${Date.now()}.${fileExt}`
      const filePath = `tenant-logos/${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('tenant-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        setError('Failed to upload logo. Please try again.')
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('tenant-assets')
        .getPublicUrl(filePath)

      // Update form state
      setFormData({
        ...formData,
        logoUrl: publicUrl,
        logoAlt: formData.displayName || 'Logo',
      })

      setSuccess('Logo uploaded! Save changes to apply.')
    } catch (err) {
      console.error('Logo upload error:', err)
      setError('Failed to upload logo')
    } finally {
      setUploadingLogo(false)
    }
  }

  function handleLogoRemove() {
    setFormData({
      ...formData,
      logoUrl: '',
      logoAlt: '',
    })
  }

  // ============================================================================
  // CUSTOM DOMAIN FUNCTIONS
  // ============================================================================

  async function loadDomainStatus() {
    try {
      const response = await fetch('/api/tenant/domain')
      if (response.ok) {
        const data = await response.json()
        setDomainStatus(data)
      }
    } catch (err) {
      console.error('Error loading domain status:', err)
    }
  }

  async function handleConfigureDomain() {
    if (!domainInput.trim()) return

    setDomainError(null)
    setConfiguringDomain(true)

    try {
      const response = await fetch('/api/tenant/domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domainInput.trim() }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setDomainError(data.message || 'Failed to configure domain')
        return
      }

      // Reload domain status
      await loadDomainStatus()
      setDomainInput('')
      setSuccess('Domain configured! Follow the DNS instructions below.')
    } catch (err) {
      console.error('Error configuring domain:', err)
      setDomainError('Failed to configure domain. Please try again.')
    } finally {
      setConfiguringDomain(false)
    }
  }

  async function handleRemoveDomain() {
    if (!confirm('Are you sure you want to remove your custom domain?')) return

    setDomainError(null)
    setRemovingDomain(true)

    try {
      const response = await fetch('/api/tenant/domain', {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        setDomainError(data.message || 'Failed to remove domain')
        return
      }

      // Reload domain status
      await loadDomainStatus()
      setSuccess('Custom domain removed successfully.')
    } catch (err) {
      console.error('Error removing domain:', err)
      setDomainError('Failed to remove domain. Please try again.')
    } finally {
      setRemovingDomain(false)
    }
  }

  async function handleCheckDomainStatus() {
    setCheckingDomainStatus(true)

    try {
      const response = await fetch('/api/tenant/domain/status')
      if (response.ok) {
        const data = await response.json()
        setDomainStatus(data)

        if (data.status === 'verified') {
          setSuccess('Your custom domain is now verified and active!')
        }
      }
    } catch (err) {
      console.error('Error checking domain status:', err)
    } finally {
      setCheckingDomainStatus(false)
    }
  }

  function copyDnsTarget() {
    if (!domainStatus?.dns_instructions?.target) return
    navigator.clipboard.writeText(domainStatus.dns_instructions.target)
    setDomainCopied(true)
    setTimeout(() => setDomainCopied(false), 2000)
  }

  // Load domain status on mount
  useEffect(() => {
    if (tenant) {
      loadDomainStatus()
    }
  }, [tenant])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-destructive/10 border border-destructive rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">No Branding Profile Found</h2>
          <p className="text-muted-foreground">
            {error || 'Your account does not have a branding profile. Please contact support.'}
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 mt-4 text-primary hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://flowforge.innovaas.co'
  const landingPageUrl = `${baseUrl}/${tenant.tenant_type === 'school' ? 'institution' : tenant.tenant_type}/${formData.slug}`

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Branding Settings</h1>
        <p className="text-muted-foreground mt-1">
          Customize your landing page appearance and messaging
        </p>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
          <p className="text-green-800 text-sm">{success}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-destructive/10 border border-destructive rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
          <p className="text-destructive text-sm">{error}</p>
        </div>
      )}

      {/* Landing Page URL Preview */}
      <div className="mb-8 bg-[hsl(var(--accent-subtle))] border border-primary/20 rounded-lg p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Your Landing Page</p>
            <p className="text-sm text-muted-foreground font-mono break-all">
              {landingPageUrl}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={copyLandingPageUrl}
              className="inline-flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg text-sm hover:bg-muted transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <a
              href={landingPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-[hsl(var(--accent-hover))] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Preview
            </a>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Profile Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Type className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Profile</h2>
              <p className="text-sm text-muted-foreground">Your display name and URL</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                required
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Your Name or Business"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                URL Slug
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 bg-muted border border-r-0 border-border rounded-l-lg text-sm text-muted-foreground">
                  /{tenant.tenant_type}/
                </span>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  required
                  className="flex-1 px-4 py-3 bg-input border border-border rounded-r-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="your-name"
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Lowercase letters, numbers, and hyphens only
              </p>
            </div>
          </div>
        </div>

        {/* Logo Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <ImageIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Logo</h2>
              <p className="text-sm text-muted-foreground">Upload your logo for the landing page header</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Logo Preview and Upload */}
            <div className="flex flex-col sm:flex-row gap-6">
              {/* Preview Area */}
              <div className="flex-shrink-0">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Preview
                </label>
                <div className="w-40 h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/30 overflow-hidden">
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      alt={formData.logoAlt || 'Logo preview'}
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                      <span className="text-xs">No logo</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Upload Logo
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 border border-border rounded-lg cursor-pointer transition-colors">
                      {uploadingLogo ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      <span className="text-sm">
                        {uploadingLogo ? 'Uploading...' : 'Choose File'}
                      </span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                        className="sr-only"
                      />
                    </label>
                    {formData.logoUrl && (
                      <button
                        type="button"
                        onClick={handleLogoRemove}
                        className="inline-flex items-center gap-2 px-3 py-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-sm">Remove</span>
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    PNG, JPEG, WebP, or SVG. Max 2MB. Recommended: 200x60px
                  </p>
                </div>

                {/* Logo Position */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Header Position
                  </label>
                  <div className="flex gap-2">
                    {(['left', 'center', 'right'] as const).map((position) => (
                      <button
                        key={position}
                        type="button"
                        onClick={() => setFormData({ ...formData, logoPosition: position })}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                          formData.logoPosition === position
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80 text-foreground'
                        }`}
                      >
                        {position}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Logo Alt Text */}
            {formData.logoUrl && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={formData.logoAlt}
                  onChange={(e) => setFormData({ ...formData, logoAlt: e.target.value })}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Describe your logo for accessibility"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Helps screen readers describe your logo
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Messaging Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Type className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Messaging</h2>
              <p className="text-sm text-muted-foreground">Customize your welcome text</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Tagline
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="e.g., Leadership Coaching"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Welcome Message
              </label>
              <textarea
                value={formData.welcomeMessage}
                onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Welcome message shown on your landing page..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Completion Message
              </label>
              <textarea
                value={formData.completionMessage}
                onChange={(e) => setFormData({ ...formData, completionMessage: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Thank you message shown after assessment completion..."
              />
            </div>
          </div>
        </div>

        {/* Colors Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Brand Colors</h2>
              <p className="text-sm text-muted-foreground">Customize your color scheme</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Primary Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.colors.primary}
                  onChange={(e) => setFormData({
                    ...formData,
                    colors: { ...formData.colors, primary: e.target.value }
                  })}
                  className="w-12 h-12 rounded-lg border border-border cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.colors.primary}
                  onChange={(e) => setFormData({
                    ...formData,
                    colors: { ...formData.colors, primary: e.target.value }
                  })}
                  className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Secondary Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.colors.secondary}
                  onChange={(e) => setFormData({
                    ...formData,
                    colors: { ...formData.colors, secondary: e.target.value }
                  })}
                  className="w-12 h-12 rounded-lg border border-border cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.colors.secondary}
                  onChange={(e) => setFormData({
                    ...formData,
                    colors: { ...formData.colors, secondary: e.target.value }
                  })}
                  className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Background
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.colors.background}
                  onChange={(e) => setFormData({
                    ...formData,
                    colors: { ...formData.colors, background: e.target.value }
                  })}
                  className="w-12 h-12 rounded-lg border border-border cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.colors.background}
                  onChange={(e) => setFormData({
                    ...formData,
                    colors: { ...formData.colors, background: e.target.value }
                  })}
                  className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Text Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.colors.text}
                  onChange={(e) => setFormData({
                    ...formData,
                    colors: { ...formData.colors, text: e.target.value }
                  })}
                  className="w-12 h-12 rounded-lg border border-border cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.colors.text}
                  onChange={(e) => setFormData({
                    ...formData,
                    colors: { ...formData.colors, text: e.target.value }
                  })}
                  className="flex-1 px-3 py-2 bg-input border border-border rounded-lg text-foreground text-sm font-mono"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, colors: { ...DEFAULT_COLORS } })}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Reset to default colors
            </button>
          </div>
        </div>

        {/* Email Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Mail className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Email Settings</h2>
              <p className="text-sm text-muted-foreground">Configure email appearance</p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Reply-To Email
              </label>
              <input
                type="email"
                value={formData.replyTo}
                onChange={(e) => setFormData({ ...formData, replyTo: e.target.value })}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Sender Name
              </label>
              <input
                type="text"
                value={formData.senderName}
                onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Your Name or Business"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-2">
              Email Footer
            </label>
            <input
              type="text"
              value={formData.emailFooter}
              onChange={(e) => setFormData({ ...formData, emailFooter: e.target.value })}
              className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Your Business | Contact Info"
            />
          </div>
        </div>

        {/* Booking Button Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Booking Button</h2>
              <p className="text-sm text-muted-foreground">Add a scheduling link to your results page</p>
            </div>
          </div>

          {/* Enable Toggle */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
            <div>
              <h3 className="font-medium text-foreground">Show Booking Button</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Display a "Book a Session" button on your results page
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.bookingEnabled}
                onChange={(e) => setFormData({ ...formData, bookingEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Booking URL and Button Text (only show when enabled) */}
          {formData.bookingEnabled && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Booking URL <span className="text-destructive">*</span>
                </label>
                <input
                  type="url"
                  value={formData.bookingUrl}
                  onChange={(e) => setFormData({ ...formData, bookingUrl: e.target.value })}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="https://your-scheduler.com/book"
                  required={formData.bookingEnabled}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Your Acuity, Calendly, or other scheduling link
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Button Text
                </label>
                <input
                  type="text"
                  value={formData.bookingButtonText}
                  onChange={(e) => setFormData({ ...formData, bookingButtonText: e.target.value })}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Book a Session"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Leave blank to use default: "Book a Session"
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Custom Domain Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Custom Domain</h2>
              <p className="text-sm text-muted-foreground">Use your own subdomain for a white-label experience</p>
            </div>
          </div>

          {/* Domain Error Message */}
          {domainError && (
            <div className="mb-4 bg-destructive/10 border border-destructive rounded-lg p-3 flex items-start gap-2">
              <XCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-destructive text-sm">{domainError}</p>
            </div>
          )}

          {/* No domain configured - show input (NOT a nested form!) */}
          {(!domainStatus || !domainStatus.configured) && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Custom Subdomain
                </label>
                <input
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value.toLowerCase())}
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="assessment.yourdomain.com"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Must be a subdomain (e.g., assessment.yourdomain.com), not an apex domain
                </p>
              </div>

              {/* DNS Setup Instructions - shown before configuration */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                <p className="text-sm text-blue-800 font-medium">
                  DNS Setup Required
                </p>
                <p className="text-sm text-blue-700">
                  After clicking "Configure Domain", you'll need to add a CNAME record at your domain registrar:
                </p>
                <div className="bg-white rounded-lg border border-blue-300 p-3">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Type</p>
                      <p className="font-mono font-medium">CNAME</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Name/Host</p>
                      <p className="font-mono font-medium text-blue-600">
                        {domainInput ? domainInput.split('.')[0] : 'assessment'}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">Target/Value</p>
                      <p className="font-mono font-medium text-xs">flowforge.innovaas.co</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-blue-600">
                  DNS changes can take up to 24 hours to propagate. You can configure the domain now and add the DNS record afterwards.
                </p>
              </div>

              <button
                type="button"
                onClick={handleConfigureDomain}
                disabled={configuringDomain || !domainInput.trim()}
                className="inline-flex items-center gap-2 bg-primary hover:bg-[hsl(var(--accent-hover))] text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {configuringDomain ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Configuring...
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    Configure Domain
                  </>
                )}
              </button>
            </div>
          )}

          {/* Domain configured - show status */}
          {domainStatus?.configured && (
            <div className="space-y-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Domain</p>
                  <p className="font-medium text-foreground font-mono">{domainStatus.domain}</p>
                </div>
                <div className="flex items-center gap-2">
                  {domainStatus.status === 'verified' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </span>
                  )}
                  {domainStatus.status === 'pending' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      <Clock className="w-4 h-4" />
                      Pending Verification
                    </span>
                  )}
                  {domainStatus.status === 'failed' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                      <XCircle className="w-4 h-4" />
                      Verification Failed
                    </span>
                  )}
                </div>
              </div>

              {/* Verified - show active URL */}
              {domainStatus.status === 'verified' && domainStatus.url && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800 mb-2">Your custom domain is active!</p>
                  <a
                    href={domainStatus.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-green-700 hover:text-green-900 font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {domainStatus.url}
                  </a>
                </div>
              )}

              {/* Pending - show DNS instructions */}
              {domainStatus.status === 'pending' && domainStatus.dns_instructions && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3">
                  <p className="text-sm text-yellow-800 font-medium">
                    Add this DNS record at your domain registrar:
                  </p>
                  <div className="bg-white rounded-lg border border-yellow-300 p-3 space-y-2">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Type</p>
                        <p className="font-mono font-medium">{domainStatus.dns_instructions.record_type}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Name/Host</p>
                        <p className="font-mono font-medium">{domainStatus.dns_instructions.host}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs mb-1">Target/Value</p>
                        <div className="flex items-center gap-2">
                          <p className="font-mono font-medium text-xs truncate">{domainStatus.dns_instructions.target}</p>
                          <button
                            type="button"
                            onClick={copyDnsTarget}
                            className="shrink-0 text-muted-foreground hover:text-foreground"
                            title="Copy target"
                          >
                            {domainCopied ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-yellow-700">
                    DNS changes can take up to 24 hours to propagate. Click "Check Status" to verify.
                  </p>
                  <button
                    type="button"
                    onClick={handleCheckDomainStatus}
                    disabled={checkingDomainStatus}
                    className="inline-flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {checkingDomainStatus ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3" />
                        Check Status
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Failed - show error and instructions */}
              {domainStatus.status === 'failed' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800 mb-2">
                    {domainStatus.error || 'Domain verification failed. Please check your DNS settings.'}
                  </p>
                  {domainStatus.dns_instructions && (
                    <p className="text-xs text-red-700">
                      Expected CNAME: {domainStatus.dns_instructions.host} → {domainStatus.dns_instructions.target}
                    </p>
                  )}
                </div>
              )}

              {/* Remove Domain Button */}
              <div className="pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={handleRemoveDomain}
                  disabled={removingDomain}
                  className="inline-flex items-center gap-2 text-destructive hover:text-destructive/80 text-sm transition-colors disabled:opacity-50"
                >
                  {removingDomain ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Remove Custom Domain
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Powered By Toggle */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-foreground">Show "Powered by Innovaas"</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Display attribution in the footer of your landing page
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showPoweredBy}
                onChange={(e) => setFormData({ ...formData, showPoweredBy: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Link
            href="/dashboard"
            className="px-6 py-3 text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-primary hover:bg-[hsl(var(--accent-hover))] text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
