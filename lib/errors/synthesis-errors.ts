/**
 * Custom Error Types for Synthesis Operations
 *
 * Provides specific error classes for different failure scenarios
 * to enable better error handling and user messaging.
 */

export class SynthesisError extends Error {
  public code: string;
  public userMessage: string;
  public retryable: boolean;
  public details?: any;

  constructor(
    code: string,
    message: string,
    userMessage: string,
    retryable: boolean = false,
    details?: any
  ) {
    super(message);
    this.name = 'SynthesisError';
    this.code = code;
    this.userMessage = userMessage;
    this.retryable = retryable;
    this.details = details;
  }
}

/**
 * Claude API Credit/Quota Error
 */
export class APIQuotaError extends SynthesisError {
  constructor(details?: any) {
    super(
      'API_QUOTA_EXCEEDED',
      'Claude API quota exceeded',
      'Unable to generate report due to insufficient API credits. Please contact your administrator to add Claude API credits.',
      false,
      details
    );
    this.name = 'APIQuotaError';
  }
}

/**
 * Claude API Rate Limit Error
 */
export class APIRateLimitError extends SynthesisError {
  constructor(retryAfter?: number, details?: any) {
    super(
      'API_RATE_LIMIT',
      'Claude API rate limit exceeded',
      retryAfter
        ? `Rate limit reached. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`
        : 'Rate limit reached. Please try again in a few minutes.',
      true,
      { retryAfter, ...details }
    );
    this.name = 'APIRateLimitError';
  }
}

/**
 * Claude API Authentication Error
 */
export class APIAuthError extends SynthesisError {
  constructor(details?: any) {
    super(
      'API_AUTH_ERROR',
      'Claude API authentication failed',
      'API authentication error. Please verify your Claude API key is configured correctly.',
      false,
      details
    );
    this.name = 'APIAuthError';
  }
}

/**
 * Network/Connection Error
 */
export class NetworkError extends SynthesisError {
  constructor(details?: any) {
    super(
      'NETWORK_ERROR',
      'Network connection failed',
      'Unable to connect to AI service. Please check your internet connection and try again.',
      true,
      details
    );
    this.name = 'NetworkError';
  }
}

/**
 * Invalid AI Response (JSON parsing failed)
 */
export class InvalidResponseError extends SynthesisError {
  constructor(dimension: string, details?: any) {
    super(
      'INVALID_AI_RESPONSE',
      `Failed to parse AI response for ${dimension}`,
      `The AI generated an invalid response format. This usually resolves on retry.`,
      true,
      { dimension, ...details }
    );
    this.name = 'InvalidResponseError';
  }
}

/**
 * No Completed Interviews Error
 */
export class NoInterviewsError extends SynthesisError {
  constructor(campaignId: string) {
    super(
      'NO_COMPLETED_INTERVIEWS',
      'No completed interviews found',
      'At least one stakeholder interview must be completed before generating a report.',
      false,
      { campaignId }
    );
    this.name = 'NoInterviewsError';
  }
}

/**
 * Database Error
 */
export class DatabaseError extends SynthesisError {
  constructor(operation: string, details?: any) {
    super(
      'DATABASE_ERROR',
      `Database ${operation} failed`,
      'A database error occurred. Please try again or contact support if the issue persists.',
      true,
      { operation, ...details }
    );
    this.name = 'DatabaseError';
  }
}

/**
 * Helper function to classify errors from Claude API
 */
export function classifyAnthropicError(error: any): SynthesisError {
  // Check for specific Anthropic error types
  if (error.status === 401 || error.type === 'authentication_error') {
    return new APIAuthError({
      status: error.status,
      type: error.type,
      message: error.message
    });
  }

  if (error.status === 429 || error.type === 'rate_limit_error') {
    const retryAfter = error.headers?.['retry-after']
      ? parseInt(error.headers['retry-after'])
      : undefined;
    return new APIRateLimitError(retryAfter, {
      status: error.status,
      type: error.type,
      message: error.message
    });
  }

  if (error.status === 402 || error.message?.includes('credit') || error.message?.includes('quota')) {
    return new APIQuotaError({
      status: error.status,
      type: error.type,
      message: error.message
    });
  }

  if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
    return new NetworkError({
      code: error.code,
      message: error.message
    });
  }

  // Default to generic synthesis error
  return new SynthesisError(
    'UNKNOWN_ERROR',
    error.message || 'Unknown error occurred',
    'An unexpected error occurred during report generation. Please try again.',
    true,
    error
  );
}

/**
 * Retry helper with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if error is retryable
      if (error instanceof SynthesisError && !error.retryable) {
        throw error;
      }

      // If this was the last attempt, throw
      if (attempt === maxRetries - 1) {
        throw error;
      }

      // Calculate backoff delay: baseDelay * 2^attempt + random jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${Math.round(delay)}ms`);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}
