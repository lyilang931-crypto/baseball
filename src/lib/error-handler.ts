// lib/error-handler.ts
import { logger } from './monitoring';

export function setupErrorHandling() {
  if (typeof window === 'undefined') return;

  window.addEventListener('error', (event) => {
    logger.error('Unhandled error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', {
      reason: String(event.reason),
    });
  });
}