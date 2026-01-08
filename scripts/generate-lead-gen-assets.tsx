/**
 * Generate Lead Gen PDF Assets using Google Gemini
 *
 * Creates branded PDF assets for LinkedIn hand-raiser campaigns:
 * 1. Discovery Question Bank
 * 2. Pre-Engagement Checklist
 * 3. Methodology Cheat Sheet
 * 4. Email Templates
 *
 * Run with: npx tsx scripts/generate-lead-gen-assets.ts [asset-name]
 * Examples:
 *   npx tsx scripts/generate-lead-gen-assets.ts questions
 *   npx tsx scripts/generate-lead-gen-assets.ts checklist
 *   npx tsx scripts/generate-lead-gen-assets.ts methodology
 *   npx tsx scripts/generate-lead-gen-assets.ts emails
 *   npx tsx scripts/generate-lead-gen-assets.ts all
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import React from 'react'
import ReactPDF, { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer'
import * as fs from 'fs'
import * as path from 'path'
import * as dotenv from 'dotenv'

// Load .env.local
dotenv.config({ path: '.env.local' })

// ============================================================================
// Configuration
// ============================================================================

const API_KEY = process.env.GOOGLE_AI_STUDIO || process.env.GOOGLE_GEMINI_API_KEY
const MODEL_NAME = 'gemini-3-pro-image-preview' // Using stable model; change to gemini-3-pro-preview when available

if (!API_KEY) {
  console.error('No Google AI API key found. Set GOOGLE_AI_STUDIO in .env.local')
  process.exit(1)
}

const genAI = new GoogleGenerativeAI(API_KEY)

// Pearl Vibrant Theme Colors
const COLORS = {
  accent: '#F25C05',
  accentHover: '#DC5204',
  accentSubtle: '#FEF5EE',
  teal: '#1D9BA3',
  text: '#171614',
  textMuted: '#71706B',
  bg: '#FFFEFB',
  bgSubtle: '#FAF8F3',
  bgMuted: '#F2EFE7',
  border: '#E6E2D6',
  success: '#16A34A',
  white: '#FFFFFF',
}

// Output directory
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'lead-gen-assets')

// ============================================================================
// PDF Styles
// ============================================================================

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: COLORS.bg,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 15,
    borderBottom: `2px solid ${COLORS.accent}`,
  },
  logo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  logoAccent: {
    color: COLORS.accent,
  },
  headerRight: {
    fontSize: 8,
    color: COLORS.textMuted,
  },
  // Title
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 30,
  },
  // Sections
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginTop: 25,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottom: `1px solid ${COLORS.border}`,
  },
  subsectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 15,
    marginBottom: 8,
  },
  // Content
  paragraph: {
    fontSize: 10,
    lineHeight: 1.6,
    color: COLORS.text,
    marginBottom: 10,
  },
  // Lists
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingLeft: 5,
  },
  bullet: {
    width: 15,
    fontSize: 10,
    color: COLORS.accent,
  },
  listText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.5,
    color: COLORS.text,
  },
  // Numbered lists
  numberedItem: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingLeft: 5,
  },
  number: {
    width: 20,
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  // Cards/Boxes
  card: {
    backgroundColor: COLORS.bgSubtle,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderLeft: `3px solid ${COLORS.accent}`,
  },
  cardTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 9,
    lineHeight: 1.5,
    color: COLORS.textMuted,
  },
  // Checkbox items
  checkboxItem: {
    flexDirection: 'row',
    marginBottom: 10,
    paddingLeft: 5,
  },
  checkbox: {
    width: 14,
    height: 14,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 10,
    backgroundColor: COLORS.white,
  },
  checkboxText: {
    flex: 1,
    fontSize: 10,
    lineHeight: 1.4,
    color: COLORS.text,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: `1px solid ${COLORS.border}`,
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: COLORS.textMuted,
  },
  footerLink: {
    fontSize: 8,
    color: COLORS.accent,
  },
  // CTA Box
  ctaBox: {
    backgroundColor: COLORS.accentSubtle,
    borderRadius: 8,
    padding: 20,
    marginTop: 30,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginBottom: 8,
  },
  ctaText: {
    fontSize: 10,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  // Table
  table: {
    marginTop: 10,
    marginBottom: 15,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgMuted,
    padding: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: `1px solid ${COLORS.border}`,
  },
  tableCell: {
    flex: 1,
    fontSize: 9,
    color: COLORS.text,
  },
  // Methodology specific
  methodologyCard: {
    backgroundColor: COLORS.bgSubtle,
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
  },
  methodologyName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginBottom: 6,
  },
  methodologyBest: {
    fontSize: 9,
    color: COLORS.teal,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  methodologyDesc: {
    fontSize: 9,
    color: COLORS.textMuted,
    lineHeight: 1.4,
  },
  // Email template specific
  emailBlock: {
    backgroundColor: COLORS.bgSubtle,
    borderRadius: 4,
    padding: 12,
    marginBottom: 15,
    fontFamily: 'Courier',
  },
  emailSubject: {
    fontSize: 9,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
    fontFamily: 'Helvetica',
  },
  emailBody: {
    fontSize: 8,
    lineHeight: 1.5,
    color: COLORS.text,
  },
})

// ============================================================================
// PDF Components
// ============================================================================

interface HeaderProps {
  pageNum?: number
}

const Header = ({ pageNum }: HeaderProps) => (
  <View style={styles.header}>
    <Text style={styles.logo}>
      Flow<Text style={styles.logoAccent}>Forge</Text>
    </Text>
    <Text style={styles.headerRight}>
      {pageNum ? `Page ${pageNum}` : 'Free Resource'}
    </Text>
  </View>
)

const Footer = () => (
  <View style={styles.footer}>
    <Text style={styles.footerText}>
      flowforge.ai | Free Resource for Consultants
    </Text>
    <Text style={styles.footerLink}>
      Automate your discovery process
    </Text>
  </View>
)

const CTABox = () => (
  <View style={styles.ctaBox}>
    <Text style={styles.ctaTitle}>Want to automate this?</Text>
    <Text style={styles.ctaText}>
      FlowForge uses AI to conduct stakeholder interviews and synthesize findings automatically.
    </Text>
    <Text style={styles.footerLink}>Learn more at flowforge.ai</Text>
  </View>
)

// ============================================================================
// Content Generation with Gemini
// ============================================================================

interface QuestionCategory {
  category: string
  methodology: string
  questions: string[]
}

interface ChecklistSection {
  section: string
  items: string[]
}

interface MethodologyInfo {
  name: string
  bestFor: string
  keyPrinciple: string
  discoveryFocus: string
  sampleQuestions: string[]
}

interface EmailTemplate {
  name: string
  purpose: string
  subject: string
  body: string
}

async function generateQuestionBank(): Promise<QuestionCategory[]> {
  console.log('  Generating question bank content with Gemini...')

  const model = genAI.getGenerativeModel({ model: MODEL_NAME })

  const prompt = `You are an expert management consultant. Generate a comprehensive discovery question bank.

Create 50+ stakeholder interview questions organized by consulting methodology.

Return ONLY valid JSON (no markdown) in this exact format:
[
  {
    "category": "Strategic Assessment",
    "methodology": "General",
    "questions": ["Question 1?", "Question 2?", ...]
  },
  {
    "category": "Process Analysis",
    "methodology": "Lean/Six Sigma",
    "questions": ["Question 1?", "Question 2?", ...]
  }
]

Include these categories:
1. Strategic Assessment (General) - 8 questions
2. Process Analysis (Lean/Six Sigma) - 8 questions
3. Bottleneck Identification (Theory of Constraints) - 8 questions
4. Change Readiness (ADKAR/Kotter) - 8 questions
5. Digital Maturity (Industry 4.0) - 8 questions
6. Organizational Health (Culture/Leadership) - 8 questions
7. Customer Value (Jobs to be Done) - 6 questions

Make questions open-ended, insightful, and designed to uncover real issues.`

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  // Clean JSON from potential markdown wrapping
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('Failed to parse question bank JSON')

  return JSON.parse(jsonMatch[0])
}

async function generateChecklist(): Promise<ChecklistSection[]> {
  console.log('  Generating checklist content with Gemini...')

  const model = genAI.getGenerativeModel({ model: MODEL_NAME })

  const prompt = `You are an expert management consultant. Generate a pre-engagement discovery checklist.

This checklist helps consultants verify everything is in place BEFORE starting stakeholder interviews.

Return ONLY valid JSON (no markdown) in this exact format:
[
  {
    "section": "Section Name",
    "items": ["Checklist item 1", "Checklist item 2", ...]
  }
]

Include these sections with 4-6 items each:
1. Executive Sponsorship - Verify leadership commitment
2. Scope & Boundaries - Confirm what's in/out of scope
3. Stakeholder Access - Ensure you can reach key people
4. Data & Documentation - Request needed materials
5. Political Landscape - Understand sensitivities
6. Timeline & Logistics - Confirm practical details
7. Success Criteria - Define what "done" looks like

Make items specific and actionable.`

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('Failed to parse checklist JSON')

  return JSON.parse(jsonMatch[0])
}

async function generateMethodologyCheatSheet(): Promise<MethodologyInfo[]> {
  console.log('  Generating methodology cheat sheet with Gemini...')

  const model = genAI.getGenerativeModel({ model: MODEL_NAME })

  const prompt = `You are an expert management consultant. Create a methodology selection cheat sheet.

Help consultants choose the right discovery methodology based on client symptoms.

Return ONLY valid JSON (no markdown) in this exact format:
[
  {
    "name": "Methodology Name",
    "bestFor": "When to use this (client symptoms)",
    "keyPrinciple": "Core concept in one sentence",
    "discoveryFocus": "What to look for during discovery",
    "sampleQuestions": ["Question 1?", "Question 2?", "Question 3?"]
  }
]

Include these methodologies:
1. Lean (waste elimination, efficiency)
2. Six Sigma (quality, variation reduction)
3. Theory of Constraints (bottlenecks, throughput)
4. ADKAR (change management, adoption)
5. Balanced Scorecard (strategy execution, metrics)
6. Value Stream Mapping (end-to-end flow, handoffs)
7. Jobs to be Done (customer needs, innovation)

Make "bestFor" describe observable client symptoms that signal this methodology.`

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('Failed to parse methodology JSON')

  return JSON.parse(jsonMatch[0])
}

async function generateEmailTemplates(): Promise<EmailTemplate[]> {
  console.log('  Generating email templates with Gemini...')

  const model = genAI.getGenerativeModel({ model: MODEL_NAME })

  const prompt = `You are an expert management consultant. Create stakeholder interview email templates.

These are the 5 emails consultants send during discovery phase.

Return ONLY valid JSON (no markdown) in this exact format:
[
  {
    "name": "Template Name",
    "purpose": "When to use this email",
    "subject": "Email subject line",
    "body": "Full email body with [PLACEHOLDERS] for customization"
  }
]

Create these 5 templates:
1. Initial Introduction & Scheduling - First outreach to schedule interview
2. Pre-Interview Prep - Send 2 days before with what to expect
3. Day-Of Reminder - Morning of interview reminder
4. Thank You & Follow-Up - Post-interview appreciation
5. Summary Share-Back - Share key themes for validation

Use [STAKEHOLDER_NAME], [DATE], [TIME], [PROJECT_NAME], [YOUR_NAME] as placeholders.
Keep emails professional but warm. 150-250 words each.`

  const result = await model.generateContent(prompt)
  const text = result.response.text()

  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('Failed to parse email templates JSON')

  return JSON.parse(jsonMatch[0])
}

// ============================================================================
// PDF Document Components
// ============================================================================

const QuestionBankPDF = ({ data }: { data: QuestionCategory[] }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Header />
      <Text style={styles.title}>Discovery Question Bank</Text>
      <Text style={styles.subtitle}>
        50+ stakeholder interview questions organized by methodology
      </Text>

      {data.slice(0, 3).map((category, idx) => (
        <View key={idx}>
          <Text style={styles.sectionTitle}>
            {category.category} ({category.methodology})
          </Text>
          {category.questions.map((q, qIdx) => (
            <View key={qIdx} style={styles.numberedItem}>
              <Text style={styles.number}>{qIdx + 1}.</Text>
              <Text style={styles.listText}>{q}</Text>
            </View>
          ))}
        </View>
      ))}

      <Footer />
    </Page>

    <Page size="A4" style={styles.page}>
      <Header pageNum={2} />

      {data.slice(3, 5).map((category, idx) => (
        <View key={idx}>
          <Text style={styles.sectionTitle}>
            {category.category} ({category.methodology})
          </Text>
          {category.questions.map((q, qIdx) => (
            <View key={qIdx} style={styles.numberedItem}>
              <Text style={styles.number}>{qIdx + 1}.</Text>
              <Text style={styles.listText}>{q}</Text>
            </View>
          ))}
        </View>
      ))}

      <Footer />
    </Page>

    <Page size="A4" style={styles.page}>
      <Header pageNum={3} />

      {data.slice(5).map((category, idx) => (
        <View key={idx}>
          <Text style={styles.sectionTitle}>
            {category.category} ({category.methodology})
          </Text>
          {category.questions.map((q, qIdx) => (
            <View key={qIdx} style={styles.numberedItem}>
              <Text style={styles.number}>{qIdx + 1}.</Text>
              <Text style={styles.listText}>{q}</Text>
            </View>
          ))}
        </View>
      ))}

      <CTABox />
      <Footer />
    </Page>
  </Document>
)

const ChecklistPDF = ({ data }: { data: ChecklistSection[] }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Header />
      <Text style={styles.title}>Pre-Engagement Checklist</Text>
      <Text style={styles.subtitle}>
        Verify everything is in place before your first stakeholder interview
      </Text>

      {data.slice(0, 4).map((section, idx) => (
        <View key={idx}>
          <Text style={styles.sectionTitle}>{section.section}</Text>
          {section.items.map((item, iIdx) => (
            <View key={iIdx} style={styles.checkboxItem}>
              <View style={styles.checkbox} />
              <Text style={styles.checkboxText}>{item}</Text>
            </View>
          ))}
        </View>
      ))}

      <Footer />
    </Page>

    <Page size="A4" style={styles.page}>
      <Header pageNum={2} />

      {data.slice(4).map((section, idx) => (
        <View key={idx}>
          <Text style={styles.sectionTitle}>{section.section}</Text>
          {section.items.map((item, iIdx) => (
            <View key={iIdx} style={styles.checkboxItem}>
              <View style={styles.checkbox} />
              <Text style={styles.checkboxText}>{item}</Text>
            </View>
          ))}
        </View>
      ))}

      <CTABox />
      <Footer />
    </Page>
  </Document>
)

const MethodologyPDF = ({ data }: { data: MethodologyInfo[] }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Header />
      <Text style={styles.title}>Methodology Selection Guide</Text>
      <Text style={styles.subtitle}>
        Choose the right discovery approach based on client symptoms
      </Text>

      {data.slice(0, 3).map((method, idx) => (
        <View key={idx} style={styles.methodologyCard}>
          <Text style={styles.methodologyName}>{method.name}</Text>
          <Text style={styles.methodologyBest}>Best for: {method.bestFor}</Text>
          <Text style={styles.methodologyDesc}>
            Key Principle: {method.keyPrinciple}
          </Text>
          <Text style={styles.methodologyDesc}>
            Discovery Focus: {method.discoveryFocus}
          </Text>
          <Text style={[styles.methodologyDesc, { marginTop: 6 }]}>
            Sample Questions:
          </Text>
          {method.sampleQuestions.map((q, qIdx) => (
            <View key={qIdx} style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={[styles.listText, { fontSize: 8 }]}>{q}</Text>
            </View>
          ))}
        </View>
      ))}

      <Footer />
    </Page>

    <Page size="A4" style={styles.page}>
      <Header pageNum={2} />

      {data.slice(3).map((method, idx) => (
        <View key={idx} style={styles.methodologyCard}>
          <Text style={styles.methodologyName}>{method.name}</Text>
          <Text style={styles.methodologyBest}>Best for: {method.bestFor}</Text>
          <Text style={styles.methodologyDesc}>
            Key Principle: {method.keyPrinciple}
          </Text>
          <Text style={styles.methodologyDesc}>
            Discovery Focus: {method.discoveryFocus}
          </Text>
          <Text style={[styles.methodologyDesc, { marginTop: 6 }]}>
            Sample Questions:
          </Text>
          {method.sampleQuestions.map((q, qIdx) => (
            <View key={qIdx} style={styles.listItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={[styles.listText, { fontSize: 8 }]}>{q}</Text>
            </View>
          ))}
        </View>
      ))}

      <CTABox />
      <Footer />
    </Page>
  </Document>
)

const EmailTemplatesPDF = ({ data }: { data: EmailTemplate[] }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Header />
      <Text style={styles.title}>Stakeholder Interview Emails</Text>
      <Text style={styles.subtitle}>
        5 ready-to-use email templates for your discovery process
      </Text>

      {data.slice(0, 2).map((template, idx) => (
        <View key={idx}>
          <Text style={styles.sectionTitle}>{template.name}</Text>
          <Text style={styles.paragraph}>{template.purpose}</Text>
          <View style={styles.emailBlock}>
            <Text style={styles.emailSubject}>Subject: {template.subject}</Text>
            <Text style={styles.emailBody}>{template.body}</Text>
          </View>
        </View>
      ))}

      <Footer />
    </Page>

    <Page size="A4" style={styles.page}>
      <Header pageNum={2} />

      {data.slice(2, 4).map((template, idx) => (
        <View key={idx}>
          <Text style={styles.sectionTitle}>{template.name}</Text>
          <Text style={styles.paragraph}>{template.purpose}</Text>
          <View style={styles.emailBlock}>
            <Text style={styles.emailSubject}>Subject: {template.subject}</Text>
            <Text style={styles.emailBody}>{template.body}</Text>
          </View>
        </View>
      ))}

      <Footer />
    </Page>

    <Page size="A4" style={styles.page}>
      <Header pageNum={3} />

      {data.slice(4).map((template, idx) => (
        <View key={idx}>
          <Text style={styles.sectionTitle}>{template.name}</Text>
          <Text style={styles.paragraph}>{template.purpose}</Text>
          <View style={styles.emailBlock}>
            <Text style={styles.emailSubject}>Subject: {template.subject}</Text>
            <Text style={styles.emailBody}>{template.body}</Text>
          </View>
        </View>
      ))}

      <CTABox />
      <Footer />
    </Page>
  </Document>
)

// ============================================================================
// PDF Generation
// ============================================================================

async function generatePDF(
  component: React.ReactElement,
  filename: string
): Promise<string> {
  const outputPath = path.join(OUTPUT_DIR, filename)
  await ReactPDF.render(component, outputPath)
  return outputPath
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const args = process.argv.slice(2)
  const assetType = args[0] || 'all'

  console.log('='.repeat(60))
  console.log('FlowForge Lead Gen Asset Generator')
  console.log('='.repeat(60))
  console.log(`Using model: ${MODEL_NAME}`)
  console.log(`Output directory: ${OUTPUT_DIR}`)
  console.log('')

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
    console.log('Created output directory')
  }

  const assets: string[] = []

  try {
    // Generate Question Bank
    if (assetType === 'all' || assetType === 'questions') {
      console.log('\n1. Discovery Question Bank')
      const questionData = await generateQuestionBank()
      console.log(`   Generated ${questionData.reduce((sum, c) => sum + c.questions.length, 0)} questions`)
      const qPath = await generatePDF(
        React.createElement(QuestionBankPDF, { data: questionData }),
        'discovery-question-bank.pdf'
      )
      assets.push(qPath)
      console.log(`   Saved: ${qPath}`)
    }

    // Generate Checklist
    if (assetType === 'all' || assetType === 'checklist') {
      console.log('\n2. Pre-Engagement Checklist')
      const checklistData = await generateChecklist()
      console.log(`   Generated ${checklistData.reduce((sum, s) => sum + s.items.length, 0)} items`)
      const cPath = await generatePDF(
        React.createElement(ChecklistPDF, { data: checklistData }),
        'pre-engagement-checklist.pdf'
      )
      assets.push(cPath)
      console.log(`   Saved: ${cPath}`)
    }

    // Generate Methodology Cheat Sheet
    if (assetType === 'all' || assetType === 'methodology') {
      console.log('\n3. Methodology Cheat Sheet')
      const methodologyData = await generateMethodologyCheatSheet()
      console.log(`   Generated ${methodologyData.length} methodologies`)
      const mPath = await generatePDF(
        React.createElement(MethodologyPDF, { data: methodologyData }),
        'methodology-selection-guide.pdf'
      )
      assets.push(mPath)
      console.log(`   Saved: ${mPath}`)
    }

    // Generate Email Templates
    if (assetType === 'all' || assetType === 'emails') {
      console.log('\n4. Email Templates')
      const emailData = await generateEmailTemplates()
      console.log(`   Generated ${emailData.length} templates`)
      const ePath = await generatePDF(
        React.createElement(EmailTemplatesPDF, { data: emailData }),
        'stakeholder-email-templates.pdf'
      )
      assets.push(ePath)
      console.log(`   Saved: ${ePath}`)
    }

    console.log('\n' + '='.repeat(60))
    console.log('Generation complete!')
    console.log('')
    console.log('Files created:')
    assets.forEach(a => console.log(`  - ${a}`))
    console.log('')
    console.log('Next steps:')
    console.log('  1. Review PDFs in public/lead-gen-assets/')
    console.log('  2. Upload to your email capture system')
    console.log('  3. Post hand-raisers on LinkedIn')
    console.log('='.repeat(60))

  } catch (error) {
    console.error('\nError generating assets:', error)
    process.exit(1)
  }
}

main()
