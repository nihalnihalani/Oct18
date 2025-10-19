/**
 * Centralized Error Handling Utility
 */

import { ERROR_MESSAGES } from '../constants';
import type { ApiError } from '../types';

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Handle API errors and return user-friendly message
 */
export async function handleApiError(response: Response): Promise<never> {
  let errorMessage: string = ERROR_MESSAGES.UNKNOWN_ERROR;
  
  try {
    const errorData: ApiError = await response.json();
    errorMessage = errorData.error || errorData.message || errorMessage;
  } catch {
    errorMessage = `${ERROR_MESSAGES.UNKNOWN_ERROR} (${response.status})`;
  }

  throw new AppError(errorMessage, 'API_ERROR', response.status);
}

/**
 * Wrap async operations with try-catch and logging
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.error(`Error in ${context}:`, error);
    
    if (error instanceof AppError) {
      throw error;
    }
    
    const message = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR;
    throw new AppError(message, 'OPERATION_ERROR');
  }
}

/**
 * Show user-friendly error alert
 */
export function showError(error: unknown, context?: string): void {
  const message = error instanceof AppError 
    ? error.message 
    : error instanceof Error 
    ? error.message 
    : ERROR_MESSAGES.UNKNOWN_ERROR;
  
  const fullMessage = context ? `${context}: ${message}` : message;
  alert(fullMessage);
}

/**
 * Log error to console with context
 */
export function logError(error: unknown, context: string): void {
  console.error(`[${context}]`, error);
}

