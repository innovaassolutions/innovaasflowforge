// Index file for industry-specific hero mockups
import { IndustryKey } from '@/lib/industry-content'
import IndustryHeroCoaching from './industry-hero-coaching'
import IndustryHeroEducation from './industry-hero-education'
import IndustryHeroProfessionalServices from './industry-hero-professional-services'

// Map industry keys to their hero mockup components
const industryHeroMockups: Record<IndustryKey, React.ComponentType> = {
  coaching: IndustryHeroCoaching,
  education: IndustryHeroEducation,
  'professional-services': IndustryHeroProfessionalServices
}

interface IndustryHeroMockupProps {
  industry: IndustryKey
}

export default function IndustryHeroMockup({ industry }: IndustryHeroMockupProps) {
  const MockupComponent = industryHeroMockups[industry]
  return <MockupComponent />
}

// Export individual mockups for direct use
export {
  IndustryHeroCoaching,
  IndustryHeroEducation,
  IndustryHeroProfessionalServices
}
