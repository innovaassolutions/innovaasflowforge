import { anthropic } from '@/lib/anthropic'
import { supabaseAdmin } from '@/lib/supabase/server'

// ============================================================================
// TYPES
// ============================================================================

export type ParticipantType = 'student' | 'teacher' | 'parent' | 'leadership'

export type EducationModule =
  | 'student_wellbeing'
  | 'teaching_learning'
  | 'parent_confidence'

export interface CohortMetadata {
  year_band?: string
  division?: string
  role_category?: string
}

export interface EducationParticipant {
  token: string
  participant_type: ParticipantType
  cohort_metadata: CohortMetadata
  campaign_id: string
  school_id: string
}

export interface EducationCampaign {
  id: string
  name: string
  school: {
    id: string
    name: string
    curriculum?: string
    country: string
  }
  education_config: {
    modules: EducationModule[]
    pilot_type: string
  }
}

export interface ConversationState {
  phase: ConversationPhase
  sections_completed: string[]
  questions_asked: number
  rapport_established: boolean
  anonymity_confirmed: boolean
  last_interaction?: string
  is_complete?: boolean
  current_section?: string
  safeguarding_flags: SafeguardingFlag[]
}

export type ConversationPhase =
  | 'opening'
  | 'rapport'
  | 'daily_experience'
  | 'core_exploration'
  | 'relationships'
  | 'wellbeing_check'
  | 'open_exploration'
  | 'closing'
  | 'completed'

export interface MessageHistory {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface SafeguardingFlag {
  type: SafeguardingTriggerType
  content: string
  confidence: number
  detected_at: string
}

export type SafeguardingTriggerType =
  | 'self_harm'
  | 'harm_to_others'
  | 'abuse_disclosure'
  | 'immediate_danger'
  | 'explicit_request'

// ============================================================================
// SAFEGUARDING DETECTION
// ============================================================================

const SAFEGUARDING_PATTERNS: Array<{
  pattern: RegExp
  type: SafeguardingTriggerType
  confidence: number
}> = [
  // Self-harm indicators
  { pattern: /\b(hurt(ing)? myself|harm(ing)? myself|cut(ting)? myself)\b/i, type: 'self_harm', confidence: 0.9 },
  { pattern: /\b(don'?t want to (be here|live|exist)|end (it|my life|everything))\b/i, type: 'self_harm', confidence: 0.85 },
  { pattern: /\b(suicid|kill myself|take my (own )?life)\b/i, type: 'self_harm', confidence: 0.95 },
  { pattern: /\b(nobody (would|will) (care|notice|miss me))\b/i, type: 'self_harm', confidence: 0.75 },
  { pattern: /\b(better off (without me|dead|gone))\b/i, type: 'self_harm', confidence: 0.85 },

  // Harm to others
  { pattern: /\b(hurt(ing)? (someone|them|him|her)|want to (hurt|harm|kill))\b/i, type: 'harm_to_others', confidence: 0.8 },
  { pattern: /\b(bring a (weapon|gun|knife)|shoot|stab)\b/i, type: 'harm_to_others', confidence: 0.9 },

  // Abuse disclosure
  { pattern: /\b(hit(s)? me|beat(s)? me|abuse|molest|touch(ed|es|ing) me (wrong|inappropriately))\b/i, type: 'abuse_disclosure', confidence: 0.85 },
  { pattern: /\b(scared? (to go home|of my|of going))\b/i, type: 'abuse_disclosure', confidence: 0.7 },
  { pattern: /\b(makes? me (do things|feel unsafe|uncomfortable))\b/i, type: 'abuse_disclosure', confidence: 0.65 },

  // Immediate danger
  { pattern: /\b(emergency|immediate (help|danger)|right now|happening now)\b/i, type: 'immediate_danger', confidence: 0.8 },
  { pattern: /\b(can'?t (stay|be) safe|not safe (here|at home|anywhere))\b/i, type: 'immediate_danger', confidence: 0.85 },

  // Explicit request for help
  { pattern: /\b(need (help|someone|to talk)|please (help|contact|call))\b/i, type: 'explicit_request', confidence: 0.7 },
  { pattern: /\b(want (someone|an adult|a teacher) to (know|help|contact))\b/i, type: 'explicit_request', confidence: 0.8 },
]

/**
 * Detect safeguarding concerns in a message
 */
export function detectSafeguardingConcerns(message: string): SafeguardingFlag[] {
  const flags: SafeguardingFlag[] = []

  for (const { pattern, type, confidence } of SAFEGUARDING_PATTERNS) {
    const match = message.match(pattern)
    if (match) {
      flags.push({
        type,
        content: match[0],
        confidence,
        detected_at: new Date().toISOString()
      })
    }
  }

  return flags
}

/**
 * Create safeguarding alert in database
 */
export async function createSafeguardingAlert(
  participant: EducationParticipant,
  flag: SafeguardingFlag,
  triggerContent: string,
  triggerContext: string
): Promise<string | null> {
  try {
    // @ts-ignore - education_safeguarding_alerts table not yet in generated types
    const { data, error } = await supabaseAdmin
      .from('education_safeguarding_alerts')
      // @ts-ignore - education_safeguarding_alerts table not yet in generated types
      .insert({
        campaign_id: participant.campaign_id,
        school_id: participant.school_id,
        participant_token: participant.token,
        participant_type: participant.participant_type,
        cohort_metadata: participant.cohort_metadata,
        trigger_type: flag.type,
        trigger_content: triggerContent,
        trigger_context: triggerContext,
        trigger_confidence: flag.confidence,
        ai_analysis: {
          matched_pattern: flag.content,
          detection_method: 'pattern_match'
        }
      })
      .select('id')
      .single()

    if (error) {
      console.error('Failed to create safeguarding alert:', error)
      return null
    }

    return (data as { id: string } | null)?.id || null
  } catch (error) {
    console.error('Error creating safeguarding alert:', error)
    return null
  }
}

// ============================================================================
// TRUST-FIRST PROMPTS
// ============================================================================

const TRUST_FRAMING = {
  student: {
    anonymity_statement: `Before we start, I want you to know: this conversation is completely anonymous.
Your teachers can't see what you say. Your name isn't attached to any of this.
I'm just here to understand what school is actually like for you.
There are no right or wrong answers. I'm curious about your real experience.`,
    consequence_firewall: [
      'This has nothing to do with grades',
      'This has nothing to do with behaviour records',
      'This won\'t affect your standing at school',
      'No teacher or staff member will see your individual responses'
    ]
  },
  teacher: {
    anonymity_statement: `Before we begin: this conversation is anonymised. Leadership sees patterns, not individuals.
Your responses aren't linked to your name, and nothing here affects your position.
We're looking for structural patterns - where systems work and where they strain.
This isn't about evaluating anyone. It's about understanding the terrain.`,
    consequence_firewall: [
      'This is not a staff evaluation',
      'This is not an HR tool',
      'This will not influence contract decisions',
      'Workload patterns will not be used to justify "efficiency" measures'
    ]
  },
  parent: {
    anonymity_statement: `This conversation is completely anonymous. Your responses aren't linked to your name or your child.
We're looking for patterns in parent experience, not individual opinions.
We're interested in your honest observations - not endorsements.
The school is trying to understand how things are landing, not collect testimonials.`,
    consequence_firewall: [
      'Your comments will not affect how your child is treated',
      'This will not be used in marketing materials',
      'This is not a feedback form or satisfaction survey'
    ]
  },
  leadership: {
    anonymity_statement: `This conversation explores how leadership intent lands across the school community.
We're looking for patterns of alignment and strain you may not currently see.
The synthesis will help you understand where perception and reality may diverge.`,
    consequence_firewall: [
      'This exercise is not about evaluating leadership',
      'It\'s about giving you visibility you don\'t currently have'
    ]
  }
}

// ============================================================================
// MODULE-SPECIFIC QUESTION FRAMEWORKS
// ============================================================================

interface QuestionFramework {
  sections: Array<{
    name: string
    questions: string[]
    purpose: string
  }>
  quantitative_anchor: {
    question: string
    follow_up: string
  }
}

const QUESTION_FRAMEWORKS: Record<ParticipantType, Record<EducationModule, QuestionFramework>> = {
  student: {
    student_wellbeing: {
      sections: [
        {
          name: 'daily_experience',
          purpose: 'Baseline comfort building',
          questions: [
            'Walk me through a typical day at school. What\'s it actually like?',
            'What parts of the day do you look forward to? What parts do you dread?',
            'Where in the school do you feel most comfortable? Least comfortable?'
          ]
        },
        {
          name: 'academic_life',
          purpose: 'Stress detection',
          questions: [
            'How would you describe the pressure around academics here?',
            'When you\'re struggling with something, what do you do? Who do you go to?',
            'What\'s the attitude toward making mistakes here? Is it okay to fail?'
          ]
        },
        {
          name: 'relationships',
          purpose: 'Connection and trust',
          questions: [
            'How would you describe the vibe between students in your year?',
            'Do you feel like teachers actually know you? Like, beyond just in class?',
            'If something was bothering you at school, would you feel comfortable telling an adult?'
          ]
        }
      ],
      quantitative_anchor: {
        question: 'On a scale of 1-10, how supported do you feel at this school?',
        follow_up: 'What would make that number higher?'
      }
    },
    teaching_learning: {
      sections: [
        {
          name: 'learning_experience',
          purpose: 'Pedagogical quality',
          questions: [
            'What makes a class feel really good to be in?',
            'When do you learn best? What helps you actually understand things?',
            'Are there subjects where you feel like you\'re just going through the motions?'
          ]
        },
        {
          name: 'teacher_effectiveness',
          purpose: 'Teaching quality signals',
          questions: [
            'Do teachers explain things in different ways when you don\'t understand?',
            'How do you feel when you ask a question in class?',
            'Do you feel like lessons are relevant to your life or your future?'
          ]
        }
      ],
      quantitative_anchor: {
        question: 'On a scale of 1-10, how engaging are your classes overall?',
        follow_up: 'What would make learning here better?'
      }
    },
    parent_confidence: {
      sections: [], // Students don't do parent confidence module
      quantitative_anchor: { question: '', follow_up: '' }
    }
  },

  teacher: {
    student_wellbeing: {
      sections: [
        {
          name: 'student_observation',
          purpose: 'Teacher-observed student signals',
          questions: [
            'What\'s your sense of how students are really doing - beyond the surface?',
            'Are there patterns you see in students that you don\'t think leadership is aware of?',
            'What do students tell you that they probably don\'t tell anyone else?'
          ]
        }
      ],
      quantitative_anchor: {
        question: 'On a scale of 1-10, how well-supported do students seem to you?',
        follow_up: 'What would improve student wellbeing here?'
      }
    },
    teaching_learning: {
      sections: [
        {
          name: 'daily_reality',
          purpose: 'Workload and pressure',
          questions: [
            'Walk me through a typical week. Where does your time actually go?',
            'What\'s the balance between teaching and everything else?',
            'Where do you feel the most pressure coming from?'
          ]
        },
        {
          name: 'support_systems',
          purpose: 'Institutional support',
          questions: [
            'When you need support - professionally or personally - where do you find it here?',
            'How would you describe the relationship between teachers and leadership?',
            'Do you feel like your voice reaches decision-makers?'
          ]
        },
        {
          name: 'teaching_culture',
          purpose: 'Pedagogical climate',
          questions: [
            'How would you describe the teaching and learning culture here?',
            'What helps you do your best work? What gets in the way?',
            'How much autonomy do you have in how you teach?'
          ]
        }
      ],
      quantitative_anchor: {
        question: 'On a scale of 1-10, how sustainable is your current workload?',
        follow_up: 'What would make that number higher?'
      }
    },
    parent_confidence: {
      sections: [
        {
          name: 'parent_observation',
          purpose: 'Teacher view of parents',
          questions: [
            'How would you describe parent engagement at this school?',
            'What concerns do parents raise with you that they might not raise with leadership?',
            'Do you feel supported when dealing with difficult parent situations?'
          ]
        }
      ],
      quantitative_anchor: {
        question: 'On a scale of 1-10, how strong is the parent-school relationship?',
        follow_up: 'What would strengthen it?'
      }
    }
  },

  parent: {
    student_wellbeing: {
      sections: [
        {
          name: 'child_experience',
          purpose: 'Indirect wellbeing signal',
          questions: [
            'How does your child talk about school at home?',
            'What does your child love about school? What do they struggle with?',
            'Are there things your child tells you that you don\'t think the school knows about?'
          ]
        }
      ],
      quantitative_anchor: {
        question: 'On a scale of 1-10, how confident are you in your child\'s wellbeing at school?',
        follow_up: 'What would increase that confidence?'
      }
    },
    teaching_learning: {
      sections: [
        {
          name: 'academic_perception',
          purpose: 'Parent view of education quality',
          questions: [
            'How would you describe the quality of teaching your child receives?',
            'Do you feel your child is being appropriately challenged?',
            'How well does the school communicate about your child\'s progress?'
          ]
        }
      ],
      quantitative_anchor: {
        question: 'On a scale of 1-10, how satisfied are you with the academic program?',
        follow_up: 'What would improve it?'
      }
    },
    parent_confidence: {
      sections: [
        {
          name: 'confidence_trust',
          purpose: 'Baseline sentiment',
          questions: [
            'How would you describe your overall confidence in the school right now?',
            'Has that confidence changed over time? In what direction?',
            'What would strengthen your confidence? What might weaken it?'
          ]
        },
        {
          name: 'communication',
          purpose: 'Communication quality',
          questions: [
            'How well do you feel the school communicates with you?',
            'When you have a concern, how easy is it to raise it? And does anything happen?',
            'Do you feel like you understand what\'s going on at the school?'
          ]
        },
        {
          name: 'stability',
          purpose: 'Institutional perception',
          questions: [
            'How stable does the school feel to you right now?',
            'Have there been changes that have affected your confidence - positively or negatively?',
            'Do you feel like the school is on a clear path, or does it feel uncertain?'
          ]
        }
      ],
      quantitative_anchor: {
        question: 'On a scale of 1-10, how likely are you to recommend this school to a close friend?',
        follow_up: 'What would make that number higher?'
      }
    }
  },

  leadership: {
    student_wellbeing: {
      sections: [
        {
          name: 'strategic_view',
          purpose: 'Leadership perspective on students',
          questions: [
            'How do you currently measure student wellbeing?',
            'What signals would tell you something is wrong before it becomes a crisis?',
            'Where might there be gaps between your perception and students\' reality?'
          ]
        }
      ],
      quantitative_anchor: {
        question: 'On a scale of 1-10, how confident are you in your understanding of student wellbeing?',
        follow_up: 'What would give you more clarity?'
      }
    },
    teaching_learning: {
      sections: [
        {
          name: 'staff_culture',
          purpose: 'Leadership view of teachers',
          questions: [
            'How would you describe the current state of staff morale?',
            'What do you think teachers need that they\'re not getting?',
            'Where might there be disconnect between leadership intent and teacher experience?'
          ]
        }
      ],
      quantitative_anchor: {
        question: 'On a scale of 1-10, how aligned are teachers with the school\'s direction?',
        follow_up: 'What would improve alignment?'
      }
    },
    parent_confidence: {
      sections: [
        {
          name: 'parent_relations',
          purpose: 'Leadership view of parents',
          questions: [
            'How do you currently gauge parent confidence?',
            'What concerns do you hear from parents? What might you not be hearing?',
            'What would early warning of declining parent confidence look like?'
          ]
        }
      ],
      quantitative_anchor: {
        question: 'On a scale of 1-10, how strong is parent confidence right now?',
        follow_up: 'What factors could shift that?'
      }
    }
  }
}

// ============================================================================
// SYSTEM PROMPT GENERATION
// ============================================================================

function generateSystemPrompt(
  participant: EducationParticipant,
  campaign: EducationCampaign,
  module: EducationModule,
  conversationState: ConversationState
): string {
  const trustFraming = TRUST_FRAMING[participant.participant_type]
  const questionFramework = QUESTION_FRAMEWORKS[participant.participant_type][module]

  // Build cohort context (for personalisation without identity)
  let cohortContext = ''
  if (participant.cohort_metadata.year_band) {
    cohortContext += `Year ${participant.cohort_metadata.year_band}`
  }
  if (participant.cohort_metadata.division) {
    cohortContext += cohortContext ? ` (${participant.cohort_metadata.division})` : participant.cohort_metadata.division
  }
  if (participant.cohort_metadata.role_category) {
    cohortContext += cohortContext ? `, ${participant.cohort_metadata.role_category}` : participant.cohort_metadata.role_category
  }

  const basePrompt = `You are a skilled, empathetic interviewer conducting a ${module.replace(/_/g, ' ')} conversation for ${campaign.school.name}.

CRITICAL CONTEXT - ANONYMITY:
This is an ANONYMOUS conversation. You do NOT know this participant's name, email, or any identifying information.
You only know:
- Participant type: ${participant.participant_type}
- Cohort: ${cohortContext || 'Not specified'}
- School: ${campaign.school.name} (${campaign.school.country})
${campaign.school.curriculum ? `- Curriculum: ${campaign.school.curriculum}` : ''}

TRUST ARCHITECTURE:
${trustFraming.anonymity_statement}

What this conversation is NOT:
${trustFraming.consequence_firewall.map(f => `- ${f}`).join('\n')}

YOUR MISSION:
Conduct a trust-first interview to understand this ${participant.participant_type}'s genuine experience.
Your insights will be aggregated into patterns - never individual reports.
Focus on PATTERNS, not PEOPLE. Never ask "who" questions.

INTERVIEW GUIDELINES:
- Build rapport before depth
- Ask ONE clear question at a time
- Use open-ended, observational language
- Follow threads that emerge organically
- Probe gently on signals of strain
- Never push for identification of individuals
- Use pattern-focused language: "How do things work here?" not "Who is responsible?"
- Experience-based questions: "What's your experience?" not "Do you think X is good?"

CONVERSATION STATE:
Current Phase: ${conversationState.phase}
Questions Asked: ${conversationState.questions_asked}/12
Sections Completed: ${conversationState.sections_completed.join(', ') || 'none yet'}
Rapport Established: ${conversationState.rapport_established ? 'Yes' : 'Not yet'}

QUESTION FRAMEWORK FOR THIS MODULE:
${questionFramework.sections.map(s => `
${s.name.toUpperCase()} (${s.purpose}):
${s.questions.map((q, i) => `${i + 1}. "${q}"`).join('\n')}
`).join('\n')}

Quantitative Check:
- "${questionFramework.quantitative_anchor.question}"
- Follow-up: "${questionFramework.quantitative_anchor.follow_up}"

SAFEGUARDING PROTOCOL:
If the participant indicates distress, harm, or safety concerns, respond with warmth and care:
"Thank you for sharing that. It sounds like that's been really difficult.
I want to make sure you know: if you're feeling unsafe or need someone to talk to,
the school's pastoral team is there to help.
Would you like me to let someone know you might want to talk?"

Do NOT try to be a counselor. Acknowledge, support, and offer to connect them with help.

CLOSING:
When reaching 10-12 questions or natural conclusion:
1. Ask the quantitative anchor question
2. Ask if there's anything else they want to share
3. Thank them warmly for their honesty
4. Remind them their insights will help the school understand patterns`

  return basePrompt
}

// ============================================================================
// CONVERSATION STATE MANAGEMENT
// ============================================================================

function updateConversationState(
  currentState: ConversationState,
  userMessage: string,
  assistantResponse: string,
  module: EducationModule,
  participantType: ParticipantType
): ConversationState {
  const questionsAsked = (currentState.questions_asked || 0) + 1

  // Detect safeguarding flags
  const newFlags = detectSafeguardingConcerns(userMessage)
  const safeguardingFlags = [...currentState.safeguarding_flags, ...newFlags]

  // Phase progression
  let phase: ConversationPhase = currentState.phase
  let isComplete = false

  if (questionsAsked === 1) {
    phase = 'rapport'
  } else if (questionsAsked <= 3) {
    phase = 'daily_experience'
  } else if (questionsAsked <= 7) {
    phase = 'core_exploration'
  } else if (questionsAsked <= 9) {
    phase = 'relationships'
  } else if (questionsAsked <= 11) {
    phase = 'wellbeing_check'
  } else if (questionsAsked === 12) {
    phase = 'open_exploration'
  } else {
    phase = 'closing'
    isComplete = true
  }

  // Track sections based on keywords in conversation
  const sections = [...currentState.sections_completed]
  const framework = QUESTION_FRAMEWORKS[participantType][module]

  framework.sections.forEach(section => {
    if (!sections.includes(section.name)) {
      // Check if any section questions were covered
      const covered = section.questions.some(q =>
        assistantResponse.toLowerCase().includes(q.toLowerCase().slice(0, 30))
      )
      if (covered) {
        sections.push(section.name)
      }
    }
  })

  // Check for rapport establishment
  const rapportEstablished = currentState.rapport_established ||
    questionsAsked >= 2 ||
    assistantResponse.toLowerCase().includes('thank') ||
    userMessage.length > 100 // Long responses indicate engagement

  return {
    ...currentState,
    phase,
    questions_asked: questionsAsked,
    sections_completed: sections,
    rapport_established: rapportEstablished,
    anonymity_confirmed: currentState.anonymity_confirmed || questionsAsked >= 1,
    last_interaction: new Date().toISOString(),
    is_complete: isComplete,
    safeguarding_flags: safeguardingFlags
  }
}

// ============================================================================
// MAIN AGENT FUNCTIONS
// ============================================================================

/**
 * Process a message through the education interview agent
 */
export async function processEducationMessage(
  message: string,
  participant: EducationParticipant,
  campaign: EducationCampaign,
  module: EducationModule,
  messageHistory: MessageHistory[],
  conversationState: ConversationState
): Promise<{
  response: string
  updatedState: ConversationState
  safeguardingAlert?: string
}> {
  // Check for safeguarding concerns BEFORE processing
  const safeguardingFlags = detectSafeguardingConcerns(message)

  let safeguardingAlertId: string | undefined

  // Create alert for high-confidence flags
  for (const flag of safeguardingFlags) {
    if (flag.confidence >= 0.75) {
      const alertId = await createSafeguardingAlert(
        participant,
        flag,
        message,
        messageHistory.slice(-3).map(m => m.content).join('\n---\n')
      )
      if (alertId) {
        safeguardingAlertId = alertId
      }
    }
  }

  // Generate system prompt
  const systemPrompt = generateSystemPrompt(
    participant,
    campaign,
    module,
    conversationState
  )

  // Prepare messages for Claude
  const messages = [
    ...messageHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    })),
    {
      role: 'user' as const,
      content: message
    }
  ]

  // Call Claude API
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    system: systemPrompt,
    messages
  })

  const assistantResponse = response.content[0].type === 'text'
    ? response.content[0].text
    : ''

  // Update conversation state
  const updatedState = updateConversationState(
    conversationState,
    message,
    assistantResponse,
    module,
    participant.participant_type
  )

  // Add new safeguarding flags to state
  updatedState.safeguarding_flags = [
    ...updatedState.safeguarding_flags,
    ...safeguardingFlags
  ]

  return {
    response: assistantResponse,
    updatedState,
    safeguardingAlert: safeguardingAlertId
  }
}

/**
 * Generate initial greeting for education interview
 */
export async function generateEducationGreeting(
  participant: EducationParticipant,
  campaign: EducationCampaign,
  module: EducationModule
): Promise<string> {
  const trustFraming = TRUST_FRAMING[participant.participant_type]

  const greetingPrompts: Record<ParticipantType, string> = {
    student: `You are starting an anonymous conversation with a student at ${campaign.school.name}.

Write a warm, friendly greeting that:
1. Thanks them for taking the time
2. Explicitly states this is anonymous (teachers can't see what they say)
3. Reassures them there are no right or wrong answers
4. Explains you just want to understand what school is really like for them
5. Asks if they're ready to start

Keep it conversational and age-appropriate. Don't be too formal.
Maximum 4-5 sentences.`,

    teacher: `You are starting an anonymous conversation with a teacher at ${campaign.school.name}.

Write a professional, reassuring greeting that:
1. Thanks them for participating
2. Explicitly states this is anonymised (leadership sees patterns, not individuals)
3. Clarifies this is not an evaluation or HR tool
4. Explains you're looking for structural patterns, not individual performance
5. Asks if that frame sounds okay

Keep it professional but warm. Maximum 4-5 sentences.`,

    parent: `You are starting an anonymous conversation with a parent at ${campaign.school.name}.

Write a respectful, professional greeting that:
1. Thanks them for taking the time
2. States their responses aren't linked to their name or child
3. Clarifies you're looking for patterns, not endorsements
4. Explains this is about understanding experience, not collecting testimonials
5. Asks if that makes sense before you begin

Keep it professional and serious (not marketing-speak). Maximum 4-5 sentences.`,

    leadership: `You are starting a conversation with a school leader at ${campaign.school.name}.

Write a professional greeting that:
1. Thanks them for participating
2. Frames this as exploring how leadership intent lands across the community
3. Notes you're looking for patterns that may not be visible from their vantage point
4. Asks if they're ready to begin

Keep it collegial and respectful. Maximum 4-5 sentences.`
  }

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 512,
    system: greetingPrompts[participant.participant_type],
    messages: [
      {
        role: 'user',
        content: 'Generate the greeting message.'
      }
    ]
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}

/**
 * Initialize conversation state for a new education interview
 */
export function initializeEducationConversationState(): ConversationState {
  return {
    phase: 'opening',
    sections_completed: [],
    questions_asked: 0,
    rapport_established: false,
    anonymity_confirmed: false,
    safeguarding_flags: []
  }
}

/**
 * Check if conversation should end
 */
export function shouldEndConversation(state: ConversationState): boolean {
  return state.is_complete ||
    state.questions_asked >= 15 ||
    state.phase === 'completed'
}

/**
 * Generate closing message
 */
export async function generateClosingMessage(
  participant: EducationParticipant,
  campaign: EducationCampaign,
  conversationState: ConversationState
): Promise<string> {
  const closingPrompts: Record<ParticipantType, string> = {
    student: `Generate a warm closing message for a student interview:
- Thank them for their honesty and time
- Remind them their responses help the school understand patterns
- Reassure them again that nothing is linked to their name
- Wish them well

Keep it friendly and genuine. 2-3 sentences.`,

    teacher: `Generate a professional closing message for a teacher interview:
- Thank them for sharing their perspective
- Note that their insights will help identify structural patterns
- Remind them responses remain anonymised
- Acknowledge the time they've given

Keep it warm but professional. 2-3 sentences.`,

    parent: `Generate a respectful closing message for a parent interview:
- Thank them for their observations
- Note their perspective helps complete the picture
- Remind them responses are aggregated into patterns only
- Express appreciation

Keep it professional. 2-3 sentences.`,

    leadership: `Generate a collegial closing message for a leadership interview:
- Thank them for their candour
- Note you'll synthesise this with other perspectives
- Mention the Day 14 readout conversation
- Express appreciation

Keep it professional and forward-looking. 2-3 sentences.`
  }

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 256,
    system: closingPrompts[participant.participant_type],
    messages: [
      {
        role: 'user',
        content: 'Generate the closing message.'
      }
    ]
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}
