#!/usr/bin/env node

/**
 * Generate welcome animation with voice using Google AI Studio
 * - Gemini for TTS (native audio generation)
 * - FFmpeg for video creation with animation
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config({ path: '.env.local' });

const GEMINI_API_KEY = process.env.GOOGLE_AI_STUDIO;
const IMAGE_PATH = path.join(__dirname, '../public/illustrations/welcome-greeter.png');
const OUTPUT_DIR = path.join(__dirname, '../public/animations');
const AUDIO_RAW_PATH = path.join(OUTPUT_DIR, 'welcome-voice.raw');
const AUDIO_PATH = path.join(OUTPUT_DIR, 'welcome-voice.wav');
const VIDEO_PATH = path.join(OUTPUT_DIR, 'welcome-animation.mp4');

const WELCOME_TEXT = "Hello, welcome to Flow Forge! Sign in here to get started.";

async function generateVoiceWithGemini() {
  console.log('Generating voice with Google AI Studio TTS...');

  // Gemini 2.5 Flash TTS - dedicated text-to-speech model
  const TTS_MODEL = 'gemini-2.5-flash-preview-tts';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${TTS_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

  console.log(`  Using model: ${TTS_MODEL}`);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: WELCOME_TEXT
        }]
      }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: {
              voiceName: "Kore"
            }
          }
        }
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`TTS error: ${response.status} - ${errorText.substring(0, 300)}`);
  }

  const data = await response.json();

  // Extract audio from response
  if (data.candidates?.[0]?.content?.parts) {
    for (const part of data.candidates[0].content.parts) {
      if (part.inlineData?.data) {
        const audioBuffer = Buffer.from(part.inlineData.data, 'base64');

        // Save raw PCM audio first
        fs.writeFileSync(AUDIO_RAW_PATH, audioBuffer);
        console.log(`  ✓ Raw audio saved`);

        // Convert raw PCM to WAV using ffmpeg (Gemini TTS outputs 24kHz 16-bit mono PCM)
        try {
          execSync(`ffmpeg -y -f s16le -ar 24000 -ac 1 -i "${AUDIO_RAW_PATH}" "${AUDIO_PATH}"`, { stdio: 'pipe' });
          fs.unlinkSync(AUDIO_RAW_PATH); // Clean up raw file
          console.log(`  ✓ Converted to WAV: ${AUDIO_PATH}`);
        } catch (e) {
          console.log(`  Warning: Could not convert audio, trying direct use`);
          fs.renameSync(AUDIO_RAW_PATH, AUDIO_PATH);
        }

        return AUDIO_PATH;
      }
    }
  }

  throw new Error('No audio in response');
}

function getAudioDuration(audioPath) {
  try {
    const result = execSync(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"`,
      { encoding: 'utf-8' }
    );
    return parseFloat(result.trim());
  } catch (e) {
    console.log('  Could not get audio duration, using default 5 seconds');
    return 5;
  }
}

function createAnimation(audioPath) {
  console.log('Creating animation with FFmpeg...');

  const duration = getAudioDuration(audioPath);
  console.log(`  Audio duration: ${duration.toFixed(2)} seconds`);

  // Create a subtle zoom animation effect
  const ffmpegCommand = `ffmpeg -y \
    -loop 1 -i "${IMAGE_PATH}" \
    -i "${audioPath}" \
    -filter_complex "[0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=white,zoompan=z='min(zoom+0.0005,1.08)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${Math.ceil(duration * 25)}:s=1920x1080:fps=25[v]" \
    -map "[v]" -map 1:a \
    -c:v libx264 -preset medium -crf 23 \
    -c:a aac -b:a 192k \
    -t ${duration + 0.5} \
    -pix_fmt yuv420p \
    "${VIDEO_PATH}"`;

  try {
    execSync(ffmpegCommand, { stdio: 'pipe' });
    console.log(`  ✓ Video saved to ${VIDEO_PATH}`);
    return VIDEO_PATH;
  } catch (e) {
    // Try simpler approach without zoom
    console.log('  Trying simpler animation...');
    const simpleCommand = `ffmpeg -y \
      -loop 1 -i "${IMAGE_PATH}" \
      -i "${audioPath}" \
      -filter_complex "[0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=white[v]" \
      -map "[v]" -map 1:a \
      -c:v libx264 -preset medium -crf 23 \
      -c:a aac -b:a 192k \
      -t ${duration + 0.5} \
      -shortest \
      -pix_fmt yuv420p \
      "${VIDEO_PATH}"`;

    execSync(simpleCommand, { stdio: 'pipe' });
    console.log(`  ✓ Video saved to ${VIDEO_PATH}`);
    return VIDEO_PATH;
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('Welcome Animation Generator (Google AI Studio)');
  console.log('='.repeat(60));

  if (!GEMINI_API_KEY) {
    console.error('\nError: GOOGLE_AI_STUDIO not found in .env.local');
    process.exit(1);
  }

  if (!fs.existsSync(IMAGE_PATH)) {
    console.error(`\nError: Image not found at ${IMAGE_PATH}`);
    process.exit(1);
  }

  // Check for ffmpeg
  try {
    execSync('which ffmpeg', { stdio: 'pipe' });
  } catch (e) {
    console.error('\nError: ffmpeg not found. Install with: brew install ffmpeg');
    process.exit(1);
  }

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log(`\nText: "${WELCOME_TEXT}"`);
  console.log(`Image: ${IMAGE_PATH}`);
  console.log('');

  // Generate voice with Gemini
  await generateVoiceWithGemini();

  // Create animation
  createAnimation(AUDIO_PATH);

  console.log(`\n${'='.repeat(60)}`);
  console.log('✓ Animation complete!');
  console.log(`  Video: ${VIDEO_PATH}`);
  console.log(`  Audio: ${AUDIO_PATH}`);
}

main().catch(console.error);
