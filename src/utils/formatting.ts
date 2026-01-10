/**
 * Formatting utilities for output
 */

import { CHARACTER_LIMIT } from "../types.js";

/**
 * Truncate text if it exceeds character limit
 */
export function truncateText(text: string, limit: number = CHARACTER_LIMIT): string {
  if (text.length <= limit) {
    return text;
  }
  return text.substring(0, limit) + `\n\n... [Response truncated at ${limit} characters]`;
}

/**
 * Format date for display
 */
export function formatDate(dateStr: string): string {
  try {
    if (!dateStr) {
      return 'Invalid Date';
    }
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    return date.toISOString().slice(0, 10);
  } catch {
    return 'Invalid Date';
  }
}

/**
 * Format bytes to human readable
 */
export function formatBytes(bytes: number | undefined): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
