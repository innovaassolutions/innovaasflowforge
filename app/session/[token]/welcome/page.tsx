'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { Upload, FileText, X, Check } from 'lucide-react'
import { apiUrl } from '@/lib/api-url'

interface Session {
  id: string
  stakeholder_name: string
  stakeholder_email: string
  stakeholder_title: string
  stakeholder_role: string
  status: string
  has_uploaded_documents: boolean
  campaigns: {
    id: string
    name: string
    company_name: string
    facilitator_name: string
  }
}

interface UploadedDocument {
  id: string
  document_name: string
  file_size: number
  mime_type: string
}

export default function StakeholderWelcomePage() {
  const params = useParams()
  const router = useRouter()
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  useEffect(() => {
    loadSession()
  }, [params.token])

  async function loadSession() {
    try {
      setLoading(true)
      const response = await fetch(apiUrl(`api/sessions/${params.token}`))
      const data = await response.json()

      if (data.success) {
        setSession(data.session)

        // Load any previously uploaded documents
        await loadUploadedDocuments()
      } else {
        setError(data.error || 'Invalid or expired access link')
      }
    } catch (err) {
      setError('Error loading session')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function loadUploadedDocuments() {
    try {
      const response = await fetch(apiUrl(`api/sessions/${params.token}/documents`))
      const data = await response.json()

      if (data.success && data.documents) {
        setUploadedDocs(data.documents)
      }
    } catch (err) {
      console.error('Error loading documents:', err)
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)

    try {
      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)

        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))

        const response = await fetch(apiUrl(`api/sessions/${params.token}/documents`), {
          method: 'POST',
          body: formData
        })

        const data = await response.json()

        if (data.success) {
          setUploadedDocs(prev => [...prev, data.document])
          setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
        } else {
          setError(data.error || `Failed to upload ${file.name}`)
        }

        // Clear progress after a delay
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev }
            delete newProgress[file.name]
            return newProgress
          })
        }, 2000)
      }
    } catch (err) {
      setError('Error uploading files')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  async function handleRemoveDocument(documentId: string) {
    try {
      const response = await fetch(apiUrl(`api/sessions/${params.token}/documents/${documentId}`), {
        method: 'DELETE'
      })

      const data = await response.json()

      if (data.success) {
        setUploadedDocs(prev => prev.filter(doc => doc.id !== documentId))
      } else {
        setError(data.error || 'Failed to remove document')
      }
    } catch (err) {
      setError('Error removing document')
      console.error(err)
    }
  }

  function handleContinueToInterview() {
    router.push(`/session/${params.token}`)
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
          <p className="text-muted-foreground mt-4">Loading...</p>
        </div>
      </div>
    )
  }

  if (error && !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-lg p-8 max-w-md text-center">
          <svg
            className="mx-auto h-12 w-12 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-foreground">{error}</h2>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-muted border-b border-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground">
              {session.campaigns.name}
            </h1>
            <p className="text-muted-foreground mt-2">
              {session.campaigns.company_name}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {/* Welcome Section */}
        <div className="bg-card border border-border rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Welcome, {session.stakeholder_name}!
          </h2>
          <p className="text-muted-foreground mb-4">
            Thank you for participating in this assessment. This AI-facilitated interview will help us understand your perspective on {session.campaigns.company_name}'s current state and transformation opportunities.
          </p>
          <div className="bg-border rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-foreground mb-2">What to expect:</h3>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                <span>15-20 conversational questions tailored to your role as {session.stakeholder_title}</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                <span>Approximately 20-30 minutes to complete</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                <span>You can pause and resume anytime using this same link</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                <span>Your responses are confidential and will be analyzed alongside other stakeholder perspectives</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Document Upload Section */}
        <div className="bg-card border border-border rounded-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Upload className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-semibold text-foreground">
              Share Supporting Documents (Optional)
            </h3>
          </div>
          <p className="text-muted-foreground mb-6">
            If you have any relevant documents (SOPs, diagrams, specifications, reports), you can upload them here. The AI will reference these during our conversation to ask more informed questions.
          </p>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center mb-6 hover:border-primary transition-colors">
            <input
              type="file"
              id="file-upload"
              multiple
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer block">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-foreground font-medium mb-1">
                Click to upload files
              </p>
              <p className="text-sm text-muted-foreground">
                PDF, Word, Text, or Image files (max 10MB each)
              </p>
            </label>
          </div>

          {/* Upload Progress */}
          {Object.keys(uploadProgress).length > 0 && (
            <div className="space-y-2 mb-6">
              {Object.entries(uploadProgress).map(([filename, progress]) => (
                <div key={filename} className="bg-border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground truncate">{filename}</span>
                    <span className="text-sm text-muted-foreground">{progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Uploaded Documents List */}
          {uploadedDocs.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">Uploaded Documents:</h4>
              {uploadedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between bg-border rounded-lg p-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="w-5 h-5 text-brand-teal flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {doc.document_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(doc.file_size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveDocument(doc.id)}
                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors flex-shrink-0"
                    title="Remove document">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="mt-4 bg-destructive/20 border border-destructive/50 rounded-lg p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <button
            onClick={handleContinueToInterview}
            className="bg-primary hover:bg-[hsl(var(--accent-hover))] text-primary-foreground font-semibold py-4 px-8 rounded-lg transition-colors text-lg">
            {uploadedDocs.length > 0 ? 'Continue to Interview' : 'Skip & Start Interview'}
          </button>
          <p className="text-sm text-muted-foreground mt-3">
            Facilitated by {session.campaigns.facilitator_name}
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-muted border-t border-card mt-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-end items-center gap-2">
            <p className="text-sm text-muted-foreground">Powered by</p>
            <Image
              src="/designguide/innovaas_orange_and_white_transparent_bkgrnd_2559x594.png"
              alt="Innovaas"
              width={120}
              height={28}
              className="h-7 w-auto"
            />
          </div>
        </div>
      </footer>
    </div>
  )
}
