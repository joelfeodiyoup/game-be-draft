Here's how to set up performance monitoring for a Node.js API:

  Development/Local Monitoring

  1. Built-in Node.js Profiling
  # CPU profiling
  node --inspect your-app.js
  # Then open chrome://inspect in Chrome

  2. Clinic.js Suite
  npm install -g clinic
  clinic doctor -- node your-app.js  # Detects performance issues
  clinic flame -- node your-app.js   # CPU flame graphs
  clinic bubbleprof -- node your-app.js  # Async operations

  3. HTTP Request Logging
  // Using morgan for Express
  const morgan = require('morgan');
  app.use(morgan('dev')); // Logs: GET /api/users 200 15.234 ms

  4. Local Benchmarking
  # autocannon for load testing
  npm install -g autocannon
  autocannon http://localhost:3000/api/users

  5. Express Status Monitor (real-time dashboard)
  const monitor = require('express-status-monitor');
  app.use(monitor());
  // Visit http://localhost:3000/status for live stats

  Production Monitoring

  Setup Components:

  1. Application Performance Monitoring (APM) Agent

  Install the vendor's agent as the FIRST thing in your app:

  // Must be first import!
  require('dd-trace').init(); // Datadog
  // OR
  require('newrelic'); // New Relic
  // OR
  require('elastic-apm-node').start(); // Elastic APM

  const express = require('express');
  // ... rest of your app

  What it does:
  - Automatically instruments HTTP requests, database calls, external APIs
  - Tracks response times, error rates
  - Creates distributed traces across microservices
  - Monitors memory, CPU usage

  2. Structured Logging

  const pino = require('pino');
  const logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    // Production: send to stdout, collect with log aggregator
  });

  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      logger.info({
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: Date.now() - start,
        userId: req.user?.id,
      });
    });
    next();
  });

  Ship logs to: Datadog, CloudWatch, Elasticsearch, etc.

  3. Error Tracking

  const Sentry = require('@sentry/node');
  Sentry.init({ dsn: process.env.SENTRY_DSN });

  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.errorHandler());

  Captures exceptions with full context (stack traces, request data, user info)

  4. Custom Metrics (optional but recommended)

  // Using prom-client for Prometheus metrics
  const promClient = require('prom-client');

  const httpRequestDuration = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
  });

  // Middleware to track custom metrics
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      httpRequestDuration
        .labels(req.method, req.route?.path || req.path, res.statusCode)
        .observe((Date.now() - start) / 1000);
    });
    next();
  });

  // Expose metrics endpoint
  app.get('/metrics', async (req, res) => {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
  });

  5. OpenTelemetry (vendor-neutral approach)

  const { NodeSDK } = require('@opentelemetry/sdk-node');
  const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

  const sdk = new NodeSDK({
    instrumentations: [getNodeAutoInstrumentations()],
    // Can send to Datadog, Grafana, Jaeger, etc.
  });

  sdk.start();

  Complete Setup Example

  // 1. APM Agent (MUST be first!)
  if (process.env.NODE_ENV === 'production') {
    require('dd-trace').init({
      service: 'my-api',
      env: process.env.NODE_ENV,
    });
  }

  // 2. Error tracking
  const Sentry = require('@sentry/node');
  Sentry.init({ dsn: process.env.SENTRY_DSN });

  // 3. Structured logging
  const pino = require('pino');
  const logger = pino();

  const express = require('express');
  const app = express();

  // 4. Request tracking
  app.use(Sentry.Handlers.requestHandler());

  // 5. HTTP logging (dev mode)
  if (process.env.NODE_ENV === 'development') {
    const morgan = require('morgan');
    app.use(morgan('dev'));
  }

  // Your routes...
  app.get('/api/users', async (req, res) => {
    logger.info('Fetching users');
    // ... your logic
  });

  // 6. Error handler
  app.use(Sentry.Handlers.errorHandler());

  // 7. Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // 8. Metrics endpoint (if using Prometheus)
  app.get('/metrics', async (req, res) => {
    // expose metrics
  });

  Key Differences: Dev vs Production

  | Aspect         | Development                  | Production                      |
  |----------------|------------------------------|---------------------------------|
  | Overhead       | Can be slow, detailed        | Must be lightweight             |
  | Tools          | Clinic.js, --inspect, morgan | APM agents, log aggregation     |
  | Focus          | Find bottlenecks, profile    | Monitor health, alert on issues |
  | Data retention | Local, temporary             | Stored long-term in SaaS        |
  | Cost           | Free tools                   | Paid SaaS services              |

  What to Monitor in Production

  1. Golden Signals:
    - Latency (response times)
    - Traffic (requests per second)
    - Errors (error rate)
    - Saturation (CPU, memory usage)
  2. Business Metrics:
    - API endpoint usage
    - User actions
    - Database query performance
  3. Infrastructure:
    - Container/server health
    - Database connections
    - External API dependencies

  The typical stack is: APM (Datadog/New Relic) + Error Tracking (Sentry) + Structured Logs (Pino → Log aggregator)