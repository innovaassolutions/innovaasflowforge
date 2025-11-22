/**
 * Token Generator Tests
 *
 * Unit tests for the cryptographic token generation utility.
 *
 * Run with: npx ts-node lib/utils/token-generator.test.ts
 *
 * Tests:
 * - Token format validation (43 characters, base64url)
 * - Uniqueness across 10,000 generations
 * - Collision handling
 *
 * Story: 1.1 - Database & API Foundation
 */

import {
  generateAccessToken,
  isValidTokenFormat,
  generateMultipleTokens,
} from './token-generator.js';

// Simple test framework (no dependencies needed)
let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    testsPassed++;
  } else {
    console.error(`  ❌ ${message}`);
    testsFailed++;
  }
}

function test(name: string, fn: () => void) {
  console.log(`\n📋 ${name}`);
  try {
    fn();
  } catch (error) {
    console.error(`  ❌ Test threw error:`, error);
    testsFailed++;
  }
}

// ============================================================================
// Test Suite
// ============================================================================

console.log('🧪 Token Generator Test Suite\n');
console.log('=' .repeat(60));

test('Token Format Validation', () => {
  const token = generateAccessToken();

  assert(
    token.length === 43,
    `Token length is exactly 43 characters (got ${token.length})`
  );

  assert(
    isValidTokenFormat(token),
    'Token matches base64url pattern'
  );

  assert(
    /^[A-Za-z0-9_-]+$/.test(token),
    'Token contains only base64url characters (A-Z, a-z, 0-9, -, _)'
  );

  assert(
    !token.includes('+'),
    'Token does not contain "+" (replaced with "-")'
  );

  assert(
    !token.includes('/'),
    'Token does not contain "/" (replaced with "_")'
  );

  assert(
    !token.includes('='),
    'Token does not contain padding "="'
  );
});

test('Token Uniqueness (1,000 tokens)', () => {
  const count = 1000;
  const tokens = generateMultipleTokens(count);

  assert(
    tokens.length === count,
    `Generated exactly ${count} tokens`
  );

  const uniqueTokens = new Set(tokens);
  assert(
    uniqueTokens.size === count,
    `All ${count} tokens are unique (no collisions)`
  );
});

test('Token Uniqueness (10,000 tokens - collision test)', () => {
  console.log('  ⏳ Generating 10,000 tokens (this may take a few seconds)...');

  const startTime = Date.now();
  const count = 10000;
  const tokens = generateMultipleTokens(count);
  const duration = Date.now() - startTime;

  assert(
    tokens.length === count,
    `Generated exactly ${count} tokens in ${duration}ms`
  );

  const uniqueTokens = new Set(tokens);
  assert(
    uniqueTokens.size === count,
    `All ${count} tokens are unique (zero collisions with 256-bit entropy)`
  );

  // Calculate probability of collision (should be astronomically low)
  // Birthday paradox: P(collision) ≈ n²/2^257 for n=10000
  const probability = (count * count) / Math.pow(2, 257);
  console.log(`  ℹ️  Theoretical collision probability: ${probability.toExponential(2)} (effectively zero)`);
});

test('Invalid Token Format Detection', () => {
  assert(
    !isValidTokenFormat(''),
    'Empty string is invalid'
  );

  assert(
    !isValidTokenFormat('short'),
    'Short string (5 chars) is invalid'
  );

  assert(
    !isValidTokenFormat('a'.repeat(42)),
    '42-character string is invalid'
  );

  assert(
    !isValidTokenFormat('a'.repeat(44)),
    '44-character string is invalid'
  );

  assert(
    !isValidTokenFormat('kJ8x3vL2mN9qR5tY7wZ1aB4cD6eF8gH0iK2lM4nO+pQ'),
    'Token with "+" is invalid (not base64url)'
  );

  assert(
    !isValidTokenFormat('kJ8x3vL2mN9qR5tY7wZ1aB4cD6eF8gH0iK2lM4nO/pQ'),
    'Token with "/" is invalid (not base64url)'
  );

  assert(
    !isValidTokenFormat('kJ8x3vL2mN9qR5tY7wZ1aB4cD6eF8gH0iK2lM4nO=pQ'),
    'Token with "=" is invalid (no padding allowed)'
  );

  assert(
    !isValidTokenFormat('kJ8x3vL2mN9qR5tY7wZ1aB4cD6eF8gH0iK2lM4nO#pQ'),
    'Token with special character "#" is invalid'
  );
});

test('Entropy Distribution (basic randomness check)', () => {
  const tokens = generateMultipleTokens(100);

  // Check that different positions have variety (not all same character)
  const firstChars = new Set(tokens.map(t => t[0]));
  const lastChars = new Set(tokens.map(t => t[42]));
  const midChars = new Set(tokens.map(t => t[21]));

  assert(
    firstChars.size > 10,
    `First character has good variety (${firstChars.size} unique values)`
  );

  assert(
    lastChars.size > 10,
    `Last character has good variety (${lastChars.size} unique values)`
  );

  assert(
    midChars.size > 10,
    `Middle character has good variety (${midChars.size} unique values)`
  );
});

// ============================================================================
// Test Results Summary
// ============================================================================

console.log('\n' + '='.repeat(60));
console.log('\n📊 Test Results:\n');
console.log(`  ✅ Passed: ${testsPassed}`);
console.log(`  ❌ Failed: ${testsFailed}`);
console.log(`  📈 Total:  ${testsPassed + testsFailed}`);

if (testsFailed === 0) {
  console.log('\n🎉 All tests passed!\n');
  process.exit(0);
} else {
  console.log(`\n❌ ${testsFailed} test(s) failed\n`);
  process.exit(1);
}
