// Index file for industry-specific dashboard mockups
import { IndustryKey } from '@/lib/industry-content'
import DashboardConsulting from './dashboard-consulting'
import DashboardLeadershipContinuity from './dashboard-leadership-continuity'
import DashboardCoaching from './dashboard-coaching'

// Map industry keys to their dashboard mockup components
const dashboardMockups: Record<IndustryKey, React.ComponentType> = {
  'professional-services': DashboardConsulting,
  education: DashboardLeadershipContinuity,
  coaching: DashboardCoaching
}

interface DashboardMockupProps {
  industry: IndustryKey
}

export default function DashboardMockup({ industry }: DashboardMockupProps) {
  const MockupComponent = dashboardMockups[industry]
  return <MockupComponent />
}
