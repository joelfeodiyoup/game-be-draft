skip to:contentpackage searchsign in

Pro
Teams
Pricing
Documentation
npm
Search packages
Search
@opentelemetry/sdk-node
TypeScript icon, indicating that this package has built-in type declarations
0.217.0 • Public • Published 2 hours ago
OpenTelemetry SDK for Node.js
NPM Published Version Apache License

Note: This is an experimental package under active development. New releases may include breaking changes.

This package provides the full OpenTelemetry SDK for Node.js including tracing and metrics.

Quick Start
Note: Much of OpenTelemetry JS documentation is written assuming the compiled application is run as CommonJS. For more details on ECMAScript Modules vs CommonJS, refer to esm-support.

To get started you need to install @opentelemetry/sdk-node, a metrics and/or tracing exporter, and any appropriate instrumentation for the node modules used by your application.

Installation
$ # Install the SDK
$ npm install @opentelemetry/sdk-node

$ # Install exporters and plugins
$ npm install \
    @opentelemetry/exporter-trace-otlp-proto \ # add tracing exporters as needed
    @opentelemetry/exporter-prometheus \ # add metrics exporters as needed
    @opentelemetry/instrumentation-http # add instrumentations as needed

$ # or install all officially supported core and contrib plugins
$ npm install @opentelemetry/auto-instrumentations-node
Note: this example is for Node.js. See examples/opentelemetry-web for a browser example.

Initialize the SDK
Before any other module in your application is loaded, you must initialize the SDK. If you fail to initialize the SDK or initialize it too late, no-op implementations will be provided to any library which acquires a tracer or meter from the API.

This example uses Jaeger (via OTLP) and Prometheus, but exporters exist for other tracing backends. OTLP in particular is widely supported by a wide-variety of backends. As shown in the installation instructions, exporters passed to the SDK must be installed alongside @opentelemetry/sdk-node.

const opentelemetry = require("@opentelemetry/sdk-node");
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-proto");
const { PrometheusExporter } = require("@opentelemetry/exporter-prometheus");
const {
  getNodeAutoInstrumentations,
} = require("@opentelemetry/auto-instrumentations-node");

const otlpExporter = new OTLPTraceExporter();
const prometheusExporter = new PrometheusExporter();

const sdk = new opentelemetry.NodeSDK({
  // Optional - if omitted, the tracing SDK will be initialized from environment variables
  traceExporter: otlpExporter,
  // Optional - If omitted, the metrics SDK will not be initialized
  metricReader: prometheusExporter,
  // Optional - you can use the metapackage or load each instrumentation individually
  instrumentations: [getNodeAutoInstrumentations()],
  // See the Configuration section below for additional  configuration options
});

sdk.start();

// You can also use the shutdown method to gracefully shut down the SDK before process shutdown
// or on some operating system signal.
const process = require("process");
process.on("SIGTERM", () => {
  sdk
    .shutdown()
    .then(
      () => console.log("SDK shut down successfully"),
      (err) => console.log("Error shutting down SDK", err)
    )
    .finally(() => process.exit(0));
});
Configuration
Below is a full list of configuration options which may be passed into the NodeSDK constructor;

autoDetectResources
Detect resources automatically from the environment using the default resource detectors. Default true.

contextManager
Use a custom context manager. Default: AsyncLocalStorageContextManager

textMapPropagator
Use a custom propagator. Default: CompositePropagator using W3C Trace Context and Baggage

logRecordProcessor
Deprecated, please use logRecordProcessors instead.

logRecordProcessors
An array of log record processors to register to the logger provider.

mergeResourceWithDefaults
Merge user-provided resources with the default resource. Default true. The default will change to false in a future iteration of this package.

metricReader
Add a MetricReader that will be passed to the MeterProvider. If metricReader is not configured, the metrics SDK will not be initialized and registered.

views
A list of views to be passed to the MeterProvider. Accepts an array of View-instances. This parameter can be used to configure explicit bucket sizes of histogram metrics.

instrumentations
Configure instrumentations. By default none of the instrumentation is enabled, if you want to enable them you can use either metapackage or configure each instrumentation individually.

resource
Configure a resource. Resources may also be detected by using the autoDetectResources method of the SDK.

resourceDetectors
Configure resource detectors. By default, the resource detectors are [envDetector, processDetector, hostDetector]. NOTE: In order to enable the detection, the parameter autoDetectResources has to be true.

If resourceDetectors was not set, you can also use the environment variable OTEL_NODE_RESOURCE_DETECTORS to enable only certain detectors, or completely disable them:

env
host
os
process
serviceinstance (experimental)
all - enable all resource detectors above
NOTE: future versions of @opentelemetry/sdk-node may include additional detectors that will be covered by this scope.
none - disable resource detection
NOTE: env and os are Node.js-specific detectors with no equivalent in the OpenTelemetry declarative configuration spec. They are supported when using the detection/development block in a declarative config file.

For example, to enable only the env, host detectors:

export OTEL_NODE_RESOURCE_DETECTORS="host,env"
NOTE: The order set on OTEL_NODE_RESOURCE_DETECTORS will be respected and the detectors will be executed in order. For example, if you have OTEL_RESOURCE_ATTRIBUTES="service.instance.id=custom-name", but also serviceinstance and env on OTEL_NODE_RESOURCE_DETECTORS, it can have 2 scenarios:

OTEL_NODE_RESOURCE_DETECTORS="serviceinstance,env" will have the service.instance.id as custom-name
OTEL_NODE_RESOURCE_DETECTORS="env,serviceinstance" will have the service.instance.id as a random UUID
sampler
Configure a custom sampler. By default, all traces will be sampled.

spanProcessor
Deprecated, please use spanProcessors instead.

spanProcessors
An array of span processors to register to the tracer provider.

traceExporter
Configure a trace exporter. If an exporter is configured, it will be used with a BatchSpanProcessor. If an exporter OR span processor is not configured programmatically, this package will auto setup the default otlp exporter with http/protobuf protocol with a BatchSpanProcessor.

spanLimits
Configure tracing parameters. These are the same trace parameters used to configure a tracer.

serviceName
Configure the service name.

Disable the SDK from the environment
Disable the SDK by setting the OTEL_SDK_DISABLED environment variable to true.

Configure log level from the environment
Set the log level by setting the OTEL_LOG_LEVEL environment variable to enums:

NONE,
ERROR,
WARN,
INFO,
DEBUG,
VERBOSE,
ALL.
The default level is INFO.

Configure Exporters from environment
This is an alternative to programmatically configuring an exporter or span processor. For traces this package will auto setup the default otlp exporter with http/protobuf protocol if traceExporter or spanProcessor hasn't been passed into the NodeSDK constructor.

Exporters
Environment variable	Description
OTEL_TRACES_EXPORTER	List of exporters to be used for tracing, separated by commas. Options include otlp, zipkin, and none. Default is otlp. none means no autoconfigured exporter.
OTEL_LOGS_EXPORTER	List of exporters to be used for logging, separated by commas. Options include otlp, console and none. Default is otlp. none means no autoconfigured exporter.
OTLP Exporter
Environment variable	Description
OTEL_EXPORTER_OTLP_PROTOCOL	The transport protocol to use on OTLP trace, metric, and log requests. Options include grpc, http/protobuf, and http/json. Default is http/protobuf.
OTEL_EXPORTER_OTLP_TRACES_PROTOCOL	The transport protocol to use on OTLP trace requests. Options include grpc, http/protobuf, and http/json. Default is http/protobuf.
OTEL_EXPORTER_OTLP_METRICS_PROTOCOL	The transport protocol to use on OTLP metric requests. Options include grpc, http/protobuf, and http/json. Default is http/protobuf.
OTEL_EXPORTER_OTLP_LOGS_PROTOCOL	The transport protocol to use on OTLP log requests. Options include grpc, http/protobuf, and http/json. Default is http/protobuf.
OTEL_METRICS_EXPORTER	Metrics exporter to be used. options are otlp, prometheus, console or none. Default is otlp.
OTEL_METRIC_EXPORT_INTERVAL	The export interval when using a push Metric Reader. Default is 60000.
OTEL_METRIC_EXPORT_TIMEOUT	The export timeout when using a push Metric Reader. Default is 30000.
Additionally, you can specify other applicable environment variables that apply to each exporter such as the following:

OTLP exporter environment configuration
Zipkin exporter environment configuration
Enable OpenTelemetry SDK internal metrics from environment
OpenTelemetry defines metrics for monitoring SDK components. Until this spec is stabilized, the following environment variable must be used to enable these metrics:

OTEL_NODE_EXPERIMENTAL_SDK_METRICS=true
Currently a subset of the specified metrics are implemented. See the following linkes for details:

Logger metrics: LoggerMetrics.ts
Span metrics: TracerMetrics.ts
Useful links
For more information on OpenTelemetry, visit: https://opentelemetry.io/
For more about OpenTelemetry JavaScript: https://github.com/open-telemetry/opentelemetry-js
For help or feedback on this project, join us in GitHub Discussions
License
Apache 2.0 - See LICENSE for more information.

Readme
Keywords
opentelemetrynodejstracingprofilingmetricsstatsmonitoring
Provenance
Built and signed on
GitHub Actions
View build summary
Source Commit

github.com/open-telemetry/opentelemetry-js@74cde1b
Build File

.github/workflows/publish-to-npm.yml
Public Ledger

Transparency log entry
Share feedback
Package Sidebar
Install
npm i @opentelemetry/sdk-node


Repository
github.com/open-telemetry/opentelemetry-js

Homepage
github.com/open-telemetry/opentelemetry-js/tree/main/experimental/packages/opentelemetry-sdk-node

Weekly Downloads
10,638,298

Version
0.217.0


License
Apache-2.0

Last publish
2 hours ago

Collaborators
dyladan
pichlermarc
overbalance
npmjs-account
trentm
martinkuba
Analyze security with SocketCheck bundle sizeView package healthExplore dependencies
Report malware
Footer
Support
Help
Advisories
Status
Contact npm
Company
About
Blog
Press
Terms & Policies
Policies
Terms of Use
Code of Conduct
Privacy
Viewing @opentelemetry/sdk-node version 0.217.0