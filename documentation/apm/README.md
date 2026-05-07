# Application Performance Monitoring (APM) Implementation

## Overview

This project implements comprehensive Application Performance Monitoring using **OpenTelemetry** and **Jaeger** to provide distributed tracing, performance monitoring, and observability for the game backend service.

## Technologies Used

- **OpenTelemetry SDK**: Industry-standard observability framework for distributed tracing
- **Jaeger**: Open-source distributed tracing platform for monitoring and troubleshooting microservices
- **Prometheus Exporter**: Metrics collection and export capabilities
- **OTLP (OpenTelemetry Protocol)**: HTTP-based trace exporter

## Key Features Implemented

### 1. Distributed Tracing
- Full request lifecycle tracing from HTTP endpoints through database operations
- Automatic instrumentation for HTTP requests and MongoDB queries
- Parent-child span relationships for understanding request flow

### 2. Intelligent Span Processing
- **Batch Span Processor** configured with optimized settings:
  - Queue size: 2048 spans (prevents data loss under load)
  - Batch size: 512 spans (balances network efficiency with latency)
  - Delay: 1000ms (ensures parent spans are included before export)

### 3. Custom Instrumentation
- **Path normalization**: Converts UUID parameters to `:id` for better grouping
  - Example: `/games/550e8400-e29b-41d4-a716-446655440000` → `/games/:id`
- **Operation type tagging**: Categorizes requests as read/write/delete operations
- **OPTIONS request filtering**: Eliminates noise from preflight requests
- **Circular dependency prevention**: Ignores traces to the trace collector itself

### 4. Auto-Instrumentation
- HTTP server and client requests
- MongoDB database operations
- Filesystem operations (disabled for performance)

### 5. Dual Export Strategy
- **OTLP HTTP Exporter**: Sends traces to Jaeger collector
- **Prometheus Exporter**: Exposes metrics endpoint for scraping

## Architecture

```
┌─────────────────┐
│  Express API    │
│   (Backend)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ OpenTelemetry   │
│   SDK + Auto    │
│ Instrumentation │
└────────┬────────┘
         │
         ├──────────────────┐
         ▼                  ▼
┌─────────────────┐  ┌──────────────┐
│  OTLP Exporter  │  │  Prometheus  │
│   (HTTP)        │  │   Exporter   │
└────────┬────────┘  └──────────────┘
         │
         ▼
┌─────────────────┐
│     Jaeger      │
│   (Collector    │
│   + UI)         │
└─────────────────┘
```

## Implementation Details

### Configuration (`backend/src/tracing.ts`)

The implementation demonstrates several best practices:

1. **Environment-based enablement**: Tracing only runs when `ENABLE_TRACING=true`
2. **Graceful shutdown**: SIGTERM handler ensures spans are flushed before exit
3. **Configurable endpoints**: OTLP endpoint can be customized via environment variable
4. **Service identification**: Clear service naming for multi-service environments

### Request Hook Customization

The HTTP instrumentation includes a custom `requestHook` that:
- Normalizes URL paths with UUIDs for better aggregation in Jaeger UI
- Adds semantic operation type attributes for filtering and analysis
- Improves observability by making traces more queryable

### Performance Considerations

- Batch processing reduces network overhead
- Filesystem instrumentation disabled to avoid performance impact
- Asynchronous export prevents blocking application threads
- Configurable queue sizes prevent memory exhaustion under load

## Visual Examples

### Jaeger UI - Trace Timeline
![Jaeger Trace Timeline](Screenshot%202026-05-07%20at%2009.28.07.png)

Shows the complete request flow with timing information for each span, allowing identification of bottlenecks.

### Jaeger UI - Service Dependencies
![Jaeger Service Dependencies](Screenshot%202026-05-07%20at%2009.28.42.png)

Visualizes how the backend service interacts with dependencies like MongoDB, showing latency and request volume.

## Setup & Usage

### Prerequisites
```bash
# Start Jaeger all-in-one (includes collector, UI, and storage)
docker run -d --name jaeger \
  -p 16686:16686 \
  -p 4318:4318 \
  jaegertracing/all-in-one:latest
```

### Enable Tracing
```bash
# In .env or environment
ENABLE_TRACING=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318/v1/traces
```

### Access Jaeger UI
Navigate to `http://localhost:16686` to view traces and analyze performance.

## Skills Demonstrated

- **Observability Engineering**: Implementing production-grade monitoring and tracing
- **Distributed Systems**: Understanding trace propagation and context management
- **Performance Optimization**: Configuring batch processors and filtering for efficiency
- **DevOps Practices**: Docker integration, environment-based configuration
- **Open Source Tools**: Practical application of OpenTelemetry and Jaeger
- **Code Quality**: Clean architecture, separation of concerns, graceful shutdown handling
- **Production Readiness**: Circular dependency prevention, error handling, resource management

## Business Value

This implementation provides:
- **Faster debugging**: Quickly identify slow database queries or external API calls
- **Performance insights**: Understand request patterns and optimize hot paths
- **Proactive monitoring**: Detect anomalies before they impact users
- **Capacity planning**: Analyze traffic patterns and resource utilization
- **Root cause analysis**: Trace errors through the entire request lifecycle

## Future Enhancements

- Add custom spans for business-critical operations
- Implement alerting based on trace data
- Add trace sampling for high-traffic scenarios
- Integrate with log aggregation for correlated debugging
- Add custom metrics for business KPIs
