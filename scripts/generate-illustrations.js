#!/usr/bin/env node

/**
 * Generate character illustrations using Nano Banana Pro (gemini-3-pro-image-preview)
 * Based on the illustration style guide in docs/illustrationguide.md
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Nano Banana Pro = gemini-3-pro-image-preview (Google AI Studio)
const NANO_BANANA_PRO_MODEL = 'gemini-3-pro-image-preview';
const GEMINI_2_FLASH_MODEL = 'gemini-2.0-flash-exp-image-generation';

const GEMINI_API_KEY = process.env.GOOGLE_AI_STUDIO || process.env.GOOGLE_GEMINI_API_KEY;

const OUTPUT_DIR = path.join(__dirname, '../public/illustrations');
const REFERENCE_IMAGE_PATH = path.join(__dirname, '../public/illustrations/characters.png');

// Load and resize reference image as base64
function getReferenceImageBase64() {
  if (fs.existsSync(REFERENCE_IMAGE_PATH)) {
    const resizedPath = path.join(__dirname, '../public/illustrations/characters-small.png');
    try {
      execSync(`sips -Z 512 "${REFERENCE_IMAGE_PATH}" --out "${resizedPath}"`, { stdio: 'pipe' });
      const imageBuffer = fs.readFileSync(resizedPath);
      fs.unlinkSync(resizedPath);
      console.log('  Using resized reference image for style matching');
      return imageBuffer.toString('base64');
    } catch (e) {
      const imageBuffer = fs.readFileSync(REFERENCE_IMAGE_PATH);
      return imageBuffer.toString('base64');
    }
  }
  return null;
}

const CORE_STYLE = `Create an illustration in a charming, hand-drawn editorial style with these characteristics:

LINE WORK: Bold, charcoal/dark gray ink-style outlines with a slightly sketchy, organic quality. Lines have subtle texture and variation in weight—thicker for body masses and contours, thinner for details. Small imperfections and wobbles give warmth and personality.

COLOR PALETTE: Strictly monochromatic using only charcoal gray (primary line work and solid fills) against a warm off-white background color #FFFEFB. No accent colors, no gradients, no additional tones.

TEXTURE: Light hatching or stippling for shading and dimension, particularly on rounded forms. Maintain hand-drawn, slightly rough quality throughout.

CHARACTER PROPORTIONS: Stylized with oversized heads (approximately 1/3 of body height), simplified geometric body shapes, expressive but minimal facial features. Bodies are chunky and endearing—friendly editorial illustration rather than anatomical accuracy.

FACES: Simple and expressive—small curved lines for closed, content eyes; basic nose shapes; minimal or no mouths. Hair rendered with flowing, decorative line patterns.

CLOTHING: Horizontal stripes on shirts as recurring motif. Clothing simplified into bold shapes with minimal interior detail.

POSES: Dynamic, exaggerated poses conveying action and emotion. Figures feel active and engaged with sweeping arm gestures and slight forward leans.

PROPS: Oversized relative to figures (50-100% larger than realistic scale) for visual impact. Same bold outline style with minimal interior detail.

BACKGROUND: Solid warm off-white background (#FFFEFB) with simple ground shadow beneath figure (hatched oval shape in charcoal). Keep composition centered with ample negative space.`;

const CHARACTERS = {
  'chemist-flask': {
    filename: 'chemist-flask.png',
    prompt: `${CORE_STYLE}

CHARACTER: A chemist/pharmaceutical scientist wearing a lab coat over a horizontally striped shirt, with safety goggles pushed up on their head. Practical hairstyle. Friendly, focused demeanor.

ACTIVITY: Holding up a large oversized flask or beaker triumphantly with one hand, examining the contents with a satisfied expression. The liquid inside rendered as a simple shape. Small motion lines near the flask suggest it was just lifted.

Single character, full body, centered composition with solid #FFFEFB background.`
  },
  'chemist-tablet': {
    filename: 'chemist-tablet.png',
    prompt: `${CORE_STYLE}

CHARACTER: A focused chemist wearing a lab coat over a horizontally striped shirt. Safety goggles around neck. Hair in a practical style. Oversized head (1/3 of body height), chunky endearing body proportions.

ACTIVITY: Standing, holding a tablet device, body leaning slightly forward with concentration. One hand supporting the tablet, the other touching the screen. Analytical, engaged expression.

Single character, full body, centered composition with solid #FFFEFB background.`
  },
  'teacher-whiteboard': {
    filename: 'teacher-whiteboard.png',
    prompt: `${CORE_STYLE}

CHARACTER: A teacher with expressive, flowing hair, wearing casual professional attire with a horizontally striped top and simple pants. Radiates warmth and enthusiasm.

ACTIVITY: Drawing on a whiteboard—reaching up with one arm to draw a large heart or simple diagram. The board rendered as a simple rectangle. Holding a large pencil or marker. Engaged, enthusiastic posture.

Single character, full body, centered composition with solid #FFFEFB background.`
  },
  'consultant-presenting': {
    filename: 'consultant-presenting.png',
    prompt: `${CORE_STYLE}

CHARACTER: A consultant with neat, professional appearance—collared shirt or sweater with horizontal stripes, carrying business accessories. Confident, purposeful energy.

ACTIVITY: Presenting with a laptop—holding an open laptop in one hand while gesturing enthusiastically with the other, body angled toward an implied audience. The laptop rendered as a simple open rectangle shape.

Single character, full body, centered composition with solid #FFFEFB background.`
  },
  'industrial-worker': {
    filename: 'industrial-worker.png',
    prompt: `${CORE_STYLE}

CHARACTER: A confident woman shop floor supervisor wearing a hard hat, safety vest over a horizontally striped shirt, practical work pants, sturdy boots. Oversized head (1/3 of body height), chunky endearing body proportions. Capable, leadership energy.

ACTIVITY: Standing confidently on the shop floor, holding an oversized tablet device with both hands, reviewing data or production metrics. Slight forward lean showing engagement. Professional but approachable demeanor.

EXPRESSION: Focused, competent eyes (small curved lines), determined yet friendly expression. Ready to lead and optimize operations.

Single character, full body, centered composition with solid #FFFEFB background.`
  },
  'welcome-greeter': {
    filename: 'welcome-greeter.png',
    prompt: `${CORE_STYLE}

CHARACTER: A warm, friendly professional with neat appearance. Wearing business casual attire with a horizontally striped shirt. Approachable, welcoming energy. Oversized head (1/3 of body height), chunky endearing body proportions.

ACTIVITY: Standing in a welcoming stance with one arm raised in a friendly wave. Big, warm smile with simple curved line. Other arm relaxed at side or slightly extended in an inviting gesture. Body facing forward, open and approachable posture. Small motion lines near waving hand.

EXPRESSION: Happy, content eyes (small curved lines), visible smile (curved line showing friendliness). Radiates warmth and welcome.

Single character, full body, centered composition with solid #FFFEFB background.`
  }
};

// Try Nano Banana Pro (gemini-3-pro-image-preview) via Google AI Studio API
async function generateWithNanoBananaPro(character) {
  if (!GEMINI_API_KEY) {
    console.log('  ✗ Nano Banana Pro: No API key available');
    return null;
  }

  console.log('  Trying Nano Banana Pro (gemini-3-pro-image-preview) via Google AI Studio...');

  // Try Google AI Studio endpoint first (requires paid tier)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${NANO_BANANA_PRO_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const referenceImageBase64 = getReferenceImageBase64();
  const parts = [];

  if (referenceImageBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/png",
        data: referenceImageBase64
      }
    });
    parts.push({
      text: `Study the style of this reference image carefully. It shows hand-drawn editorial illustrations with charcoal gray ink lines, oversized head proportions, and a sketchy organic quality.\n\nNow generate a NEW illustration in this EXACT same style with a solid warm off-white background (#FFFEFB):\n\n${character.prompt}`
    });
  } else {
    parts.push({ text: character.prompt });
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { responseModalities: ["image", "text"] }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();

    if (data.candidates?.[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          return part.inlineData.data;
        }
      }
    }
    throw new Error('No image in response');
  } catch (error) {
    console.log(`  ✗ Nano Banana Pro: ${error.message}`);
    return null;
  }
}

// Fallback to Gemini 2.0 Flash
async function generateWithGemini2Flash(character) {
  console.log('  Trying Gemini 2.0 Flash (fallback)...');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_2_FLASH_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  const referenceImageBase64 = getReferenceImageBase64();
  const parts = [];

  if (referenceImageBase64) {
    parts.push({
      inlineData: {
        mimeType: "image/png",
        data: referenceImageBase64
      }
    });
    parts.push({
      text: `Study the style of this reference image carefully. It shows hand-drawn editorial illustrations with charcoal gray ink lines, oversized head proportions, and a sketchy organic quality.\n\nNow generate a NEW illustration in this EXACT same style with a solid warm off-white background (#FFFEFB):\n\n${character.prompt}`
    });
  } else {
    parts.push({ text: character.prompt });
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { responseModalities: ["image", "text"] }
      })
    });

    if (!response.ok) {
      throw new Error(`API failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.candidates?.[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inlineData?.data) {
          return part.inlineData.data;
        }
      }
    }
    throw new Error('No image in response');
  } catch (error) {
    console.log(`  ✗ Gemini 2.0 Flash: ${error.message}`);
    return null;
  }
}

async function generateImage(characterKey, character) {
  console.log(`\nGenerating ${characterKey}...`);

  // Try Nano Banana Pro first (requires paid tier in Google AI Studio)
  let imageData = await generateWithNanoBananaPro(character);

  // Fallback to Gemini 2.0 Flash (uses API key)
  if (!imageData) {
    imageData = await generateWithGemini2Flash(character);
  }

  if (imageData) {
    const outputPath = path.join(OUTPUT_DIR, character.filename);
    fs.writeFileSync(outputPath, Buffer.from(imageData, 'base64'));
    console.log(`  ✓ Saved to ${outputPath}`);
    return true;
  }

  console.log(`  ✗ Failed to generate ${characterKey}`);
  return false;
}

async function main() {
  console.log('='.repeat(60));
  console.log('Character Illustration Generator');
  console.log('Using Nano Banana Pro (gemini-3-pro-image-preview)');
  console.log('='.repeat(60));

  if (!GEMINI_API_KEY) {
    console.error('\nError: No API key available.');
    console.error('Set GOOGLE_AI_STUDIO in .env.local');
    process.exit(1);
  }

  console.log(`\n✓ API key found`);
  console.log(`  Primary model: ${NANO_BANANA_PRO_MODEL} (requires paid tier)`);
  console.log(`  Fallback model: ${GEMINI_2_FLASH_MODEL}`);

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  let success = 0;
  for (const [key, char] of Object.entries(CHARACTERS)) {
    if (await generateImage(key, char)) success++;
    await new Promise(r => setTimeout(r, 2000));
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Results: ${success}/${Object.keys(CHARACTERS).length} generated`);
}

main().catch(console.error);
