// Index file for industry-specific interview mockups
import { IndustryKey } from '@/lib/industry-content'
import InterviewConsulting from './interview-consulting'
import InterviewEducation from './interview-education'
import InterviewCoaching from './interview-coaching'

// Map industry keys to their interview mockup components
const interviewMockups: Record<IndustryKey, React.ComponentType> = {
  'professional-services': InterviewConsulting,
  education: InterviewEducation,
  coaching: InterviewCoaching
}

interface InterviewMockupProps {
  industry: IndustryKey
}

export default function InterviewMockup({ industry }: InterviewMockupProps) {
  const MockupComponent = interviewMockups[industry]
  return <MockupComponent />
}
