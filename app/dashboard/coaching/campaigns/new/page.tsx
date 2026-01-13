'use client'

/**
 * Create New Coaching Campaign Page
 *
 * Allows coaches to create a new campaign with name, description,
 * and results disclosure settings.
 *
 * Story: 3-4-dashboard-pipeline (AC #6)
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Sparkles,
  Loader2,
  CheckCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

interface TenantProfile {
  id: string
  slug: string
  display_name: string
}

type ResultsDisclosure = 'full' | 'teaser' | 'none'

const disclosureOptions: { value: ResultsDisclosure; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'full',
    label: 'Full Results',
    description: 'Clients see complete archetype analysis, scores, and insights',
    icon: <Eye className="w-5 h-5" />,
  },
  {
    value: 'teaser',
    label: 'Teaser Only',
    description: 'Clients see archetype names with a call-to-action to contact you',
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    value: 'none',
    label: 'Coach Only',
    description: 'Clients see a thank you message; only you see the full results',
    icon: <EyeOff className="w-5 h-5" />,
  },
]

export default function NewCampaignPage() {
  const router = useRouter()
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null)
  const [tenant, setTenant] = useState<TenantProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [resultsDisclosure, setResultsDisclosure] = useState<ResultsDisclosure>('full')

  useEffect(() => {
    const client = createClient()
    setSupabase(client)
    loadTenant(client)
  }, [])

  async function loadTenant(client: SupabaseClient<Database>) {
    try {
      const { data: { user } } = await client.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Get coach's tenant profile
      const { data: tenantData, error: tenantError } = await client
        .from('tenant_profiles')
        .select('id, slug, display_name')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single() as { data: TenantProfile | null; error: Error | null }

      if (tenantError || !tenantData) {
        setError('You do not have an active coaching profile.')
        setLoading(false)
        return
      }

      setTenant(tenantData)
    } catch (err) {
      setError('Error loading profile')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!supabase || !tenant) return

    if (!name.trim()) {
      setError('Campaign name is required')
      return
    }

    setCreating(true)
    setError(null)

    try {
      const { data, error: insertError } = await supabase
        .from('campaigns')
        .insert({
          name: name.trim(),
          description: description.trim() || null,
          tenant_id: tenant.id,
          assessment_type: 'archetype',
          results_disclosure: resultsDisclosure,
          status: 'active',
        } as any)
        .select()
        .single()

      if (insertError) {
        setError(`Failed to create campaign: ${insertError.message}`)
        console.error(insertError)
      } else {
        // Redirect to campaigns list on success
        router.push('/dashboard/coaching/campaigns')
      }
    } catch (err) {
      setError('Error creating campaign')
      console.error(err)
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="bg-card border-b border-border px-8 py-6">
        <h1 className="text-2xl font-bold text-foreground">Create Campaign</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Set up a new campaign to organize your coaching clients
        </p>
      </div>

      {/* Main Content */}
      <main className="px-8 py-8 max-w-2xl">
        {/* Back Link */}
        <Link
          href="/dashboard/coaching/campaigns"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Campaigns
        </Link>

        {/* Error */}
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campaign Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              Campaign Name <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Leadership Workshop Q1 2026"
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground
                         placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              disabled={creating}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
              Description <span className="text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Briefly describe this campaign or program..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground
                         placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50
                         resize-none"
              disabled={creating}
            />
          </div>

          {/* Results Disclosure */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Results Disclosure
            </label>
            <p className="text-sm text-muted-foreground mb-4">
              Choose what clients see when they complete their assessment
            </p>
            <div className="space-y-3">
              {disclosureOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors ${
                    resultsDisclosure === option.value
                      ? 'border-primary bg-[hsl(var(--accent-subtle))]'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="resultsDisclosure"
                    value={option.value}
                    checked={resultsDisclosure === option.value}
                    onChange={() => setResultsDisclosure(option.value)}
                    className="sr-only"
                    disabled={creating}
                  />
                  <div className={`mt-0.5 ${resultsDisclosure === option.value ? 'text-primary' : 'text-muted-foreground'}`}>
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${resultsDisclosure === option.value ? 'text-foreground' : 'text-foreground'}`}>
                        {option.label}
                      </span>
                      {resultsDisclosure === option.value && (
                        <CheckCircle className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {option.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/dashboard/coaching/campaigns')}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={creating || !name.trim()}>
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Campaign'
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}
