---
publishDate: "Dec 25 2025"
title: "How to send metrics into Grafana's Mimir using Typescript"
description: ""
image: "~/assets/images/thumbnails/grafana_typescript_metrics.png"
imageCreditUrl: https://gemini.google.com
tags: [grafana, mimir, metrics, ingestion, how-to, typescript]
---

Grafana mimir is the metrics engine, which powers the [grafana
cloud](https://grafana.com/products/cloud). It serves all of its over 7000 grafana customers, while it is fully
prometheus-compatible. These customers [notably](https://grafana.com/about/press/2025/09/30/grafana-labs-surpasses-400m-arr-and-7000-customers-gains-new-investors-to-accelerate-global-expansion/#:~:text=About%20Grafana%20Labs&text=Today%2C%20more%20than%2025%20million,to%20reduce%20noise%20and%20cost.) include [Anthropic](https://www.anthropic.com/), [Bloomberg](https://www.bloomberg.com), [NVIDIA](https://www.nvidia.com/) and Microsoft.

## General Options

According to the [docs](https://grafana.com/docs/mimir/latest/send/), there are several general
ways to send data into mimir:
- [prometheus](https://prometheus.io/) servers can forward metrics, using the `remote_write`
  [configuration](https://grafana.com/docs/mimir/latest/get-started/#configure-prometheus-to-write-to-grafana-mimir)
- grafana's metrics client [grafana alloy](https://grafana.com/docs/alloy/latest/) can forward
  it's hosts local metrics (i.e. CPU usage, memory, and more), using also a `remote_write`
  [configuration](https://grafana.com/docs/mimir/latest/get-started/#configure-grafana-alloy-to-write-to-grafana-mimir)
- historical data can be send via the `TSDB block upload` feature, which is supported for example
  by the [mimirtool cli](https://grafana.com/docs/mimir/latest/manage/tools/mimirtool/#backfill)

But these general options don't mention how to send metrics programmatically, from our application
code.

What if we want to send metrics into mimir, which dont come from another prometheus server, from
an individual server instance via alloy and one of its integrations, or from historical TSDB block
files?

## The OTLP Endpoint

If we look further in the docs we can find this useful endpoint in the [api
reference](https://grafana.com/docs/mimir/latest/references/http-api/#otlp):

`POST /otlp/v1/metrics`

> This endpoint accepts an HTTP POST request with a body that contains a request encoded with
> Protocol Buffers and optionally compressed with GZIP. You can find the definition of the
> protobuf message in metrics.proto.

It links to a `metrics.proto`
[file](https://github.com/open-telemetry/opentelemetry-proto/blob/main/opentelemetry/proto/metrics/v1/metrics.proto)
on github, which contains the protobuf schema.

But this `.proto` file is only the **schema** - how could we actually use it?

Note: To send logs, metrics, traces and more into mimir, the
[opentelemetry-js](https://open-telemetry.github.io/opentelemetry-js/modules/_opentelemetry_sdk-metrics.html)
sdk can also be used. TODO investigate

## How to utilize the Schema

To generate the Typescript boilerplate from the `.proto` schema, we can use the following steps
(all files are also
[here](https://github.com/flyck/mimir-metric-sender-examples/tree/main/proto_metrics)).

```sh
bun init -y -m $NEW_PROJECT_NAME
cd $NEW_PROJECT_NAME
mkdir src; mv index.ts src/
```

Install the dependencies:
```sh
bun add --dev @bufbuild/buf @bufbuild/protoc-gen-es@2

```

Download the basic opentelemetry metrics proto file, linked in the docs:
```sh
mkdir proto
wget https://raw.githubusercontent.com/open-telemetry/opentelemetry-proto/refs/heads/main/opentelemetry/proto/metrics/v1/metrics.proto -P proto
```

Create a basic buf configuration file `buf.yaml`
```yaml
version: v2
modules:
  - path: .
deps:
  - buf.build/opentelemetry/opentelemetry
```

Create the `buf.lock` lock-file
```sh
bunx buf dep update
```

This should have create the necessary `buf.lock`, which contains the hashes.

Create a basic code-gen config file `buf.gen.yaml`
```yaml
# Learn more: https://buf.build/docs/configuration/v2/buf-gen-yaml
version: v2
inputs:
  - directory: .
plugins:
  - local: protoc-gen-es
    opt: target=ts
    out: src/gen

```

Next, run the protobuf generation command:
```sh
bunx buf generate  --include-imports

```

Both buf commands should have executed without warnings or errors, and we should now have the
generated files in `src/gen`

## How to utilize the generated Code

```ts
import { create, toBinary } from "@bufbuild/protobuf";
import {
  MetricsDataSchema,
  MetricSchema,
  NumberDataPointSchema,
  type Metric,
} from "./gen/metrics_pb";

const MIMIR_OTLP_ENDPOINT = "http://localhost:9009/otlp/v1/metrics";
const FETCH_TIMEOUT_MS = 10_000;

export async function ingestOTLPMetrics(metrics: Metric[]) {
  const bytes = toBinary(
    MetricsDataSchema,
    create(MetricsDataSchema, {
      resourceMetrics: [
        {
          resource: { attributes: [] },
          scopeMetrics: [
            {
              scope: { name: "metric-sender", version: "1.0.0" },
              metrics,
            },
          ],
        },
      ],
    }),
  );

  const response = await fetch(MIMIR_OTLP_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-protobuf",
      "X-Scope-OrgID": "demo",
    },
    body: bytes,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      `Failed to send OTLP metrics: ${response.status} ${response.statusText}`,
      errorText,
    );
    throw new Error("Error sending OTLP metrics data");
  }

  console.info("OTLP metrics data sent successfully");
}

ingestOTLPMetrics([
  create(MetricSchema, {
    name: "answer",
    unit: "1",
    data: {
      case: "gauge",
      value: {
        dataPoints: [
          { region: "EU", value: 42 },
          { region: "US", value: 42 },
        ].map((dp) =>
          create(NumberDataPointSchema, {
            attributes: [
              {
                key: "region",
                value: {
                  value: { case: "stringValue", value: dp.region },
                },
              },
            ],
            timeUnixNano: BigInt(Date.now() * 1_000_000),
            value: { case: "asDouble", value: dp.value },
          }),
        ),
      },
    },
  }),
]);

```

Hint: Metrics and labels should follow the general
[convention](https://grafana.com/docs/grafana-cloud/send-data/otlp/otlp-format-considerations/#metric-and-label-name-conversion).

## How to test

To see if mimir got the metrics, we need to have the mimir instance running. Together with a
grafana instance, we can query the ingested metrics end-to-end.

For this, we can create a test setup as described
[here](https://grafana.com/docs/mimir/latest/get-started/play-with-grafana-mimir/):
```sh
git clone --depth 1 --single-branch https://github.com/grafana/mimir.git
cd mimir/docs/sources/mimir/get-started/play-with-grafana-mimir/

```

Starting the local setup:
```sh
docker compose up

```

After everything has started, we can start the ingestion script
```sh
bun run index.ts
```

And visit grafana, to create a dashboard to visualize the ingested metrics: http://localhost:9000/
