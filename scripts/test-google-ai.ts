/**
 * Generate FlowForge logos using Google AI Studio API
 *
 * Concept: FlowForge unlocks organizational "Flow" -
 * revealing new value, opportunities, revenue, and cultural alignment.
 *
 * Run with: npx tsx scripts/test-google-ai.ts
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
import 'dotenv/config';

const API_KEY = process.env.GOOGLE_AI_STUDIO || process.env.GOOGLE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('No Google AI API key found in environment variables');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

// Design System Colors (Pearl Vibrant Theme)
const COLORS = {
  accent: '#F25C05',      // Primary orange - energy, transformation
  accentHover: '#DC5204', // Darker orange
  teal: '#1D9BA3',        // Secondary teal - trust, clarity
  tealDark: '#14737A',    // Darker teal
  text: '#171614',        // Primary text
  textMuted: '#71706B',   // Secondary text
  bg: '#FFFEFB',          // Background
  bgSubtle: '#FAF8F3',    // Card background
};

function cleanSVG(text: string): string {
  // Remove markdown code blocks
  let cleaned = text.replace(/^```(?:svg|xml)?\n?/gm, '').replace(/```$/gm, '').trim();
  // Ensure it starts with <svg
  const svgStart = cleaned.indexOf('<svg');
  if (svgStart > 0) {
    cleaned = cleaned.slice(svgStart);
  }
  // Ensure it ends with </svg>
  const svgEnd = cleaned.lastIndexOf('</svg>');
  if (svgEnd > 0) {
    cleaned = cleaned.slice(0, svgEnd + 6);
  }
  return cleaned;
}

async function generateSVGLogo() {
  console.log('\n🎨 Generating FlowForge Logo (Icon + Wordmark)...\n');

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `You are a world-class logo designer. Create a stunning SVG logo for "FlowForge".

BRAND STORY:
FlowForge helps organizations unlock their "Flow" - revealing hidden value, new revenue opportunities,
cultural alignment, and enhanced organizational potential. Like a key opening a lock, or water breaking
through a dam, FlowForge transforms stagnant organizations into flowing, thriving ecosystems.

VISUAL CONCEPT - "Unlocking Flow":
The icon should communicate the idea of OPENING or UNLOCKING flow. Consider:
- An abstract "F" that looks like a flowing stream being released/unlocked
- Two shapes separating to reveal flowing energy between them
- A geometric key-like form with flowing curves
- Arrows or paths that diverge and flow outward
- The moment of breakthrough - constraint becoming freedom

DESIGN REQUIREMENTS:
1. Icon + Wordmark combination
2. Icon: Abstract geometric symbol representing "unlocking flow"
   - Should suggest opening, releasing, or breakthrough
   - Incorporate flowing curves with geometric structure
   - Must work at 32px (recognizable)
3. Colors (use as gradients or solid):
   - Primary: ${COLORS.accent} (Orange - energy, transformation)
   - Secondary: ${COLORS.teal} (Teal - trust, clarity)
4. Wordmark: "FlowForge" in modern, medium-weight sans-serif
   - Text color: ${COLORS.text}
5. ViewBox: 300x80
6. Style: Premium, tech-forward, optimistic

OUTPUT: Return ONLY raw SVG code. No markdown, no explanation. Start with <svg and end with </svg>.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const rawText = response.text();
    const svgCode = cleanSVG(rawText);

    console.log('Generated SVG:\n');
    console.log(svgCode);

    const outputPath = path.join(process.cwd(), 'public', 'generated-logo.svg');
    fs.writeFileSync(outputPath, svgCode);
    console.log(`\n✅ Logo saved to: ${outputPath}`);

    return svgCode;
  } catch (error) {
    console.error('Error generating logo:', error);
    throw error;
  }
}

async function generateIconOnlySVG() {
  console.log('\n🔷 Generating FlowForge Icon Mark...\n');

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

  const prompt = `You are an expert icon designer. Create a memorable icon mark for "FlowForge".

CONCEPT - "Unlocking Flow":
FlowForge reveals an organization's hidden potential by unlocking flow - new value, opportunities,
and alignment. The icon should visually represent this "unlocking" or "opening" of flow.

VISUAL DIRECTION (choose the strongest approach):
1. "Diverging Paths" - Two shapes that were together, now separating with flowing energy between them
2. "Flow Release" - An abstract "F" or lock-like shape with flowing curves streaming outward
3. "Breakthrough Moment" - Geometric constraint with organic flow breaking through
4. "Key to Flow" - Abstract key form with flowing water/energy elements
5. "Opening Gate" - Two geometric forms parting to reveal dynamic movement

TECHNICAL SPECS:
- ViewBox: 64x64 (square)
- NO text - icon only
- Primary color: ${COLORS.accent} (Orange)
- Secondary color: ${COLORS.teal} (Teal)
- Use gradient: from orange to teal for depth
- Must be crisp at 16x16 (favicon) and beautiful at 64x64
- Clean bezier curves, geometric foundations
- Balanced negative space

OUTPUT: Return ONLY raw SVG code. No markdown, no explanation. Start with <svg and end with </svg>.`;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const rawText = response.text();
    const svgCode = cleanSVG(rawText);

    console.log('Generated Icon SVG:\n');
    console.log(svgCode);

    const outputPath = path.join(process.cwd(), 'public', 'generated-icon.svg');
    fs.writeFileSync(outputPath, svgCode);
    console.log(`\n✅ Icon saved to: ${outputPath}`);

    return svgCode;
  } catch (error) {
    console.error('Error generating icon:', error);
    throw error;
  }
}

function generatePreviewHTML(logoSVG: string, iconSVG: string) {
  console.log('\n📄 Generating Preview HTML...\n');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>FlowForge Logo Preview</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: ${COLORS.bg};
      --bg-subtle: ${COLORS.bgSubtle};
      --text: ${COLORS.text};
      --text-muted: ${COLORS.textMuted};
      --accent: ${COLORS.accent};
      --teal: ${COLORS.teal};
      --border: #E6E2D6;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      padding: 40px;
    }

    .container {
      max-width: 1000px;
      margin: 0 auto;
    }

    h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .subtitle {
      color: var(--text-muted);
      font-size: 16px;
      margin-bottom: 40px;
    }

    .concept-box {
      background: linear-gradient(135deg, rgba(242, 92, 5, 0.08), rgba(29, 155, 163, 0.08));
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 40px;
    }

    .concept-box h2 {
      font-size: 18px;
      font-weight: 600;
      color: var(--accent);
      margin-bottom: 12px;
    }

    .concept-box p {
      color: var(--text-muted);
      line-height: 1.6;
    }

    .section {
      margin-bottom: 48px;
    }

    .section-title {
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 20px;
    }

    .preview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 24px;
    }

    .preview-card {
      background: var(--bg-subtle);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 32px;
      text-align: center;
      transition: all 0.2s;
    }

    .preview-card:hover {
      border-color: var(--accent);
      box-shadow: 0 4px 12px rgba(242, 92, 5, 0.1);
    }

    .preview-card.dark {
      background: var(--text);
    }

    .preview-card h3 {
      font-size: 14px;
      font-weight: 500;
      color: var(--text-muted);
      margin-bottom: 20px;
    }

    .preview-card.dark h3 {
      color: #9ca3af;
    }

    .logo-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100px;
    }

    .logo-container svg {
      max-width: 100%;
      height: auto;
    }

    .icon-sizes {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 24px;
    }

    .icon-size {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .icon-size span {
      font-size: 12px;
      color: var(--text-muted);
    }

    .color-swatches {
      display: flex;
      gap: 16px;
      justify-content: center;
      margin-top: 32px;
    }

    .swatch {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }

    .swatch-color {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      border: 1px solid var(--border);
    }

    .swatch-label {
      font-size: 12px;
      color: var(--text-muted);
    }

    .swatch-hex {
      font-size: 11px;
      font-family: monospace;
      color: var(--text);
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>FlowForge Logo System</h1>
    <p class="subtitle">Pearl Vibrant Theme - Generated with Google AI Studio</p>

    <div class="concept-box">
      <h2>Brand Concept: Unlocking Flow</h2>
      <p>
        FlowForge helps organizations unlock their hidden potential. By working through an organization's
        current state and identifying opportunities for improvement, we unlock <strong>Flow</strong> -
        new value, new revenue opportunities, cultural alignment, and enhanced organizational value for everyone.
        The logo represents this moment of breakthrough and release.
      </p>
    </div>

    <div class="section">
      <h2 class="section-title">Full Logo</h2>
      <div class="preview-grid">
        <div class="preview-card">
          <h3>Light Background</h3>
          <div class="logo-container">
            ${logoSVG}
          </div>
        </div>
        <div class="preview-card dark">
          <h3>Dark Background</h3>
          <div class="logo-container">
            ${logoSVG}
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Icon Mark</h2>
      <div class="preview-grid">
        <div class="preview-card">
          <h3>Light Background</h3>
          <div class="icon-sizes">
            <div class="icon-size">
              ${iconSVG.replace('width="64"', 'width="64"').replace('height="64"', 'height="64"')}
              <span>64px</span>
            </div>
            <div class="icon-size">
              ${iconSVG.replace(/width="\d+"/, 'width="32"').replace(/height="\d+"/, 'height="32"')}
              <span>32px</span>
            </div>
            <div class="icon-size">
              ${iconSVG.replace(/width="\d+"/, 'width="16"').replace(/height="\d+"/, 'height="16"')}
              <span>16px</span>
            </div>
          </div>
        </div>
        <div class="preview-card dark">
          <h3>Dark Background</h3>
          <div class="icon-sizes">
            <div class="icon-size">
              ${iconSVG.replace('width="64"', 'width="64"').replace('height="64"', 'height="64"')}
              <span>64px</span>
            </div>
            <div class="icon-size">
              ${iconSVG.replace(/width="\d+"/, 'width="32"').replace(/height="\d+"/, 'height="32"')}
              <span>32px</span>
            </div>
            <div class="icon-size">
              ${iconSVG.replace(/width="\d+"/, 'width="16"').replace(/height="\d+"/, 'height="16"')}
              <span>16px</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Brand Colors</h2>
      <div class="color-swatches">
        <div class="swatch">
          <div class="swatch-color" style="background: ${COLORS.accent}"></div>
          <span class="swatch-label">Primary</span>
          <span class="swatch-hex">${COLORS.accent}</span>
        </div>
        <div class="swatch">
          <div class="swatch-color" style="background: ${COLORS.teal}"></div>
          <span class="swatch-label">Secondary</span>
          <span class="swatch-hex">${COLORS.teal}</span>
        </div>
        <div class="swatch">
          <div class="swatch-color" style="background: ${COLORS.text}"></div>
          <span class="swatch-label">Text</span>
          <span class="swatch-hex">${COLORS.text}</span>
        </div>
        <div class="swatch">
          <div class="swatch-color" style="background: ${COLORS.bg}; border: 1px solid ${COLORS.textMuted}"></div>
          <span class="swatch-label">Background</span>
          <span class="swatch-hex">${COLORS.bg}</span>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

  const outputPath = path.join(process.cwd(), 'public', 'logo-preview.html');
  fs.writeFileSync(outputPath, html);
  console.log(`✅ Preview HTML saved to: ${outputPath}`);
}

async function main() {
  console.log('='.repeat(60));
  console.log('FlowForge Logo Generation');
  console.log('Concept: Unlocking Flow - Value, Opportunity, Alignment');
  console.log('='.repeat(60));

  // Generate full logo with text
  const logoSVG = await generateSVGLogo();

  // Generate icon only
  const iconSVG = await generateIconOnlySVG();

  // Generate preview HTML with design system styling
  generatePreviewHTML(logoSVG, iconSVG);

  console.log('\n' + '='.repeat(60));
  console.log('Generation complete!');
  console.log('');
  console.log('Files created:');
  console.log('  - public/generated-logo.svg');
  console.log('  - public/generated-icon.svg');
  console.log('  - public/logo-preview.html');
  console.log('');
  console.log('Open public/logo-preview.html in a browser to view.');
  console.log('='.repeat(60));
}

main().catch(console.error);
