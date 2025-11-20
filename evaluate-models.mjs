import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

console.log('🎯 Evaluating Claude Models for Synthesis Use Case\n');
console.log('Use Case: Multi-dimensional analysis of stakeholder interviews');
console.log('Requirements: Deep analysis, JSON output, strategic synthesis\n');
console.log('='.repeat(70) + '\n');

// Test models that might be available
const modelsToTest = [
  { id: 'claude-opus-4-20250514', tier: 'Opus 4', expected: 'Highest capability' },
  { id: 'claude-sonnet-4-5-20250929', tier: 'Sonnet 4.5', expected: 'Balanced' },
  { id: 'claude-3-7-sonnet-20250219', tier: 'Sonnet 3.7', expected: 'Latest Sonnet' },
  { id: 'claude-3-5-haiku-20241022', tier: 'Haiku 3.5', expected: 'Fast/cheap' },
  { id: 'claude-3-opus-20240229', tier: 'Opus 3', expected: 'High capability (older)' },
];

const samplePrompt = `You are analyzing stakeholder interviews for digital transformation readiness.

DIMENSION: Analytics & Intelligence
DESCRIPTION: Data analysis, AI/ML, real-time monitoring, decision support

MATURITY LEVELS:
0 - Newcomer: Little awareness, manual processes
1 - Beginner: Initial awareness, pilot projects
2 - Intermediate: Defined processes, multi-department adoption
3 - Experienced: Integrated systems, organization-wide adoption
4 - Expert: Optimized systems, industry best practices
5 - Leader: Industry-leading, transformative innovation

STAKEHOLDER TRANSCRIPT:
STAKEHOLDER 1:
Name: John Smith
Role: Operations Manager
CONVERSATION:
USER: Tell me about your data analytics capabilities
ASSISTANT: How would you describe your current use of data for decision-making?
USER: We mostly use Excel spreadsheets. We have some basic reports but nothing real-time. We're interested in AI but haven't implemented anything yet.

YOUR TASK: Assess this dimension and output JSON with score (0-5), confidence, keyFindings, and priority.

OUTPUT FORMAT (JSON):
{
  "dimension": "Analytics & Intelligence",
  "score": <number>,
  "confidence": "<high|medium|low|insufficient>",
  "keyFindings": ["Finding 1", "Finding 2"],
  "supportingQuotes": ["Quote - Name (Role)"],
  "gapToNext": "Description",
  "priority": "<critical|important|foundational|opportunistic>"
}

Return ONLY valid JSON.`;

for (const model of modelsToTest) {
  try {
    const startTime = Date.now();

    const response = await client.messages.create({
      model: model.id,
      max_tokens: 1500,
      temperature: 0.7,
      messages: [{ role: 'user', content: samplePrompt }]
    });

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`✓ ${model.tier} (${model.id})`);
    console.log(`  Status: Available`);
    console.log(`  Response Time: ${duration}s`);
    console.log(`  Input Tokens: ${response.usage.input_tokens}`);
    console.log(`  Output Tokens: ${response.usage.output_tokens}`);

    // Try to parse JSON response
    const text = response.content[0].text;
    let jsonText = text.trim();
    if (jsonText.includes('```json')) {
      jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    }

    try {
      const parsed = JSON.parse(jsonText);
      console.log(`  JSON Parse: ✓ Valid`);
      console.log(`  Score: ${parsed.score}/5.0`);
      console.log(`  Confidence: ${parsed.confidence}`);
      console.log(`  Findings: ${parsed.keyFindings?.length || 0} items`);
    } catch (parseError) {
      console.log(`  JSON Parse: ✗ Failed`);
      console.log(`  Response Preview: ${text.substring(0, 100)}...`);
    }

    // Cost estimation (rough)
    const inputCost = response.usage.input_tokens;
    const outputCost = response.usage.output_tokens;
    console.log(`  Estimated Token Cost: ${inputCost + outputCost} tokens`);

    console.log('');

  } catch (error) {
    console.log(`✗ ${model.tier} (${model.id})`);
    console.log(`  Status: ${error.status} - ${error.message}`);
    console.log('');
  }
}

console.log('='.repeat(70));
console.log('\n📊 Analysis Context:');
console.log('- Each synthesis requires ~11 API calls (8 dimensions + summary + themes + recommendations)');
console.log('- Average input: ~2000-4000 tokens per call (transcript data)');
console.log('- Average output: ~500-1500 tokens per call');
console.log('- Total per report: ~22,000-60,000 tokens');
console.log('\n💡 Recommendation: Balance quality, speed, and cost based on your priorities');
