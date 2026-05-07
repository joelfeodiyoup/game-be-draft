import "dotenv/config";

import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { trace } from "@opentelemetry/api";

const SERVICE_NAME = "game-backend";
let sdk: NodeSDK;
export function registerTracing() {
  const tracingEnabled = process.env.ENABLE_TRACING === "true";
  if (!tracingEnabled) return;

  console.log("Initializing OpenTelemetry tracing...");

  const otlpExporter = new OTLPTraceExporter({
    url:
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT ||
      "http://localhost:4318/v1/traces",
  });

  const prometheusExporter = new PrometheusExporter();

  const spanProcessor = new BatchSpanProcessor(otlpExporter, {
    maxQueueSize: 2048, // Default: allow batching multiple spans
    maxExportBatchSize: 512, // Default: export in reasonable batches
    scheduledDelayMillis: 1000, // Wait 1s before exporting to ensure parent spans are included
  });

  sdk = new NodeSDK({
    serviceName: SERVICE_NAME,
    // Optional - if omitted, the tracing SDK will be initialized from environment variables
    traceExporter: otlpExporter,
    spanProcessor: spanProcessor,
    // Optional - If omitted, the metrics SDK will not be initialized
    metricReader: prometheusExporter,
    // Optional - you can use the metapackage or load each instrumentation individually
    instrumentations: [
      getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-fs": {
          enabled: false,
        },
        "@opentelemetry/instrumentation-http": {
          enabled: true,
          ignoreIncomingRequestHook: (request) => {
            return request.method === "OPTIONS";
          },
          ignoreOutgoingRequestHook: (request) => {
            const path = request.path || "";
            return path === "/v1/traces" || path.includes("localhost:4318");
          },
          requestHook: (span, request) => {
            if ("attributes" in span) {
              const path = (span.attributes as Record<string, string>)[
                "http.target"
              ];
              const normalizedPath = path.replace(
                /\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
                "/:id"
              );
              span.updateName(`${request.method} ${normalizedPath}`);
            }

            // Operation type tags
            const method = request.method ?? '';
            if (method === "GET") {
              span.setAttribute("operation.type", "read");
            } else if (["POST", "PUT", "PATCH"].includes(method)) {
              span.setAttribute("operation.type", "write");
            } else if (method === "DELETE") {
              span.setAttribute("operation.type", "delete");
            }
          },
        },
        "@opentelemetry/instrumentation-mongodb": {
          enabled: true,
        },
      }),
    ],
  });

  sdk.start();
}
process.on("SIGTERM", async () => {
  if (sdk) {
    await sdk.shutdown();
    console.log("OpenTelemetry tracing shut down");
  }
});

registerTracing();

export const getTracer = () => trace.getTracer(SERVICE_NAME);
