// Index file for industry-specific hero mockups
import { IndustryKey } from '@/lib/industry-content'
import IndustryHeroManufacturing from './industry-hero-manufacturing'
import IndustryHeroPharma from './industry-hero-pharma'
import IndustryHeroEducation from './industry-hero-education'
import IndustryHeroProfessionalServices from './industry-hero-professional-services'

// Map industry keys to their hero mockup components
const industryHeroMockups: Record<IndustryKey, React.ComponentType> = {
  manufacturing: IndustryHeroManufacturing,
  pharma: IndustryHeroPharma,
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
  IndustryHeroManufacturing,
  IndustryHeroPharma,
  IndustryHeroEducation,
  IndustryHeroProfessionalServices
}
