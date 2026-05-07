import { Context, Next } from 'hono';
import { trace, context } from '@opentelemetry/api';

/**
 * Hono middleware to ensure OpenTelemetry context is preserved
 * and application code runs within the HTTP span context
 */
export async function tracingMiddleware(c: Context, next: Next) {
  if (process.env.ENABLE_TRACING !== 'true') {
    return next();
  }

  // Get the active span from the HTTP instrumentation
  const activeSpan = trace.getActiveSpan();

  if (activeSpan) {
    // Execute the handler within the HTTP span's context
    return context.with(context.active(), async () => {
      await next();
    });
  }

  // If no active span, just continue normally
  return next();
}
