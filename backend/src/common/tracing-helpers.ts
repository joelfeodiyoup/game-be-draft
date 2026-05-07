import { getTracer } from '../tracing';
import { Span, SpanStatusCode, trace } from '@opentelemetry/api';

function getCallerInfo(): {
    functionName: string;
    fileName: string;
    lineNumber: string;
    callStack: string;
} | null {
    try {
        const stack = new Error().stack;
        if (!stack) return null;

        const lines = stack.split('\n');
        const applicationFrames: Array<{functionName: string; fileName: string; lineNumber: string}> = [];

        // Collect all application frames (skip infrastructure/node internals)
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];

            // Skip if it's from tracing/infrastructure code, node_modules, or node internals
            if (line.includes('tracing-helpers.ts') ||
                line.includes('databases/postgres/db.ts') ||
                line.includes('node_modules') ||
                line.includes('node:internal') ||
                line.includes('AsyncLocalStorage')) {
                continue;
            }

            // Parse line like: "at functionName (file:line:col)" or "at file:line:col"
            const match = line.match(/at\s+(?:async\s+)?(?:(.+?)\s+\()?(.+?):(\d+):(\d+)/);
            if (!match) continue;

            const functionName = match[1] || '<anonymous>';
            const filePath = match[2];
            const fileName = filePath.split('/').pop() || filePath;
            const lineNumber = match[3];

            applicationFrames.push({ functionName, fileName, lineNumber });

            // Capture up to 5 frames for context
            if (applicationFrames.length >= 5) break;
        }

        if (applicationFrames.length === 0) return null;

        // Build call stack string: "controller.ts:55 → orchestrator.ts:24 → service.ts:89"
        const callStack = applicationFrames.reverse()
            .map(frame => `${frame.fileName}:${frame.lineNumber}`)
            .join(' → ');

        // Return the immediate caller (first frame) plus the full stack
        return {
            functionName: applicationFrames[0].functionName,
            fileName: applicationFrames[0].fileName,
            lineNumber: applicationFrames[0].lineNumber,
            callStack
        };
    } catch {
        return null;
    }
}

/**
 * Traces an async operation with automatic call stack capture, duration tracking, and error handling.
 *
 * @param spanName - The name of the span (e.g., "db.games.findMany")
 * @param fn - The async function to trace
 * @param attributes - Optional custom attributes to add to the span
 * @returns The result of the function
 */
export async function traceOperation<T>(
    spanName: string,
    fn: () => Promise<T>,
    attributes?: Record<string, string | number>
): Promise<T> {
    if (process.env.ENABLE_TRACING !== 'true') {
        return fn();
    }

    const tracer = getTracer();

    // Debug: Check if we have a parent span
    const parentSpan = trace.getActiveSpan();
    if (parentSpan) {
        console.log(`[Trace] Creating child span "${spanName}" under parent "${parentSpan.spanContext().spanId}"`);
    } else {
        console.log(`[Trace] Creating root span "${spanName}" (no parent found)`);
    }

    return tracer.startActiveSpan(spanName, async (span: Span) => {
        try {
            // Capture caller info and call stack
            const callerInfo = getCallerInfo();
            if (callerInfo) {
                span.setAttribute('code.function', callerInfo.functionName);
                span.setAttribute('code.filepath', callerInfo.fileName);
                span.setAttribute('code.lineno', callerInfo.lineNumber);
                span.setAttribute('code.callstack', callerInfo.callStack);
            }

            // Add custom attributes if provided
            if (attributes) {
                Object.entries(attributes).forEach(([key, value]) => {
                    span.setAttribute(key, value);
                });
            }

            const start = Date.now();
            const result = await fn();
            const duration = Date.now() - start;

            span.setAttribute('duration_ms', duration);
            span.setStatus({code: SpanStatusCode.OK});
            return result;
        } catch(error) {
            span.setStatus({
                code: SpanStatusCode.ERROR,
                message: error instanceof Error ? error.message : 'unknown error',
            });
            span.recordException(error as Error);
            throw error;
        } finally {
            span.end();
        }
    })
}