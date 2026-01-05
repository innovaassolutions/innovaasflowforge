'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { UserPlus, Users, Mail, Building2, Shield, Loader2, CheckCircle, XCircle, ArrowLeft, Pencil, Trash2, Send, Mic } from 'lucide-react'
import Link from 'next/link'
import { apiUrl } from '@/lib/api-url'

interface User {
  id: string
  email: string
  full_name: string
  role: string
  user_type: 'consultant' | 'company' | 'admin' | 'coach' | null
  created_at: string
  last_seen_at: string | null
  tenant_slug?: string
  tenant_display_name?: string
}

interface CreateUserForm {
  email: string
  fullName: string
  userType: 'consultant' | 'company' | 'admin' | 'coach'
  sendWelcomeEmail: boolean
  // Tenant profile fields (for consultant, coach, company)
  displayName: string
  slug: string
}

interface EditUserForm {
  id: string
  email: string
  fullName: string
  userType: 'consultant' | 'company' | 'admin' | 'coach'
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreateUserForm>({
    email: '',
    fullName: '',
    userType: 'consultant',
    sendWelcomeEmail: true,
    displayName: '',
    slug: '',
  })

  // Edit user state
  const [showEditForm, setShowEditForm] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editFormData, setEditFormData] = useState<EditUserForm>({
    id: '',
    email: '',
    fullName: '',
    userType: 'consultant',
  })

  // Delete user state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  // Resend email state
  const [resendLoading, setResendLoading] = useState<string | null>(null)

  useEffect(() => {
    checkAdminAndLoadUsers()
  }, [])

  async function checkAdminAndLoadUsers() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/auth/login')
      return
    }

    // Check if user is platform admin (user_type = 'admin')
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('user_type')
      .eq('id', user.id)
      .single() as { data: { user_type: string | null } | null }

    if (!profile || profile.user_type !== 'admin') {
      setIsAdmin(false)
      setLoading(false)
      return
    }

    setIsAdmin(true)
    await loadUsers()
  }

  async function loadUsers() {
    try {
      const response = await fetch(apiUrl('api/admin/users'))
      const data = await response.json()

      if (data.success) {
        setUsers(data.users)
      } else {
        setError(data.error || 'Failed to load users')
      }
    } catch (err) {
      setError('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault()
    setCreateLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(apiUrl('api/admin/users'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(`User ${formData.fullName} created successfully${data.emailSent ? ' and welcome email sent' : ''}.`)
        setFormData({
          email: '',
          fullName: '',
          userType: 'consultant',
          sendWelcomeEmail: true,
          displayName: '',
          slug: '',
        })
        setShowCreateForm(false)
        await loadUsers()
      } else {
        setError(data.error || 'Failed to create user')
      }
    } catch (err) {
      setError('Failed to create user')
    } finally {
      setCreateLoading(false)
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type, checked } = e.target
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }
      // Auto-generate slug from display name
      if (name === 'displayName') {
        newData.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      }
      return newData
    })
  }

  function openEditForm(user: User) {
    setEditFormData({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      userType: (user.user_type as 'consultant' | 'company' | 'admin' | 'coach') || 'consultant',
    })
    setShowEditForm(true)
  }

  async function handleEditUser(e: React.FormEvent) {
    e.preventDefault()
    setEditLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(apiUrl(`api/admin/users/${editFormData.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: editFormData.email,
          fullName: editFormData.fullName,
          userType: editFormData.userType,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('User updated successfully.')
        setShowEditForm(false)
        await loadUsers()
      } else {
        setError(data.error || 'Failed to update user')
      }
    } catch (err) {
      setError('Failed to update user')
    } finally {
      setEditLoading(false)
    }
  }

  function openDeleteConfirm(user: User) {
    setUserToDelete(user)
    setShowDeleteConfirm(true)
  }

  async function handleDeleteUser() {
    if (!userToDelete) return

    setDeleteLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(apiUrl(`api/admin/users/${userToDelete.id}`), {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(`User ${userToDelete.full_name} deleted successfully.`)
        setShowDeleteConfirm(false)
        setUserToDelete(null)
        await loadUsers()
      } else {
        setError(data.error || 'Failed to delete user')
      }
    } catch (err) {
      setError('Failed to delete user')
    } finally {
      setDeleteLoading(false)
    }
  }

  async function handleResendEmail(user: User) {
    setResendLoading(user.id)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(apiUrl(`api/admin/users/${user.id}`), {
        method: 'POST',
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(`New credentials sent to ${user.email}`)
      } else {
        setError(data.error || 'Failed to send email')
      }
    } catch (err) {
      setError('Failed to send email')
    } finally {
      setResendLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">
          You do not have permission to access this page. Admin privileges are required.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-primary hover:text-[hsl(var(--accent-hover))] transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Return to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage user accounts</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center gap-2 bg-primary hover:bg-[hsl(var(--accent-hover))] text-primary-foreground px-4 py-2 rounded-lg font-medium transition-colors">
          <UserPlus className="w-5 h-5" />
          Create User
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
          <p className="text-green-800 text-sm">{success}</p>
          <button
            onClick={() => setSuccess(null)}
            className="ml-auto text-green-600 hover:text-green-800">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-destructive/10 border border-destructive rounded-lg p-4 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
          <p className="text-destructive text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-destructive hover:text-destructive/80">
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full border border-border shadow-xl">
            <h2 className="text-xl font-bold text-foreground mb-6">Create New User</h2>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground
                             focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground
                             focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  User Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, userType: 'consultant' }))}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.userType === 'consultant'
                        ? 'border-primary bg-[hsl(var(--accent-subtle))] text-foreground'
                        : 'border-border bg-background text-muted-foreground hover:border-muted'
                    }`}>
                    <div className="flex flex-col items-center gap-1">
                      <Users className={`w-5 h-5 ${formData.userType === 'consultant' ? 'text-primary' : ''}`} />
                      <span className="font-medium text-xs">Consultant</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, userType: 'company' }))}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.userType === 'company'
                        ? 'border-brand-teal bg-brand-teal/10 text-foreground'
                        : 'border-border bg-background text-muted-foreground hover:border-muted'
                    }`}>
                    <div className="flex flex-col items-center gap-1">
                      <Building2 className={`w-5 h-5 ${formData.userType === 'company' ? 'text-brand-teal' : ''}`} />
                      <span className="font-medium text-xs">School</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, userType: 'coach' }))}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.userType === 'coach'
                        ? 'border-emerald-500 bg-emerald-100 text-foreground'
                        : 'border-border bg-background text-muted-foreground hover:border-muted'
                    }`}>
                    <div className="flex flex-col items-center gap-1">
                      <Mic className={`w-5 h-5 ${formData.userType === 'coach' ? 'text-emerald-600' : ''}`} />
                      <span className="font-medium text-xs">Coach</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, userType: 'admin', displayName: '', slug: '' }))}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.userType === 'admin'
                        ? 'border-purple-500 bg-purple-100 text-foreground'
                        : 'border-border bg-background text-muted-foreground hover:border-muted'
                    }`}>
                    <div className="flex flex-col items-center gap-1">
                      <Shield className={`w-5 h-5 ${formData.userType === 'admin' ? 'text-purple-600' : ''}`} />
                      <span className="font-medium text-xs">Admin</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Tenant profile fields (for consultant, coach, company/school) */}
              {formData.userType !== 'admin' && (
                <div className={`space-y-4 p-4 rounded-lg border ${
                  formData.userType === 'consultant'
                    ? 'bg-[hsl(var(--accent-subtle))] border-primary/20'
                    : formData.userType === 'coach'
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-brand-teal/5 border-brand-teal/20'
                }`}>
                  <p className={`text-sm font-medium ${
                    formData.userType === 'consultant'
                      ? 'text-primary'
                      : formData.userType === 'coach'
                      ? 'text-emerald-700'
                      : 'text-brand-teal'
                  }`}>
                    {formData.userType === 'consultant' ? 'Consultant' : formData.userType === 'coach' ? 'Coach' : 'School'} Profile Settings
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      name="displayName"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground
                                 focus:outline-none transition-all ${
                        formData.userType === 'consultant'
                          ? 'focus:border-primary focus:ring-2 focus:ring-primary/20'
                          : formData.userType === 'coach'
                          ? 'focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                          : 'focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20'
                      }`}
                      placeholder={
                        formData.userType === 'consultant'
                          ? 'Smith Consulting Group'
                          : formData.userType === 'coach'
                          ? 'Dr. Jane Smith Coaching'
                          : 'Lincoln High School'
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      This name will appear on the {formData.userType === 'company' ? 'school' : formData.userType} page
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      URL Slug
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        /{formData.userType === 'company' ? 'school' : formData.userType}/
                      </span>
                      <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleInputChange}
                        required
                        className={`flex-1 px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground
                                   focus:outline-none transition-all ${
                          formData.userType === 'consultant'
                            ? 'focus:border-primary focus:ring-2 focus:ring-primary/20'
                            : formData.userType === 'coach'
                            ? 'focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                            : 'focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/20'
                        }`}
                        placeholder={
                          formData.userType === 'consultant'
                            ? 'smith-consulting'
                            : formData.userType === 'coach'
                            ? 'dr-jane-smith'
                            : 'lincoln-high'
                        }
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Auto-generated from display name (can be customized)</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="sendWelcomeEmail"
                  name="sendWelcomeEmail"
                  checked={formData.sendWelcomeEmail}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
                />
                <label htmlFor="sendWelcomeEmail" className="text-sm text-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  Send welcome email with login credentials
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-3 border border-border rounded-lg text-foreground hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex-1 bg-primary hover:bg-[hsl(var(--accent-hover))] text-primary-foreground px-4 py-3 rounded-lg
                             font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {createLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Create User
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full border border-border shadow-xl">
            <h2 className="text-xl font-bold text-foreground mb-6">Edit User</h2>

            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  required
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground
                             focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="w-full px-4 py-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground
                             focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  User Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditFormData(prev => ({ ...prev, userType: 'consultant' }))}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      editFormData.userType === 'consultant'
                        ? 'border-primary bg-[hsl(var(--accent-subtle))] text-foreground'
                        : 'border-border bg-background text-muted-foreground hover:border-muted'
                    }`}>
                    <div className="flex flex-col items-center gap-1">
                      <Users className={`w-5 h-5 ${editFormData.userType === 'consultant' ? 'text-primary' : ''}`} />
                      <span className="font-medium text-xs">Consultant</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditFormData(prev => ({ ...prev, userType: 'company' }))}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      editFormData.userType === 'company'
                        ? 'border-brand-teal bg-brand-teal/10 text-foreground'
                        : 'border-border bg-background text-muted-foreground hover:border-muted'
                    }`}>
                    <div className="flex flex-col items-center gap-1">
                      <Building2 className={`w-5 h-5 ${editFormData.userType === 'company' ? 'text-brand-teal' : ''}`} />
                      <span className="font-medium text-xs">Company</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditFormData(prev => ({ ...prev, userType: 'coach' }))}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      editFormData.userType === 'coach'
                        ? 'border-emerald-500 bg-emerald-100 text-foreground'
                        : 'border-border bg-background text-muted-foreground hover:border-muted'
                    }`}>
                    <div className="flex flex-col items-center gap-1">
                      <Mic className={`w-5 h-5 ${editFormData.userType === 'coach' ? 'text-emerald-600' : ''}`} />
                      <span className="font-medium text-xs">Coach</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditFormData(prev => ({ ...prev, userType: 'admin' }))}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      editFormData.userType === 'admin'
                        ? 'border-purple-500 bg-purple-100 text-foreground'
                        : 'border-border bg-background text-muted-foreground hover:border-muted'
                    }`}>
                    <div className="flex flex-col items-center gap-1">
                      <Shield className={`w-5 h-5 ${editFormData.userType === 'admin' ? 'text-purple-600' : ''}`} />
                      <span className="font-medium text-xs">Admin</span>
                    </div>
                  </button>
                </div>
                {editFormData.userType === 'coach' && (
                  <p className="text-xs text-amber-600 mt-2">
                    Note: Coach profile settings are managed separately in the coach dashboard.
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditForm(false)}
                  className="flex-1 px-4 py-3 border border-border rounded-lg text-foreground hover:bg-muted transition-colors">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 bg-primary hover:bg-[hsl(var(--accent-hover))] text-primary-foreground px-4 py-3 rounded-lg
                             font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {editLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Pencil className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && userToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full border border-border shadow-xl">
            <div className="text-center">
              <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-destructive" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">Delete User</h2>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete <strong>{userToDelete.full_name}</strong>? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setUserToDelete(null)
                }}
                className="flex-1 px-4 py-3 border border-border rounded-lg text-foreground hover:bg-muted transition-colors">
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deleteLoading}
                className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-3 rounded-lg
                           font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {deleteLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-muted-foreground" />
            All Users ({users.length})
          </h2>
        </div>

        {users.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-foreground">{user.full_name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.user_type === 'consultant'
                          ? 'bg-[hsl(var(--accent-subtle))] text-primary'
                          : user.user_type === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : user.user_type === 'coach'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-brand-teal/10 text-brand-teal'
                      }`}>
                        {user.user_type === 'consultant' ? (
                          <Users className="w-3 h-3" />
                        ) : user.user_type === 'admin' ? (
                          <Shield className="w-3 h-3" />
                        ) : user.user_type === 'coach' ? (
                          <Mic className="w-3 h-3" />
                        ) : (
                          <Building2 className="w-3 h-3" />
                        )}
                        {user.user_type || 'Unknown'}
                      </span>
                      {user.tenant_slug && user.user_type !== 'admin' && (
                        <p className="text-xs text-muted-foreground mt-1">
                          /{user.user_type === 'company' ? 'school' : user.user_type}/{user.tenant_slug}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {user.role === 'admin' && <Shield className="w-3 h-3" />}
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {user.last_seen_at
                        ? new Date(user.last_seen_at).toLocaleDateString()
                        : <span className="text-muted-foreground/50">Never</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditForm(user)}
                          title="Edit user"
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleResendEmail(user)}
                          disabled={resendLoading === user.id}
                          title="Resend credentials email"
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-[hsl(var(--accent-subtle))] rounded-lg transition-colors disabled:opacity-50">
                          {resendLoading === user.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => openDeleteConfirm(user)}
                          title="Delete user"
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
