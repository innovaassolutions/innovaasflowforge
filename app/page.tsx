import PromotionalLanding from '@/components/promotional-landing'

// Force dynamic so middleware can check auth cookies on every request
export const dynamic = 'force-dynamic'

export default function Home() {
  // Middleware handles redirecting authenticated users to /dashboard.
  // This page always renders the landing content server-side,
  // so search engines get the full HTML on first request.
  return <PromotionalLanding />
}
