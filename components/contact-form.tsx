'use client'

import { useState, useRef } from 'react'
import { Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'

interface ContactFormProps {
  /** Override the submit button text */
  submitLabel?: string
  /** Compact mode for modal usage */
  compact?: boolean
  /** Called after successful submission */
  onSuccess?: () => void
  /** Pre-set interest value (hides the dropdown) */
  interest?: string
  /** Custom label for organization field */
  organizationLabel?: string
  /** Custom placeholder for organization field */
  organizationPlaceholder?: string
  /** Custom label for role field */
  roleLabel?: string
  /** Custom placeholder for role field */
  rolePlaceholder?: string
  /** Custom placeholder for notes textarea */
  notesPlaceholder?: string
  /** Source tag for CRM tracking */
  source?: string
}

interface FormData {
  name: string
  email: string
  organization_name: string
  role: string
  interest: string
  notes: string
}

const INTEREST_OPTIONS = [
  { value: '', label: 'Select an option…' },
  { value: 'consulting', label: 'Consulting & Advisory' },
  { value: 'education', label: 'Education & Schools' },
  { value: 'coaching', label: 'Coaching & Leadership' },
  { value: 'other', label: 'Something else' },
]

type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

const NOVACRM_API_URL =
  process.env.NEXT_PUBLIC_NOVACRM_API_URL || 'https://nova-cyan-mu.vercel.app'
const NOVACRM_API_KEY =
  process.env.NEXT_PUBLIC_NOVACRM_LEAD_API_KEY || ''

export default function ContactForm({
  submitLabel = 'Request a Demo',
  compact = false,
  onSuccess,
  interest: presetInterest,
  organizationLabel = 'Company Name',
  organizationPlaceholder = 'Acme Corp',
  roleLabel = 'Job Title / Role',
  rolePlaceholder = 'Head of Strategy',
  notesPlaceholder = 'Tell us about your assessment needs, team size, or anything else...',
  source = 'flowforge-landing',
}: ContactFormProps) {
  const [form, setForm] = useState<FormData>({
    name: '',
    email: '',
    organization_name: '',
    role: '',
    interest: presetInterest || '',
    notes: '',
  })
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')
    setErrorMsg('')

    try {
      const res = await fetch(`${NOVACRM_API_URL}/api/leads/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(NOVACRM_API_KEY ? { 'X-Api-Key': NOVACRM_API_KEY } : {}),
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          organization_name: form.organization_name || undefined,
          role: form.role || undefined,
          interest: form.interest || undefined,
          notes: form.notes || undefined,
          page_slug: 'flowforge',
          source,
        }),
      })

      if (!res.ok) {
        const body = await res.text()
        throw new Error(body || `Request failed (${res.status})`)
      }

      setStatus('success')
      onSuccess?.()
    } catch (err: unknown) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    }
  }

  // ── Success State ──
  if (status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-10 animate-in fade-in-0 zoom-in-95 duration-500">
        <div className="w-16 h-16 rounded-full bg-[hsl(var(--success))]/20 flex items-center justify-center mb-4
                        animate-in zoom-in-50 duration-700">
          <CheckCircle2 className="w-8 h-8 text-[hsl(var(--success))]" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2 md:text-2xl">
          Thanks! We&apos;ll be in touch shortly.
        </h3>
        <p className="text-muted-foreground text-center max-w-md">
          We&apos;ve received your request and a member of our team will reach out within one business day.
        </p>
      </div>
    )
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className={`grid gap-4 ${compact ? 'gap-3' : 'gap-5'}`}
    >
      {/* Name & Email — side by side on desktop */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className="block text-sm font-medium text-foreground mb-1.5">
            Full Name <span className="text-primary">*</span>
          </label>
          <input
            id="cf-name"
            name="name"
            type="text"
            required
            value={form.name}
            onChange={handleChange}
            placeholder="Jane Smith"
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground
                       focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label htmlFor="cf-email" className="block text-sm font-medium text-foreground mb-1.5">
            Work Email <span className="text-primary">*</span>
          </label>
          <input
            id="cf-email"
            name="email"
            type="email"
            required
            value={form.email}
            onChange={handleChange}
            placeholder="jane@company.com"
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground
                       focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Company & Role — side by side */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-org" className="block text-sm font-medium text-foreground mb-1.5">
            {organizationLabel}
          </label>
          <input
            id="cf-org"
            name="organization_name"
            type="text"
            value={form.organization_name}
            onChange={handleChange}
            placeholder={organizationPlaceholder}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground
                       focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          />
        </div>
        <div>
          <label htmlFor="cf-role" className="block text-sm font-medium text-foreground mb-1.5">
            {roleLabel}
          </label>
          <input
            id="cf-role"
            name="role"
            type="text"
            value={form.role}
            onChange={handleChange}
            placeholder={rolePlaceholder}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground
                       focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Interest — hidden when pre-set by vertical */}
      {!presetInterest && (
        <div>
          <label htmlFor="cf-interest" className="block text-sm font-medium text-foreground mb-1.5">
            What are you interested in?
          </label>
          <select
            id="cf-interest"
            name="interest"
            value={form.interest}
            onChange={handleChange}
            className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground
                       focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors
                       appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%239ca3af%22%20d%3D%22M6%208L1%203h10z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px] bg-[right_16px_center] bg-no-repeat"
          >
            {INTEREST_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Message */}
      <div>
        <label htmlFor="cf-notes" className="block text-sm font-medium text-foreground mb-1.5">
          Anything else you&apos;d like us to know?
        </label>
        <textarea
          id="cf-notes"
          name="notes"
          rows={compact ? 3 : 4}
          value={form.notes}
          onChange={handleChange}
          placeholder={notesPlaceholder}
          className="w-full rounded-lg border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted-foreground resize-none
                     focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
        />
      </div>

      {/* Error message */}
      {status === 'error' && (
        <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/10 rounded-lg px-4 py-3
                        animate-in fade-in-0 slide-in-from-top-2 duration-300">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full px-6 py-3.5 bg-primary text-primary-foreground font-semibold rounded-lg text-base
                   hover:bg-[hsl(var(--accent-hover))] transition-all flex items-center justify-center gap-2
                   disabled:opacity-60 disabled:cursor-not-allowed
                   md:text-lg md:py-4"
      >
        {status === 'submitting' ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Sending…
          </>
        ) : (
          <>
            {submitLabel}
            <Send className="w-4 h-4" />
          </>
        )}
      </button>

      <p className="text-xs text-muted-foreground text-center">
        We respect your privacy and will never share your information.
      </p>
    </form>
  )
}
