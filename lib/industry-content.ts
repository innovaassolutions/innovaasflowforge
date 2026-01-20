// Industry-specific content configuration for landing page
// Priority industries: Manufacturing, Pharma, Education, Professional Services

export type IndustryKey = 'manufacturing' | 'pharma' | 'education' | 'professional-services'

export interface IndustryPainPoint {
  title: string
  description: string
}

export interface IndustryPersona {
  title: string
  description: string
  benefits: string[]
}

export interface IndustryContent {
  key: IndustryKey
  name: string
  shortName: string
  // Color accents (CSS custom property values)
  accentColor: string
  accentColorLight: string
  // Character illustration for this industry
  illustration: string
  // Hero section
  heroHeadline: string
  heroHighlight: string
  heroDescription: string
  // Value propositions
  valueProps: {
    title: string
    description: string
  }[]
  // Target personas for this industry
  personas: IndustryPersona[]
  // Industry-specific pain points
  painPoints: IndustryPainPoint[]
  // CTA text
  ctaPrimary: string
  ctaSecondary: string
  // Stats/social proof
  stats: {
    value: string
    label: string
  }[]
  // Mockup reference (component name)
  heroMockup: string
}

export const industryContent: Record<IndustryKey, IndustryContent> = {
  manufacturing: {
    key: 'manufacturing',
    name: 'Manufacturing',
    shortName: 'Manufacturing',
    accentColor: 'hsl(25, 95%, 53%)', // Industrial orange
    accentColorLight: 'hsl(25, 95%, 93%)',
    illustration: '/illustrations/industrialist.png',
    heroHeadline: 'Accelerate Your Industry 4.0 Transformation',
    heroHighlight: 'Industry 4.0',
    heroDescription: 'AI-powered assessment platform that interviews your operations team, identifies digital maturity gaps, and delivers actionable transformation roadmaps in days, not months.',
    valueProps: [
      {
        title: 'Faster Clarity',
        description: 'Replace 3-week consultant discovery with 3-day AI assessments'
      },
      {
        title: 'Fewer Wrong Decisions',
        description: 'Cross-stakeholder analysis reveals hidden contradictions before costly investments'
      },
      {
        title: 'Executive Confidence',
        description: 'Data-driven insights that boards and leadership teams trust'
      }
    ],
    personas: [
      {
        title: 'Operations Directors',
        description: 'Assess automation readiness and identify bottlenecks across production lines.',
        benefits: [
          'Digital maturity scoring',
          'Process automation gaps',
          'Technology integration roadmap'
        ]
      },
      {
        title: 'Plant Managers',
        description: 'Evaluate workforce readiness and change management requirements.',
        benefits: [
          'Skills gap analysis',
          'Change resistance mapping',
          'Training prioritization'
        ]
      },
      {
        title: 'IT/OT Leaders',
        description: 'Bridge information technology and operational technology for smart factory success.',
        benefits: [
          'Systems integration assessment',
          'Data architecture evaluation',
          'Cybersecurity readiness'
        ]
      }
    ],
    painPoints: [
      {
        title: 'Stakeholder Misalignment',
        description: 'Operations says one thing, IT says another. Our AI reveals the truth across all perspectives.'
      },
      {
        title: 'Consultant Fatigue',
        description: 'Your teams are tired of repetitive interviews. AI interviews are faster, more consistent, and less disruptive.'
      },
      {
        title: 'Transformation Paralysis',
        description: 'Too many options, not enough clarity. Get a prioritized roadmap based on your specific constraints.'
      }
    ],
    ctaPrimary: 'Start Factory Assessment',
    ctaSecondary: 'See Manufacturing Demo',
    stats: [
      { value: '80%', label: 'Faster than traditional discovery' },
      { value: '25+', label: 'Stakeholders assessed per engagement' },
      { value: '3 Days', label: 'From kickoff to executive report' }
    ],
    heroMockup: 'manufacturing'
  },

  pharma: {
    key: 'pharma',
    name: 'Pharmaceutical & Life Sciences',
    shortName: 'Pharma',
    accentColor: 'hsl(170, 60%, 45%)', // Medical teal
    accentColorLight: 'hsl(170, 60%, 93%)',
    illustration: '/illustrations/chemist-flask.png',
    heroHeadline: 'Streamline Regulatory Compliance & Digital Health',
    heroHighlight: 'Digital Health',
    heroDescription: 'AI-powered assessment platform that evaluates compliance readiness, identifies process gaps, and delivers validated transformation strategies aligned with FDA and EMA requirements.',
    valueProps: [
      {
        title: 'Compliance Confidence',
        description: 'Identify regulatory gaps before auditors do'
      },
      {
        title: 'Validated Insights',
        description: 'AI methodology designed for GxP environments'
      },
      {
        title: 'Audit-Ready Documentation',
        description: 'Every stakeholder response is traceable and timestamped'
      }
    ],
    personas: [
      {
        title: 'Quality Assurance Directors',
        description: 'Assess compliance readiness and identify documentation gaps across departments.',
        benefits: [
          'GxP compliance scoring',
          'CAPA effectiveness review',
          'Audit preparation roadmap'
        ]
      },
      {
        title: 'R&D Leadership',
        description: 'Evaluate digital lab capabilities and data integrity practices.',
        benefits: [
          'Lab digitization assessment',
          'Data integrity evaluation',
          'Research workflow analysis'
        ]
      },
      {
        title: 'Manufacturing Excellence',
        description: 'Bridge batch manufacturing with continuous improvement and digitization.',
        benefits: [
          'Process validation status',
          'Equipment qualification gaps',
          'Technology transfer readiness'
        ]
      }
    ],
    painPoints: [
      {
        title: 'Regulatory Complexity',
        description: 'FDA, EMA, and global regulations create assessment paralysis. Get clarity on what matters most.'
      },
      {
        title: 'Siloed Departments',
        description: 'QA, R&D, and Manufacturing speak different languages. AI synthesis reveals the complete picture.'
      },
      {
        title: 'Validation Burden',
        description: 'Everything requires documentation. Our platform provides audit-ready assessment trails.'
      }
    ],
    ctaPrimary: 'Start Compliance Assessment',
    ctaSecondary: 'See Pharma Demo',
    stats: [
      { value: '100%', label: 'Audit-trail documentation' },
      { value: '40+', label: 'Compliance checkpoints assessed' },
      { value: '21 CFR', label: 'Part 11 compatible platform' }
    ],
    heroMockup: 'pharma'
  },

  education: {
    key: 'education',
    name: 'Education & EdTech',
    shortName: 'Education',
    accentColor: 'hsl(220, 70%, 55%)', // Academic blue
    accentColorLight: 'hsl(220, 70%, 93%)',
    illustration: '/illustrations/educator.png',
    heroHeadline: 'Transform Learning Outcomes Through Strategic Insight',
    heroHighlight: 'Learning Outcomes',
    heroDescription: 'AI-powered assessment platform that interviews faculty, administrators, parents, and staff to identify institutional strengths, gaps, and pathways to educational excellence.',
    valueProps: [
      {
        title: 'Complete Stakeholder Voice',
        description: 'Hear from faculty, staff, and parents - not just the vocal few'
      },
      {
        title: 'Parent Satisfaction Insights',
        description: 'Understand what drives family engagement and institutional loyalty'
      },
      {
        title: 'Accreditation Ready',
        description: 'Documentation that supports continuous improvement requirements'
      }
    ],
    personas: [
      {
        title: 'Academic Leadership',
        description: 'Assess institutional readiness for curriculum innovation and pedagogical transformation.',
        benefits: [
          'Program effectiveness review',
          'Faculty development needs',
          'Curriculum alignment analysis'
        ]
      },
      {
        title: 'Parent & Family Engagement',
        description: 'Capture parent perspectives on educational quality, communication, and institutional value.',
        benefits: [
          'Parent satisfaction drivers',
          'Communication effectiveness',
          'Enrollment decision factors'
        ]
      },
      {
        title: 'Department Chairs',
        description: 'Understand faculty perspectives and identify departmental improvement opportunities.',
        benefits: [
          'Teaching load balance',
          'Research support needs',
          'Student success barriers'
        ]
      }
    ],
    painPoints: [
      {
        title: 'Parent Voice Gap',
        description: 'Parents influence enrollment and retention but rarely get heard. AI interviews capture what surveys miss.'
      },
      {
        title: 'Accreditation Pressure',
        description: 'Continuous improvement requires continuous data. Build an evidence base that accreditors trust.'
      },
      {
        title: 'Change Resistance',
        description: 'Understand the real barriers to transformation before launching initiatives that fail.'
      }
    ],
    ctaPrimary: 'Start Institutional Assessment',
    ctaSecondary: 'See Education Demo',
    stats: [
      { value: '500+', label: 'Faculty & parent voices' },
      { value: '85%', label: 'Higher response than surveys' },
      { value: '2 Weeks', label: 'Complete assessment' }
    ],
    heroMockup: 'education'
  },

  'professional-services': {
    key: 'professional-services',
    name: 'Consulting',
    shortName: 'Consulting',
    accentColor: 'hsl(260, 60%, 55%)', // Corporate purple
    accentColorLight: 'hsl(260, 60%, 93%)',
    illustration: '/illustrations/consultant.png',
    heroHeadline: 'Automate Client Discovery With AI-Powered Interviews',
    heroHighlight: 'Client Discovery',
    heroDescription: 'AI-powered platform that conducts stakeholder interviews across your client organizations, identifies operational pain points, and synthesizes findings into comprehensive strategic reports.',
    valueProps: [
      {
        title: 'Faster Discovery',
        description: 'Complete client assessments in days instead of weeks'
      },
      {
        title: 'Deeper Insights',
        description: 'AI interviews uncover friction points that surface interviews miss'
      },
      {
        title: 'Beautiful Reports',
        description: 'Deliver executive-ready synthesis documents that impress clients'
      }
    ],
    personas: [
      {
        title: 'Management Consultants',
        description: 'Automate the initial discovery phase and focus on strategic recommendations.',
        benefits: [
          'Stakeholder interview automation',
          'Cross-divisional synthesis',
          'Actionable recommendations'
        ]
      },
      {
        title: 'Strategy Firms',
        description: 'Scale your discovery capacity without scaling headcount.',
        benefits: [
          'Parallel client assessments',
          'Consistent methodology',
          'Faster time to insights'
        ]
      },
      {
        title: 'Operations Consultants',
        description: 'Identify operational bottlenecks and transformation opportunities.',
        benefits: [
          'Process pain point mapping',
          'Stakeholder alignment gaps',
          'Prioritized improvement roadmap'
        ]
      }
    ],
    painPoints: [
      {
        title: 'Discovery Bottleneck',
        description: 'Your best consultants spend weeks on interviews instead of strategy. AI handles discovery so you focus on value.'
      },
      {
        title: 'Inconsistent Methodology',
        description: 'Every consultant interviews differently. Standardize your discovery process across all engagements.'
      },
      {
        title: 'Synthesis Overload',
        description: 'Turning dozens of interview notes into coherent insights is exhausting. AI synthesizes everything automatically.'
      }
    ],
    ctaPrimary: 'Start Client Assessment',
    ctaSecondary: 'See Consulting Demo',
    stats: [
      { value: '80%', label: 'Faster discovery phase' },
      { value: '25+', label: 'Stakeholders per engagement' },
      { value: '3 Days', label: 'From kickoff to insights report' }
    ],
    heroMockup: 'professional-services'
  }
}

// Default industry for new visitors
export const defaultIndustry: IndustryKey = 'manufacturing'

// All industries in display order (pharma temporarily hidden)
export const industryOrder: IndustryKey[] = [
  'manufacturing',
  'education',
  'professional-services'
]

// Helper to get industry by key
export function getIndustryContent(key: IndustryKey): IndustryContent {
  return industryContent[key]
}

// Helper to validate industry key
export function isValidIndustryKey(key: string): key is IndustryKey {
  return key in industryContent
}
