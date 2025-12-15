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
    heroHeadline: 'Transform Learning Outcomes Through Strategic Insight',
    heroHighlight: 'Learning Outcomes',
    heroDescription: 'AI-powered assessment platform that interviews faculty, administrators, and staff to identify institutional strengths, gaps, and pathways to educational excellence.',
    valueProps: [
      {
        title: 'Stakeholder Voice',
        description: 'Hear from every faculty member, not just the vocal few'
      },
      {
        title: 'Data-Driven Planning',
        description: 'Replace opinion with evidence in strategic decisions'
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
        title: 'IT Directors',
        description: 'Evaluate EdTech adoption and infrastructure readiness across campuses.',
        benefits: [
          'LMS effectiveness assessment',
          'Technology integration gaps',
          'Digital equity evaluation'
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
        title: 'Faculty Engagement',
        description: 'Getting meaningful input from busy faculty is hard. AI interviews fit their schedule, not yours.'
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
      { value: '500+', label: 'Faculty voices captured' },
      { value: '85%', label: 'Higher response rates than surveys' },
      { value: '2 Weeks', label: 'Complete institutional assessment' }
    ],
    heroMockup: 'education'
  },

  'professional-services': {
    key: 'professional-services',
    name: 'Professional Services',
    shortName: 'Prof Services',
    accentColor: 'hsl(260, 60%, 55%)', // Corporate purple
    accentColorLight: 'hsl(260, 60%, 93%)',
    heroHeadline: 'Elevate Client Delivery Through Strategic Alignment',
    heroHighlight: 'Client Delivery',
    heroDescription: 'AI-powered assessment platform that interviews partners, consultants, and staff to optimize service delivery, identify growth opportunities, and strengthen client relationships.',
    valueProps: [
      {
        title: 'Partner Alignment',
        description: 'Surface strategic disagreements before they derail initiatives'
      },
      {
        title: 'Client Intelligence',
        description: 'Systematic capture of relationship insights across your team'
      },
      {
        title: 'Scalable Discovery',
        description: 'Run assessments for multiple clients simultaneously'
      }
    ],
    personas: [
      {
        title: 'Managing Partners',
        description: 'Assess firm-wide strategic alignment and identify growth opportunities.',
        benefits: [
          'Practice area evaluation',
          'Partner alignment mapping',
          'Market positioning analysis'
        ]
      },
      {
        title: 'Client Engagement Leaders',
        description: 'Evaluate delivery effectiveness and identify improvement opportunities.',
        benefits: [
          'Client satisfaction drivers',
          'Delivery model assessment',
          'Team utilization insights'
        ]
      },
      {
        title: 'Practice Directors',
        description: 'Understand team capabilities and optimize resource allocation.',
        benefits: [
          'Skills inventory analysis',
          'Knowledge management gaps',
          'Training prioritization'
        ]
      }
    ],
    painPoints: [
      {
        title: 'Partner Politics',
        description: 'Anonymous AI interviews reveal honest perspectives that partners wont share in meetings.'
      },
      {
        title: 'Knowledge Silos',
        description: 'Your best insights are trapped in individual consultant heads. Systematically capture institutional knowledge.'
      },
      {
        title: 'Client Concentration Risk',
        description: 'Understand relationship health across your portfolio before surprises hit revenue.'
      }
    ],
    ctaPrimary: 'Start Firm Assessment',
    ctaSecondary: 'See Services Demo',
    stats: [
      { value: '360°', label: 'Stakeholder perspectives captured' },
      { value: '15+', label: 'Practice areas analyzed' },
      { value: '5 Days', label: 'From interview to strategic plan' }
    ],
    heroMockup: 'professional-services'
  }
}

// Default industry for new visitors
export const defaultIndustry: IndustryKey = 'manufacturing'

// All industries in display order
export const industryOrder: IndustryKey[] = [
  'manufacturing',
  'pharma',
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
