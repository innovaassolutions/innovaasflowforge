// Industry-specific content configuration for landing page
// Priority industries: Professional Services, Education, Coaching

export type IndustryKey = 'coaching' | 'education' | 'professional-services'

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
  coaching: {
    key: 'coaching',
    name: 'Coaching',
    shortName: 'Coaching',
    accentColor: 'hsl(340, 65%, 55%)', // Warm rose
    accentColorLight: 'hsl(340, 65%, 93%)',
    illustration: '/illustrations/coach.png',
    heroHeadline: 'Encode Your Coaching Methodology, Scale Self-Discovery',
    heroHighlight: 'Self-Discovery',
    heroDescription: 'Put your coaching framework — archetypes, reflection prompts, growth models — into FlowForge. Run guided self-discovery sessions with hundreds of clients simultaneously. Your methodology, their breakthrough moments.',
    valueProps: [
      {
        title: 'Your Method, At Scale',
        description: 'Encode your unique coaching approach — leadership archetypes, reflection sequences, assessment frameworks — and run it with unlimited clients'
      },
      {
        title: 'Deeper Than a Session',
        description: 'AI-guided conversations give clients space to reflect without time pressure, surfacing insights that 60-minute sessions often miss'
      },
      {
        title: 'Beautiful Client Reports',
        description: 'Archetype profiles, growth maps, and personalized development plans generated automatically from each conversation'
      }
    ],
    personas: [
      {
        title: 'Executive Coaches',
        description: 'Encode leadership assessment frameworks and run archetype discovery sessions that reveal blind spots and growth edges.',
        benefits: [
          'Leadership archetype profiling at scale',
          'Pre-session discovery that deepens live coaching',
          'Data-rich client progress tracking'
        ]
      },
      {
        title: 'Career Coaches',
        description: 'Guide clients through structured self-discovery — values clarification, strengths mapping, career vision exercises — asynchronously.',
        benefits: [
          'Values and strengths assessment automation',
          'Career narrative development support',
          'Scalable intake and discovery process'
        ]
      },
      {
        title: 'Coaching Practices',
        description: 'Standardize your firm\'s methodology across all coaches while preserving each client\'s unique journey.',
        benefits: [
          'Consistent methodology across your team',
          'Client insights shared across coaching engagements',
          'Institutional knowledge that grows with your practice'
        ]
      }
    ],
    painPoints: [
      {
        title: 'Your Method Doesn\'t Scale',
        description: 'Your coaching framework is powerful but lives in your head. FlowForge lets you encode it — your questions, your sequences, your archetypes — and deliver it to every client.'
      },
      {
        title: 'Discovery Takes Too Long',
        description: 'The first 3-4 sessions are often just getting to know the client. AI-guided self-discovery does the deep work before you even meet.'
      },
      {
        title: 'Insights Stay in Notebooks',
        description: 'Client breakthroughs get lost in session notes. FlowForge captures, synthesizes, and tracks growth patterns over time.'
      }
    ],
    ctaPrimary: 'Encode Your Method',
    ctaSecondary: 'See Coaching Demo',
    stats: [
      { value: '10x', label: 'More clients per coach' },
      { value: '100%', label: 'Your methodology, every session' },
      { value: '24hrs', label: 'From discovery to archetype profile' }
    ],
    heroMockup: 'coaching'
  },

  education: {
    key: 'education',
    name: 'Education',
    shortName: 'Education',
    accentColor: 'hsl(220, 70%, 55%)', // Academic blue
    accentColorLight: 'hsl(220, 70%, 93%)',
    illustration: '/illustrations/educator.png',
    heroHeadline: 'Hear Every Voice — Faculty, Staff, and Families',
    heroHighlight: 'Every Voice',
    heroDescription: 'AI-powered conversations that capture what surveys miss — from parent experience and family satisfaction to faculty needs and staff perspectives. Real voices, real insights, real improvement.',
    valueProps: [
      {
        title: 'Parent & Family Voice',
        description: 'Capture what parents really think about communication, their child\'s progress, and the school experience — in their own words, not checkbox surveys'
      },
      {
        title: 'Complete Stakeholder Picture',
        description: 'Hear from faculty, staff, parents, and administrators — then see where perspectives align and where they diverge'
      },
      {
        title: 'Accreditation Ready',
        description: 'Rich qualitative evidence that supports continuous improvement requirements and accreditation documentation'
      }
    ],
    personas: [
      {
        title: 'School Leaders',
        description: 'Understand what parents and families actually experience — communication quality, child progress visibility, community belonging.',
        benefits: [
          'Parent satisfaction drivers revealed',
          'Communication gap identification',
          'Enrollment and retention insights'
        ]
      },
      {
        title: 'Academic Leadership',
        description: 'Assess institutional readiness for curriculum innovation and capture faculty perspectives on support and resources.',
        benefits: [
          'Faculty development needs',
          'Curriculum alignment analysis',
          'Cross-department comparison'
        ]
      },
      {
        title: 'Accreditation Teams',
        description: 'Build rich evidence portfolios from stakeholder conversations that go far deeper than traditional surveys.',
        benefits: [
          'Qualitative evidence at scale',
          'Continuous improvement documentation',
          'Multi-stakeholder perspective synthesis'
        ]
      }
    ],
    painPoints: [
      {
        title: 'Parents Are Silent Until They Leave',
        description: 'Families who are unhappy rarely speak up — they just don\'t re-enroll. AI conversations capture honest feedback before it\'s too late.'
      },
      {
        title: 'Surveys Miss What Matters',
        description: '15% response rates and checkbox answers don\'t tell you why. Conversational AI gets 85%+ participation and rich qualitative depth.'
      },
      {
        title: 'Accreditation Evidence Is Thin',
        description: 'You need evidence of stakeholder voice and continuous improvement. FlowForge delivers both, automatically documented and synthesized.'
      }
    ],
    ctaPrimary: 'Start Listening',
    ctaSecondary: 'See Education Demo',
    stats: [
      { value: '85%', label: 'Parent participation rate' },
      { value: '500+', label: 'Voices captured per school' },
      { value: '2 Weeks', label: 'Complete assessment cycle' }
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
    heroHeadline: 'Encode Your Expertise, Scale Your Impact',
    heroHighlight: 'Your Expertise',
    heroDescription: 'Put your methodology, frameworks, and questioning approach into FlowForge — then run it across multiple clients simultaneously. Your brain, multiplied. Your expertise, encoded and working while you sleep.',
    valueProps: [
      {
        title: 'Encode What Makes You Great',
        description: 'Capture your methodology, frameworks, and interviewing instincts — FlowForge runs them at scale across every engagement'
      },
      {
        title: 'Your Brain, Multiplied',
        description: 'Run 3-5x more client engagements simultaneously, each one reflecting your unique approach and expertise'
      },
      {
        title: 'Richer Data, Better Deliverables',
        description: 'AI conversations go deeper than time-constrained interviews, then synthesize everything into executive-ready insights'
      }
    ],
    personas: [
      {
        title: 'Solo Consultants',
        description: 'Encode your approach once, then deploy it across every client. Your methodology runs at scale while you focus on high-value strategy work.',
        benefits: [
          'Your frameworks, running across multiple clients at once',
          'Consistent methodology without consistent effort',
          'More billable hours on strategy, less on data gathering'
        ]
      },
      {
        title: 'Boutique Firms',
        description: 'Capture your firm\'s collective expertise in one platform. Every engagement reflects your best thinking, not whoever happens to be available.',
        benefits: [
          'Institutional knowledge encoded, not locked in senior heads',
          'Scale engagements without diluting quality',
          'Cross-stakeholder synthesis in hours, not weeks'
        ]
      },
      {
        title: 'Advisory Practices',
        description: 'Run strategic assessments, digital readiness evaluations, and transformation diagnostics — all powered by your proprietary methodology.',
        benefits: [
          'Assessment-as-a-service product creation',
          'Client intelligence that compounds over time',
          'Beautiful client-facing reports and insights'
        ]
      }
    ],
    painPoints: [
      {
        title: 'Your Expertise Doesn\'t Scale',
        description: 'Your best work lives in your head. FlowForge lets you encode it — your frameworks, your questions, your instincts — and run it across every engagement.'
      },
      {
        title: 'Revenue Capped by Your Calendar',
        description: 'You can only be in one room at a time. Your encoded expertise can be in dozens of conversations simultaneously.'
      },
      {
        title: 'Synthesis Eats Your Strategy Time',
        description: 'You spend more time organizing notes than advising clients. Let AI synthesize — you focus on the insights only you can deliver.'
      }
    ],
    ctaPrimary: 'Encode Your Expertise',
    ctaSecondary: 'See How It Works',
    stats: [
      { value: '3-5x', label: 'More engagements per consultant' },
      { value: '100%', label: 'Your methodology, every time' },
      { value: '48hrs', label: 'From interviews to deliverable' }
    ],
    heroMockup: 'professional-services'
  }
}

// Default industry for new visitors
export const defaultIndustry: IndustryKey = 'professional-services'

// All industries in display order
export const industryOrder: IndustryKey[] = [
  'professional-services',
  'education',
  'coaching'
]

// Helper to get industry by key
export function getIndustryContent(key: IndustryKey): IndustryContent {
  return industryContent[key]
}

// Helper to validate industry key
export function isValidIndustryKey(key: string): key is IndustryKey {
  return key in industryContent
}
