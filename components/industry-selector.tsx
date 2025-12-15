'use client'

import Image from 'next/image'
import { Factory, FlaskConical, GraduationCap, Briefcase } from 'lucide-react'
import { IndustryKey, industryContent, industryOrder } from '@/lib/industry-content'

interface IndustrySelectorProps {
  selected: IndustryKey
  onSelect: (industry: IndustryKey) => void
  variant?: 'pills' | 'dropdown' | 'cards'
}

// Icon mapping for each industry
const industryIcons: Record<IndustryKey, React.ComponentType<{ className?: string }>> = {
  manufacturing: Factory,
  pharma: FlaskConical,
  education: GraduationCap,
  'professional-services': Briefcase
}

// Button labels for each industry
const industryLabels: Record<IndustryKey, string> = {
  manufacturing: 'For Industry',
  pharma: 'For Pharma',
  education: 'For Education',
  'professional-services': 'For Consultants'
}

export default function IndustrySelector({
  selected,
  onSelect,
  variant = 'pills'
}: IndustrySelectorProps) {
  if (variant === 'pills') {
    return (
      <div className="flex flex-wrap justify-center gap-2
                      sm:gap-3">
        {industryOrder.map((key) => {
          const Icon = industryIcons[key]
          const isSelected = selected === key

          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                          sm:px-5 sm:py-2.5
                          ${isSelected
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'bg-card text-muted-foreground border border-border hover:border-primary hover:text-foreground'
                          }`}
              aria-pressed={isSelected}
            >
              <Icon className="w-4 h-4" />
              <span>{industryLabels[key]}</span>
            </button>
          )
        })}
      </div>
    )
  }

  if (variant === 'cards') {
    return (
      <div className="grid grid-cols-2 gap-3
                      sm:gap-4
                      lg:grid-cols-4">
        {industryOrder.map((key) => {
          const content = industryContent[key]
          const isSelected = selected === key

          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all
                          sm:p-6
                          ${isSelected
                            ? 'border-primary bg-primary/5 shadow-md'
                            : 'border-border bg-card hover:border-primary/50 hover:bg-muted'
                          }`}
              aria-pressed={isSelected}
            >
              <div className="w-16 h-16 mb-3 relative
                              sm:w-20 sm:h-20">
                <Image
                  src={content.illustration}
                  alt={content.name}
                  fill
                  className={`object-contain transition-all
                              ${isSelected ? 'opacity-100' : 'opacity-70 grayscale-[30%]'}`}
                  unoptimized
                />
              </div>
              <span className={`text-sm font-semibold text-center
                               sm:text-base
                               ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                {content.shortName}
              </span>
            </button>
          )
        })}
      </div>
    )
  }

  // Dropdown variant
  return (
    <div className="relative inline-block">
      <select
        value={selected}
        onChange={(e) => onSelect(e.target.value as IndustryKey)}
        className="appearance-none bg-card border border-border rounded-lg px-4 py-2 pr-10 text-foreground font-medium
                   focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
                   cursor-pointer"
      >
        {industryOrder.map((key) => {
          const content = industryContent[key]
          return (
            <option key={key} value={key}>
              {content.name}
            </option>
          )
        })}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}
