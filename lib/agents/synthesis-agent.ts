import Anthropic from '@anthropic-ai/sdk'
import { supabaseAdmin } from '@/lib/supabase/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

// ============================================================================
// Type Definitions
// ============================================================================

export interface DimensionalScore {
  dimension: string
  score: number // 0-5
  confidence: 'high' | 'medium' | 'low' | 'insufficient'
  keyFindings: string[]
  supportingQuotes: string[]
  gapToNext: string
  priority: 'critical' | 'important' | 'foundational' | 'opportunistic'
}

export interface PillarScore {
  pillar: string
  score: number
  dimensions: DimensionalScore[]
}

export interface ReadinessAssessment {
  overallScore: number
  pillars: PillarScore[]
  executiveSummary: string
  keyThemes: string[]
  contradictions: string[]
  recommendations: string[]
  stakeholderPerspectives: StakeholderPerspective[]
}

export interface StakeholderPerspective {
  name: string
  role: string
  title: string
  keyConcerns: string[]
  notableQuotes: string[]
}

interface SessionTranscript {
  stakeholder_name: string
  stakeholder_email: string
  stakeholder_title: string
  stakeholder_role: string
  conversation_history: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: string
  }>
  completed_at: string
}

interface CampaignInfo {
  id: string
  name: string
  company_name: string
  facilitator_name: string
  description?: string
}

// ============================================================================
// Framework Definitions
// ============================================================================

const FRAMEWORK = {
  pillars: {
    technology: {
      name: 'Technology',
      weight: 0.40,
      dimensions: [
        {
          id: 'T1',
          name: 'Digital Infrastructure',
          description: 'Automation, connectivity, IT/OT convergence, data infrastructure'
        },
        {
          id: 'T2',
          name: 'Analytics & Intelligence',
          description: 'Data analysis, AI/ML, real-time monitoring, decision support'
        },
        {
          id: 'T3',
          name: 'Cybersecurity & Resilience',
          description: 'Security posture, business continuity, system reliability'
        }
      ]
    },
    process: {
      name: 'Process',
      weight: 0.35,
      dimensions: [
        {
          id: 'P1',
          name: 'Operations Integration',
          description: 'Vertical integration, process standardization, workflow automation'
        },
        {
          id: 'P2',
          name: 'Supply Chain Integration',
          description: 'Horizontal integration, supply chain visibility, external collaboration'
        },
        {
          id: 'P3',
          name: 'Innovation & Lifecycle',
          description: 'Product innovation, lifecycle management, time-to-market'
        }
      ]
    },
    organization: {
      name: 'Organization',
      weight: 0.25,
      dimensions: [
        {
          id: 'O1',
          name: 'Talent & Culture',
          description: 'Digital skills, learning programs, leadership competency, change readiness'
        },
        {
          id: 'O2',
          name: 'Strategy & Governance',
          description: 'Transformation strategy, governance, collaboration, resource allocation'
        }
      ]
    }
  },
  maturityLevels: [
    { level: 0, name: 'Newcomer', descriptor: 'Little awareness, manual processes, no strategy' },
    { level: 1, name: 'Beginner', descriptor: 'Initial awareness, pilot projects, limited scope' },
    { level: 2, name: 'Intermediate', descriptor: 'Defined processes, multi-department adoption, emerging best practices' },
    { level: 3, name: 'Experienced', descriptor: 'Integrated systems, organization-wide adoption, measurable impact' },
    { level: 4, name: 'Expert', descriptor: 'Optimized systems, industry best practices, strong competitive advantage' },
    { level: 5, name: 'Leader', descriptor: 'Industry-leading, ecosystem influence, transformative innovation' }
  ]
}

// ============================================================================
// Database Functions
// ============================================================================

/**
 * Fetch all completed session transcripts for a campaign
 */
async function fetchCampaignTranscripts(campaignId: string): Promise<SessionTranscript[]> {
  const { data: sessions, error } = await (supabaseAdmin
    .from('stakeholder_sessions') as any)
    .select(`
      id,
      stakeholder_name,
      stakeholder_email,
      stakeholder_title,
      stakeholder_role,
      completed_at,
      agent_sessions (
        conversation_history
      )
    `)
    .eq('campaign_id', campaignId)
    .eq('status', 'completed')

  if (error) {
    console.error('Error fetching campaign transcripts:', error)
    throw new Error('Failed to fetch campaign transcripts')
  }

  // Transform the data
  return sessions.map((session: any) => ({
    stakeholder_name: session.stakeholder_name,
    stakeholder_email: session.stakeholder_email,
    stakeholder_title: session.stakeholder_title,
    stakeholder_role: session.stakeholder_role,
    conversation_history: session.agent_sessions?.[0]?.conversation_history || [],
    completed_at: session.completed_at || new Date().toISOString()
  }))
}

/**
 * Fetch campaign information
 */
async function fetchCampaignInfo(campaignId: string): Promise<CampaignInfo> {
  const { data: campaign, error } = await (supabaseAdmin
    .from('campaigns') as any)
    .select('id, name, company_name, facilitator_name, description')
    .eq('id', campaignId)
    .single()

  if (error || !campaign) {
    throw new Error('Campaign not found')
  }

  return campaign
}

// ============================================================================
// Synthesis Functions
// ============================================================================

/**
 * Generate system prompt for dimensional analysis
 */
function generateDimensionalAnalysisPrompt(
  dimension: { id: string; name: string; description: string },
  transcripts: SessionTranscript[]
): string {
  const transcriptTexts = transcripts.map((t, idx) => {
    const conversationText = t.conversation_history
      .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n\n')

    return `STAKEHOLDER ${idx + 1}:
Name: ${t.stakeholder_name}
Role: ${t.stakeholder_role}
Title: ${t.stakeholder_title}

CONVERSATION:
${conversationText}
`
  }).join('\n\n' + '='.repeat(80) + '\n\n')

  return `You are analyzing stakeholder interview transcripts to assess organizational digital transformation readiness.

DIMENSION: ${dimension.name} (${dimension.id})
DESCRIPTION: ${dimension.description}

MATURITY LEVELS (0-5):
${FRAMEWORK.maturityLevels.map(l => `${l.level} - ${l.name}: ${l.descriptor}`).join('\n')}

YOUR TASK:
Analyze the following interview transcripts and assess this specific dimension.

1. EXTRACT relevant mentions, evidence, and examples related to ${dimension.name}
2. CLASSIFY the evidence by maturity level (0-5)
3. ASSIGN a score (0-5, can use decimals like 2.5) based on preponderance of evidence
4. DETERMINE confidence level:
   - HIGH: 4+ stakeholders provided aligned evidence
   - MEDIUM: 2-3 stakeholders addressed this area
   - LOW: Only 1 stakeholder or conflicting evidence
   - INSUFFICIENT: Topic not adequately covered
5. IDENTIFY 3-5 key findings about this dimension
6. SELECT 2-4 supporting quotes (with stakeholder name/role attribution)
7. DESCRIBE the gap to next level (what would move the score up)
8. PRIORITIZE this dimension:
   - CRITICAL: High impact, foundational, strategically important
   - IMPORTANT: Significant opportunity for improvement
   - FOUNDATIONAL: Prerequisites for advanced capabilities
   - OPPORTUNISTIC: Lower priority, nice to have

STAKEHOLDER TRANSCRIPTS:
${transcriptTexts}

OUTPUT FORMAT (JSON):
{
  "dimension": "${dimension.name}",
  "score": <number 0-5>,
  "confidence": "<high|medium|low|insufficient>",
  "keyFindings": [
    "Finding 1 about current state",
    "Finding 2 about challenges",
    "Finding 3 about opportunities"
  ],
  "supportingQuotes": [
    "Quote text - Name (Role)",
    "Quote text - Name (Role)"
  ],
  "gapToNext": "Description of what's needed to reach next maturity level",
  "priority": "<critical|important|foundational|opportunistic>"
}

IMPORTANT: Return ONLY valid JSON, no additional text.`
}

/**
 * Analyze a single dimension across all transcripts
 */
async function analyzeDimension(
  dimension: { id: string; name: string; description: string },
  transcripts: SessionTranscript[]
): Promise<DimensionalScore> {
  const prompt = generateDimensionalAnalysisPrompt(dimension, transcripts)

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4000,
    temperature: 0.7,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  })

  const responseText = response.content[0].type === 'text' ? response.content[0].text : '{}'

  try {
    // Strip markdown code blocks if present
    let jsonText = responseText.trim()
    if (jsonText.includes('```json')) {
      jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    } else if (jsonText.includes('```')) {
      jsonText = jsonText.replace(/```\s*/g, '').trim()
    }

    const result = JSON.parse(jsonText)
    return result as DimensionalScore
  } catch (error) {
    console.error('Failed to parse dimensional analysis:', error)
    console.error('Response:', responseText)
    throw new Error(`Failed to parse analysis for ${dimension.name}`)
  }
}

/**
 * Generate executive summary from all insights
 */
async function generateExecutiveSummary(
  campaignInfo: CampaignInfo,
  transcripts: SessionTranscript[],
  pillars: PillarScore[]
): Promise<string> {
  const pillarSummary = pillars.map(p =>
    `${p.pillar}: ${p.score.toFixed(1)}/5.0`
  ).join(', ')

  const prompt = `You are summarizing the findings from a comprehensive digital transformation readiness assessment.

ORGANIZATION: ${campaignInfo.company_name}
CAMPAIGN: ${campaignInfo.name}
STAKEHOLDERS INTERVIEWED: ${transcripts.length}

READINESS SCORES:
${pillarSummary}

ALL DIMENSIONAL FINDINGS:
${pillars.map(pillar => {
  return `${pillar.pillar} Pillar (${pillar.score.toFixed(1)}/5.0):\n` +
    pillar.dimensions.map(d =>
      `  - ${d.dimension}: ${d.score}/5.0 [${d.confidence}]\n    Key Findings: ${d.keyFindings.join('; ')}`
    ).join('\n')
}).join('\n\n')}

Write a compelling 3-4 paragraph executive summary that:
1. Opens with overall readiness context and score
2. Highlights 2-3 key strengths
3. Identifies 2-3 critical gaps or challenges
4. Ends with strategic opportunity statement

Use professional consulting language. Be specific and evidence-based. Do not mention stakeholder names.

Return ONLY the executive summary text, no JSON or formatting.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    temperature: 0.7,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  })

  return response.content[0].type === 'text' ? response.content[0].text : ''
}

/**
 * Extract cross-cutting themes and contradictions
 */
async function extractThemesAndContradictions(
  transcripts: SessionTranscript[],
  pillars: PillarScore[]
): Promise<{ themes: string[]; contradictions: string[] }> {
  const allFindings = pillars.flatMap(p =>
    p.dimensions.flatMap(d => d.keyFindings)
  )

  const prompt = `Analyze the following findings from a multi-stakeholder digital transformation assessment:

FINDINGS:
${allFindings.map((f, idx) => `${idx + 1}. ${f}`).join('\n')}

Identify:
1. THEMES: 3-5 recurring patterns or common threads across stakeholders
2. CONTRADICTIONS: 2-3 areas where stakeholder perspectives conflict or show gaps

OUTPUT FORMAT (JSON):
{
  "themes": [
    "Theme 1: Description",
    "Theme 2: Description"
  ],
  "contradictions": [
    "Contradiction 1: Description",
    "Contradiction 2: Description"
  ]
}

Return ONLY valid JSON, no additional text.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    temperature: 0.7,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  })

  const responseText = response.content[0].type === 'text' ? response.content[0].text : '{}'

  try {
    // Strip markdown code blocks if present
    let jsonText = responseText.trim()
    if (jsonText.includes('```json')) {
      jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    } else if (jsonText.includes('```')) {
      jsonText = jsonText.replace(/```\s*/g, '').trim()
    }

    const result = JSON.parse(jsonText)
    return {
      themes: result.themes || [],
      contradictions: result.contradictions || []
    }
  } catch (error) {
    console.error('Failed to parse themes and contradictions:', error)
    return { themes: [], contradictions: [] }
  }
}

/**
 * Generate prioritized recommendations
 */
async function generateRecommendations(pillars: PillarScore[]): Promise<string[]> {
  // Get critical and important priorities
  const criticalDimensions = pillars.flatMap(p =>
    p.dimensions.filter(d => d.priority === 'critical')
  )

  const importantDimensions = pillars.flatMap(p =>
    p.dimensions.filter(d => d.priority === 'important')
  )

  const priorityDimensions = [...criticalDimensions, ...importantDimensions].slice(0, 5)

  const prompt = `Based on the following priority dimensions from a digital readiness assessment, generate 3-5 actionable strategic recommendations.

PRIORITY DIMENSIONS:
${priorityDimensions.map(d => `
${d.dimension} (Score: ${d.score}/5.0, Priority: ${d.priority})
- Key Findings: ${d.keyFindings.join('; ')}
- Gap to Next: ${d.gapToNext}
`).join('\n')}

Generate recommendations that are:
1. Specific and actionable
2. Prioritized by impact and feasibility
3. Strategic (not just tactical fixes)
4. Interconnected (showing how improvements build on each other)

OUTPUT FORMAT (JSON):
{
  "recommendations": [
    "Recommendation 1 text",
    "Recommendation 2 text"
  ]
}

Return ONLY valid JSON, no additional text.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    temperature: 0.7,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  })

  const responseText = response.content[0].type === 'text' ? response.content[0].text : '{}'

  try {
    // Strip markdown code blocks if present
    let jsonText = responseText.trim()
    if (jsonText.includes('```json')) {
      jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
    } else if (jsonText.includes('```')) {
      jsonText = jsonText.replace(/```\s*/g, '').trim()
    }

    const result = JSON.parse(jsonText)
    return result.recommendations || []
  } catch (error) {
    console.error('Failed to parse recommendations:', error)
    return []
  }
}

/**
 * Extract stakeholder perspectives
 */
function extractStakeholderPerspectives(transcripts: SessionTranscript[]): StakeholderPerspective[] {
  return transcripts.map(transcript => {
    // Extract user messages as concerns
    const userMessages = transcript.conversation_history
      .filter(msg => msg.role === 'user')
      .map(msg => msg.content)

    // Simple extraction of key phrases (first sentence of longer responses)
    const keyConcerns = userMessages
      .filter(msg => msg.length > 50)
      .slice(0, 3)
      .map(msg => {
        const firstSentence = msg.split(/[.!?]/)[0]
        return firstSentence.length > 100
          ? firstSentence.substring(0, 97) + '...'
          : firstSentence
      })

    // Extract notable quotes (longer, substantive responses)
    const notableQuotes = userMessages
      .filter(msg => msg.length > 100 && msg.length < 500)
      .slice(0, 2)

    return {
      name: transcript.stakeholder_name,
      role: transcript.stakeholder_role,
      title: transcript.stakeholder_title,
      keyConcerns,
      notableQuotes
    }
  })
}

// ============================================================================
// Main Synthesis Function
// ============================================================================

/**
 * Synthesize all campaign data into a comprehensive readiness assessment
 */
export async function synthesizeCampaign(campaignId: string): Promise<ReadinessAssessment> {
  console.log(`Starting synthesis for campaign ${campaignId}`)

  // Fetch campaign data
  const [campaignInfo, transcripts] = await Promise.all([
    fetchCampaignInfo(campaignId),
    fetchCampaignTranscripts(campaignId)
  ])

  console.log(`Analyzing ${transcripts.length} stakeholder transcripts`)

  if (transcripts.length === 0) {
    throw new Error('No completed interviews found for this campaign')
  }

  // Analyze all dimensions across all three pillars
  const pillars: PillarScore[] = []

  for (const [pillarKey, pillarData] of Object.entries(FRAMEWORK.pillars)) {
    console.log(`Analyzing ${pillarData.name} pillar...`)

    const dimensionScores: DimensionalScore[] = []

    for (const dimension of pillarData.dimensions) {
      console.log(`  - Analyzing dimension: ${dimension.name}`)
      const score = await analyzeDimension(dimension, transcripts)
      dimensionScores.push(score)
    }

    // Calculate pillar score as average of dimensions
    const pillarScore = dimensionScores.reduce((sum, d) => sum + d.score, 0) / dimensionScores.length

    pillars.push({
      pillar: pillarData.name,
      score: pillarScore,
      dimensions: dimensionScores
    })
  }

  // Calculate overall readiness score (weighted average)
  const overallScore = Object.entries(FRAMEWORK.pillars).reduce((sum, [key, pillarData], idx) => {
    return sum + (pillars[idx].score * pillarData.weight)
  }, 0)

  console.log('Generating executive summary...')
  const executiveSummary = await generateExecutiveSummary(campaignInfo, transcripts, pillars)

  console.log('Extracting themes and contradictions...')
  const { themes, contradictions } = await extractThemesAndContradictions(transcripts, pillars)

  console.log('Generating recommendations...')
  const recommendations = await generateRecommendations(pillars)

  console.log('Extracting stakeholder perspectives...')
  const stakeholderPerspectives = extractStakeholderPerspectives(transcripts)

  console.log('Synthesis complete!')

  return {
    overallScore,
    pillars,
    executiveSummary,
    keyThemes: themes,
    contradictions,
    recommendations,
    stakeholderPerspectives
  }
}
