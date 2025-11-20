import { anthropic } from '@/lib/anthropic'
import { openai } from '@/lib/openai'
import { supabaseAdmin } from '@/lib/supabase/server'

interface ConversationState {
  phase: string
  topics_covered: string[]
  questions_asked: number
  last_interaction?: string
  is_complete?: boolean
}

interface StakeholderSession {
  id: string
  stakeholder_name: string
  stakeholder_email: string
  stakeholder_title: string
  stakeholder_role: string  // This is the field that determines which questions to ask
  campaigns: {
    id: string
    name: string
    company_name: string
    facilitator_name: string
    description?: string
    company_profiles?: {
      id: string
      company_name: string
      industry: string
      description?: string
      market_scope: 'local' | 'regional' | 'national' | 'international'
      employee_count_range?: string
      annual_revenue_range?: string
      headquarters_location?: string
    }
  }
  stakeholder_profiles?: {
    id: string
    full_name: string
    email: string
    role_type: string
    title?: string
    department?: string
  }
}

interface MessageHistory {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

/**
 * Query the knowledge base using vector similarity search
 */
async function queryKnowledgeBase(
  query: string,
  limit: number = 3
): Promise<string[]> {
  try {
    // Generate embedding for the query
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
      dimensions: 1536
    })

    const queryEmbedding = embeddingResponse.data[0].embedding

    // Search knowledge chunks using vector similarity
    const { data: chunks, error } = await (supabaseAdmin.rpc as any)(
      'match_knowledge_chunks',
      {
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: limit
      }
    )

    if (error) {
      console.error('Knowledge base query error:', error)
      return []
    }

    return chunks?.map((chunk: any) => chunk.content) || []
  } catch (error) {
    console.error('Knowledge base query error:', error)
    return []
  }
}

/**
 * Generate system prompt for the assessment agent
 */
function generateSystemPrompt(
  roleType: string,
  stakeholderSession: StakeholderSession,
  conversationState: ConversationState,
  knowledgeContext: string[]
): string {
  const knowledgeSection = knowledgeContext.length > 0
    ? `\n\nRELEVANT INDUSTRY 4.0 KNOWLEDGE:\n${knowledgeContext.join('\n\n---\n\n')}`
    : ''

  // Build company context from profile data
  const companyProfile = stakeholderSession.campaigns.company_profiles
  const companyContext = companyProfile ? `
Company Profile:
- Industry: ${companyProfile.industry}
- Market Scope: ${companyProfile.market_scope}${companyProfile.employee_count_range ? `
- Employee Count: ${companyProfile.employee_count_range}` : ''}${companyProfile.annual_revenue_range ? `
- Annual Revenue: ${companyProfile.annual_revenue_range}` : ''}${companyProfile.headquarters_location ? `
- Location: ${companyProfile.headquarters_location}` : ''}${companyProfile.description ? `
- About: ${companyProfile.description}` : ''}` : ''

  // Build stakeholder context from profile data
  const stakeholderProfile = stakeholderSession.stakeholder_profiles
  const stakeholderContext = stakeholderProfile?.department ? `
Department: ${stakeholderProfile.department}` : ''

  const basePrompt = `You are an experienced Industry 4.0 consultant conducting a stakeholder interview for ${stakeholderSession.campaigns.company_name}.

INTERVIEW CONTEXT:
Campaign: ${stakeholderSession.campaigns.name}
Stakeholder: ${stakeholderSession.stakeholder_name}
Position/Title: ${stakeholderSession.stakeholder_title}${stakeholderContext}
Role Type: ${stakeholderSession.stakeholder_role}
Facilitator: ${stakeholderSession.campaigns.facilitator_name}
${companyContext}

YOUR MISSION:
Conduct a professional, insightful interview to understand this stakeholder's perspective on digital transformation readiness, challenges, and opportunities. Your insights will contribute to a comprehensive Industry 4.0 readiness assessment.

INTERVIEW GUIDELINES:
- Be professional, friendly, and conversational
- Ask ONE clear question at a time
- Listen actively and follow up on interesting points
- Reference the stakeholder's specific role and daily responsibilities
- Draw connections between their challenges and Industry 4.0 solutions
- Use the knowledge base to inform your questions (UNS, ISA-95, MQTT, etc.)
- Aim for 10-15 substantive questions total
- When you reach question 15 or have sufficient insights, provide a warm conclusion thanking them for their time and valuable insights
- Let them know their input will be analyzed alongside other stakeholders for comprehensive recommendations

CONVERSATION STATE:
Current Phase: ${conversationState.phase || 'introduction'}
Questions Asked: ${conversationState.questions_asked || 0}/15
Topics Covered: ${conversationState.topics_covered?.join(', ') || 'none yet'}${knowledgeSection}`

  // Role-specific focus areas
  const roleFocus: Record<string, string> = {
    managing_director: `

ROLE-SPECIFIC FOCUS AREAS:
As Managing Director, explore:
1. Strategic vision for digital transformation and Industry 4.0
2. Business challenges, growth opportunities, competitive pressures
3. Investment priorities and ROI expectations for technology
4. Organizational readiness for change (culture, skills, processes)
5. Decision-making processes and data visibility needs
6. Integration between business systems (ERP) and operations (MES, SCADA)

Key concepts to reference when relevant: ISA-95 Level 4 (Business Planning), UNS as enterprise data architecture, real-time visibility for strategic decisions`,

    it_operations: `

ROLE-SPECIFIC FOCUS AREAS:
As IT Operations Manager, explore:
1. Current IT infrastructure (servers, networks, cloud, on-prem)
2. System integration challenges (ERP, MES, SCADA, databases)
3. Data silos and accessibility issues
4. Cybersecurity concerns (OT/IT convergence, network segmentation)
5. Legacy systems and modernization constraints
6. Technical skill gaps and training needs
7. MQTT, OPC UA, or other industrial protocols in use

Key concepts to reference when relevant: Unified Namespace (UNS) as data integration hub, MQTT for real-time data, ISA-95 Levels 2-3 integration, OT/IT security, edge computing`,

    production_manager: `

ROLE-SPECIFIC FOCUS AREAS:
As Production Manager, explore:
1. Production processes, workflows, and bottlenecks
2. Equipment performance, downtime, and root causes
3. Quality control processes and defect tracking
4. Material flow, inventory visibility, work-in-process
5. Shop floor data collection (manual vs. automated)
6. Real-time visibility into production status
7. Cross-shift communication and handoffs

Key concepts to reference when relevant: OEE (Overall Equipment Effectiveness), ISA-95 Level 2-3 (manufacturing operations), SCADA/MES systems, real-time production tracking via UNS`,

    purchasing_manager: `

ROLE-SPECIFIC FOCUS AREAS:
As Purchasing Manager, explore:
1. Supplier communication and collaboration processes
2. Purchase order tracking, approval workflows, delays
3. Inventory visibility and demand forecasting
4. Material availability and lead time challenges
5. Cost optimization opportunities and spending visibility
6. Integration between purchasing, planning, and production
7. Manual processes that could be automated

Key concepts to reference when relevant: ISA-95 Level 4 (supply chain management), real-time inventory via UNS, ERP-MES integration, predictive ordering`,

    planning_scheduler: `

ROLE-SPECIFIC FOCUS AREAS:
As Planning/Scheduler, explore:
1. Production scheduling processes and tools in use
2. Demand forecasting accuracy and methods
3. Resource allocation challenges (equipment, labor, materials)
4. Schedule changes, disruptions, and replanning frequency
5. Cross-department coordination (purchasing, production, maintenance)
6. Visibility into actual vs. planned production
7. Bottlenecks that impact schedule adherence

Key concepts to reference when relevant: ISA-95 Level 3 (manufacturing operations management), MES systems, real-time production status via UNS, predictive scheduling`,

    engineering_maintenance: `

ROLE-SPECIFIC FOCUS AREAS:
As Engineering/Maintenance, explore:
1. Maintenance strategies (reactive, preventive, predictive)
2. Equipment breakdown frequency, patterns, root causes
3. Spare parts inventory and procurement challenges
4. Maintenance documentation (paper-based, digital, CMMS)
5. Condition monitoring and sensor data collection
6. Equipment performance data and trending
7. Coordination between maintenance and production scheduling

Key concepts to reference when relevant: Predictive maintenance, condition monitoring sensors, ISA-95 Level 1-2 (sensing and control), MQTT for equipment data, time-series databases, digital twin concepts`
  }

  return basePrompt + (roleFocus[roleType] || '')
}

/**
 * Update conversation state based on interaction
 */
function updateConversationState(
  currentState: ConversationState,
  userMessage: string,
  assistantResponse: string
): ConversationState {
  const questionsAsked = (currentState.questions_asked || 0) + 1

  // Phase progression based on question count
  let phase = currentState.phase || 'introduction'
  let isComplete = false

  if (questionsAsked === 1) phase = 'introduction'
  else if (questionsAsked <= 4) phase = 'warm_up'
  else if (questionsAsked <= 10) phase = 'deep_dive'
  else if (questionsAsked <= 14) phase = 'synthesis'
  else if (questionsAsked >= 15) {
    phase = 'completed'
    isComplete = true
  }

  // Extract topics mentioned (simple keyword detection)
  const topics = currentState.topics_covered || []
  const keywords = [
    'MQTT', 'UNS', 'Sparkplug', 'ISA-95', 'OPC UA', 'SCADA', 'MES', 'ERP',
    'IoT', 'sensors', 'data', 'integration', 'automation', 'maintenance',
    'quality', 'inventory', 'scheduling', 'downtime', 'efficiency'
  ]

  keywords.forEach(keyword => {
    const regex = new RegExp(keyword, 'i')
    if ((regex.test(userMessage) || regex.test(assistantResponse)) && !topics.includes(keyword)) {
      topics.push(keyword)
    }
  })

  return {
    ...currentState,
    phase,
    questions_asked: questionsAsked,
    topics_covered: topics,
    last_interaction: new Date().toISOString(),
    is_complete: isComplete
  }
}

/**
 * Process a message through the assessment agent
 */
export async function processMessage(
  message: string,
  stakeholderSession: StakeholderSession,
  messageHistory: MessageHistory[],
  conversationState: ConversationState
): Promise<{ response: string; updatedState: ConversationState }> {
  // Query knowledge base for relevant context
  const knowledgeContext = await queryKnowledgeBase(
    `${message} ${stakeholderSession.stakeholder_role} ${stakeholderSession.stakeholder_title}`,
    3
  )

  // Generate system prompt
  const systemPrompt = generateSystemPrompt(
    stakeholderSession.stakeholder_role,
    stakeholderSession,
    conversationState,
    knowledgeContext
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
  // Note: Interview agent always uses Sonnet 4.5 (standard tier) - tiering applies to synthesis only
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2048,
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
    assistantResponse
  )

  return {
    response: assistantResponse,
    updatedState
  }
}

/**
 * Generate initial greeting message for the agent
 */
export async function generateGreeting(
  stakeholderSession: StakeholderSession
): Promise<string> {
  const systemPrompt = `You are an experienced Industry 4.0 consultant starting an interview with ${stakeholderSession.stakeholder_name}, ${stakeholderSession.stakeholder_title} at ${stakeholderSession.campaigns.company_name}.

This is the FIRST message in the interview. Write a warm, professional greeting that:
1. Introduces yourself briefly
2. Thanks them for participating
3. Explains the interview will take 20-30 minutes
4. Mentions you'll ask about their role, challenges, and opportunities
5. Invites them to share their perspective
6. Asks an opening question about their role

Keep it conversational and friendly. Maximum 3-4 sentences plus one opening question.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 512,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: 'Generate the greeting message.'
      }
    ]
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}
