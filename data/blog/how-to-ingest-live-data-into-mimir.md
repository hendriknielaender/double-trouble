---
publishDate: "Dec 25 2025"
title: "How to send OTLP metrics into Grafana's mimir using Typescript"
description: ""
image: "~/assets/images/thumbnails/agile-roadmaps-1.png"
imageCreditUrl: https://midjourney.com
tags: [grafana, mimir, metrics, ingestion, how-to, typescript]
---

Grafana mimir is the metrics engine, which powers the [grafana
cloud](https://grafana.com/products/cloud). It serves all of its over 7000 grafana customers, while it is fully
prometheus-compatible. These customers [notably](https://grafana.com/about/press/2025/09/30/grafana-labs-surpasses-400m-arr-and-7000-customers-gains-new-investors-to-accelerate-global-expansion/#:~:text=About%20Grafana%20Labs&text=Today%2C%20more%20than%2025%20million,to%20reduce%20noise%20and%20cost.) include [Anthropic](https://www.anthropic.com/), [Bloomberg](https://www.bloomberg.com), [NVIDIA](https://www.nvidia.com/) and [Microsoft](https://www.microsoft.com/).

## General Options

According to the [docs](https://grafana.com/docs/mimir/latest/send/), there are several ways to
send data into mimir:
- [prometheus](https://prometheus.io/) servers can forward metrics, using the `remote_write`
  [configuration](https://grafana.com/docs/mimir/latest/get-started/#configure-prometheus-to-write-to-grafana-mimir)
- grafana's metrics client [grafana alloy](https://grafana.com/docs/alloy/latest/) can forward
  it's hosts local metrics (i.e. CPU usage, memory, and more), using also a `remote_write`
  [configuration](https://grafana.com/docs/mimir/latest/get-started/#configure-grafana-alloy-to-write-to-grafana-mimir)
- historical data can be send via the `TSDB block upload` feature, which is supported for example
  by the [mimirtool cli](https://grafana.com/docs/mimir/latest/manage/tools/mimirtool/#backfill)


But what if you want to send metrics into mimir, which dont come from another prometheus server,
from an individual server instance via alloy and one of its integrations, or from historical TSDB
block files?

## The OTLP Endpoint

If we look further in the docs we can find this useful endpoint in the [api reference](https://grafana.com/docs/mimir/latest/references/http-api/#otlp):

`POST /otlp/v1/metrics`

> This endpoint accepts an HTTP POST request with a body that contains a request encoded with Protocol Buffers and optionally compressed with GZIP. You can find the definition of the protobuf message in metrics.proto.

It links to a `metrics.proto`
[file](https://github.com/open-telemetry/opentelemetry-proto/blob/main/opentelemetry/proto/metrics/v1/metrics.proto)
on github, which contains the protobuf schema.

But this `.proto` file is only the schema - how could we actually use it?

## How to generate the Code

To generate the Typescript boilerplate from the `.proto` schema, we can use the following steps

```sh
bun init -y -m $NEW_PROJECT_NAME
cd $NEW_PROJECT_NAME
```

Install the dependencies
```sh
bun add --dev @bufbuild/buf @bufbuild/protoc-gen-es@2
```

Download the proto file (TODO fix command)
```sh
curl
https://github.com/open-telemetry/opentelemetry-proto/blob/main/opentelemetry/proto/metrics/v1/metrics.proto
-o metrics.proto
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
    out: gen
```

The `gen` folder should now contain a typescript file called `metrics_pb.ts`.

## Utilizing the generated code

```ts
import type { WriteRequest } from "@/gen/mimir_pb";
import type { MetricPushData } from "@/services/metrics/serializer";
import {
  serializeMetricsToBytes,
  serializeWriteRequest,
} from "@/services/metrics/serializer";

const MIMIR_DEFAULT_PORT = 8080;
const FETCH_TIMEOUT_MS = 10_000;

const defaultHeaders = {
  "Content-Type": "application/x-protobuf",
  "X-Prometheus-Remote-Write-Version": "0.1.0",
  "X-Scope-OrgID": "demo",
  "Content-Encoding": "snappy",
};


export async function ingestTimeseries(data: MetricPushData[]) {
  const compressedBytes = serializeMetricsToBytes(data);
  const endpoint = 'http://localhost:8080/api/v1/push';

  const response = await fetch(endpoint, {
    method: "POST",
    headers: defaultHeaders,
    body: compressedBytes,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      `Failed to send metrics: ${response.status} ${response.statusText}`,
      errorText,
    );
    throw new Error("Error sending metrics data");
  }

  console.info("Metrics data sent successfully");
}

export async function sendWriteRequest(data: WriteRequest) {
  let compressedMetrics: Uint8Array;
  try {
    compressedMetrics = serializeWriteRequest(data);
  } catch (error) {
    throw new Error(`Failed to serialize metrics data: ${error}`);
  }

  const endpoint = await getMimirEndpoint();

  const response = await fetch(endpoint, {
    method: "POST",
    headers: defaultHeaders,
    body: compressedMetrics,
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      `Failed to send metrics: ${response.status} ${response.statusText}`,
      errorText,
    );
    throw new Error("Error sending metrics data");
  }

  console.info("Metrics data sent successfully");
}
```
