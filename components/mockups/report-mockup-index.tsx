// Index file for industry-specific report mockups
import { IndustryKey } from '@/lib/industry-content'
import ReportConsulting from './report-consulting'
import ReportEducation from './report-education'
import ReportCoaching from './report-coaching'

// Map industry keys to their report mockup components
const reportMockups: Record<IndustryKey, React.ComponentType> = {
  'professional-services': ReportConsulting,
  education: ReportEducation,
  coaching: ReportCoaching
}

interface ReportMockupProps {
  industry: IndustryKey
}

export default function ReportMockup({ industry }: ReportMockupProps) {
  const MockupComponent = reportMockups[industry]
  return <MockupComponent />
}
