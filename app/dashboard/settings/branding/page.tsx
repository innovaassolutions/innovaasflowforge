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
  Calendar
} from 'lucide-react'

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
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.innovaas.co'
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/flowforge'
    const tenantType = tenant.tenant_type === 'school' ? 'institution' : tenant.tenant_type
    const url = `${baseUrl}${basePath}/${tenantType}/${tenant.slug}`
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

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.innovaas.co'
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/flowforge'
  const landingPageUrl = `${baseUrl}${basePath}/${tenant.tenant_type === 'school' ? 'institution' : tenant.tenant_type}/${formData.slug}`

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
