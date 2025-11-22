/**
 * Token Generator Utility
 *
 * Generates cryptographically secure access tokens for campaign reports.
 *
 * Security Requirements:
 * - 256-bit entropy (32 bytes)
 * - Base64URL encoding (URL-safe, 43 characters)
 * - Collision-resistant (database UNIQUE constraint enforced)
 *
 * Story: 1.1 - Database & API Foundation
 * Epic: 1 - Client Assessment Report Generation System
 */

import { randomBytes } from 'crypto';

/**
 * Generates a cryptographically secure access token.
 *
 * Uses Node.js crypto.randomBytes to generate 256-bit (32 bytes) of entropy,
 * then encodes to base64url format for URL-safe usage.
 *
 * @returns {string} 43-character base64url-encoded access token
 *
 * @example
 * const token = generateAccessToken();
 * // Returns: "kJ8x3vL2mN9qR5tY7wZ1aB4cD6eF8gH0iK2lM4nO6pQ"
 */
export function generateAccessToken(): string {
  // Generate 32 bytes (256 bits) of cryptographically strong random data
  const buffer = randomBytes(32);

  // Convert to base64url encoding (URL-safe variant of base64)
  // - Replaces '+' with '-'
  // - Replaces '/' with '_'
  // - Removes padding '=' characters
  const token = buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return token;
}

/**
 * Validates that a token matches the expected format.
 *
 * @param {string} token - Token to validate
 * @returns {boolean} True if token is valid format (43 base64url characters)
 *
 * @example
 * isValidTokenFormat("kJ8x3vL2mN9qR5tY7wZ1aB4cD6eF8gH0iK2lM4nO6pQ"); // true
 * isValidTokenFormat("invalid"); // false
 */
export function isValidTokenFormat(token: string): boolean {
  // Valid base64url token should be exactly 43 characters
  // Contains only: A-Z, a-z, 0-9, -, _
  const base64urlPattern = /^[A-Za-z0-9_-]{43}$/;
  return base64urlPattern.test(token);
}

/**
 * Generates multiple unique tokens for testing or batch operations.
 *
 * Note: Uniqueness is statistically guaranteed by 256-bit entropy.
 * Database UNIQUE constraint provides absolute collision protection.
 *
 * @param {number} count - Number of tokens to generate
 * @returns {string[]} Array of unique access tokens
 *
 * @example
 * const tokens = generateMultipleTokens(100);
 * // Returns: ["token1", "token2", ..., "token100"]
 */
export function generateMultipleTokens(count: number): string[] {
  const tokens: string[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    let token: string;
    let attempts = 0;
    const maxAttempts = 10; // Collision retry limit (should never be needed)

    // Generate token, retry if duplicate (extremely unlikely)
    do {
      token = generateAccessToken();
      attempts++;

      if (attempts > maxAttempts) {
        throw new Error(
          `Failed to generate unique token after ${maxAttempts} attempts. ` +
          `This should never happen with 256-bit entropy.`
        );
      }
    } while (seen.has(token));

    seen.add(token);
    tokens.push(token);
  }

  return tokens;
}
