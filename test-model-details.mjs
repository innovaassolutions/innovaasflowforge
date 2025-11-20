import Anthropic from '@anthropic-ai/sdk';
import 'dotenv/config';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

console.log('Testing model identifier variations:\n');

const models = [
  'claude-sonnet-4-20250514',
  'claude-sonnet-4-5-20250929',
  'claude-3-5-sonnet-20241022',
  'claude-sonnet-3-5-20241022'
];

for (const model of models) {
  try {
    const response = await client.messages.create({
      model,
      max_tokens: 50,
      messages: [{ role: 'user', content: 'What is your model ID?' }]
    });
    console.log(`✓ ${model}`);
    console.log(`  Response model: ${response.model}`);
    const text = response.content[0].text;
    console.log(`  Content: ${text.substring(0, 80)}...\n`);
  } catch (error) {
    console.log(`✗ ${model}`);
    console.log(`  Error: ${error.status} - ${error.message}\n`);
  }
}
