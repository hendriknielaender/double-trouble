---
publishDate: "Dec 25 2025"
title: "How to send OTLP metrics into Grafana's mimir using Typescript"
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

```sh
bun init -y -m $NEW_PROJECT_NAME
cd $NEW_PROJECT_NAME

```

Install the dependencies
```sh
bun add --dev @bufbuild/buf @bufbuild/protoc-gen-es@2

```

Download the basic opentelemetry metrics proto file, linked in the docs:
```sh
mkdir proto
wget https://raw.githubusercontent.com/open-telemetry/opentelemetry-proto/refs/heads/main/opentelemetry/proto/metrics/v1/metrics.proto -P proto
```


Additionally, download the proto file for the mimir request:
```sh
wget https://raw.githubusercontent.com/grafana/mimir/refs/heads/main/pkg/mimirpb/mimir.proto -P proto/
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

Next, run the protobuf generation command:
```sh
bunx buf generate

```

Both buf commands should have executed without warnings or errors.

If everything succeeded, `gen` folder should now contain a typescript file called `metrics_pb.ts`
and `mimir_pb.ts`.

## How to utilize the generated Code

```ts
import { create, toBinary } from "@bufbuild/protobuf";
import type { WriteRequest } from "./gen/mimir_pb";
import { WriteRequestSchema } from "./gen/mimir_pb";
import { compress } from "snappyjs";

const MIMIR_DEFAULT_PORT = 9009;
const MIMIR_ENDPOINT = `http://localhost:${MIMIR_DEFAULT_PORT}/api/v1/push`;
const FETCH_TIMEOUT_MS = 10_000;

const defaultHeaders = {
  "Content-Type": "application/x-protobuf",
  "X-Prometheus-Remote-Write-Version": "0.1.0",
  "X-Scope-OrgID": "demo",
  "Content-Encoding": "snappy",
};

export type MetricPushData = {
  labels: { key: string; value: string }[];
  samples: { timestampMs?: number; value: number }[];
};

export async function ingestTimeseries(data: MetricPushData[]) {
  const compressedBytes = serializeMetricsToBytes(data);

  const response = await fetch(MIMIR_ENDPOINT, {
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

export function serializeMetricsToBytes(data: MetricPushData[]): Uint8Array {
  const textEncoder = new TextEncoder();

  const currentTimestamp = Date.now();

  const metricsData = create(WriteRequestSchema, {
    timeseries: data.map((entry) => ({
      labels: entry.labels.map((label) => ({
        name: textEncoder.encode(label.key),
        value: textEncoder.encode(label.value),
      })),
      samples: entry.samples.map((entry) => ({
        value: entry.value,
        timestampMs: entry.timestampMs
          ? BigInt(entry.timestampMs)
          : BigInt(currentTimestamp),
      })),
    })),
  });

  const bytes = toBinary(WriteRequestSchema, metricsData);
  return compress(bytes);
}

export function serializeWriteRequest(data: WriteRequest): Uint8Array {
  const bytes = toBinary(WriteRequestSchema, data);
  return compress(bytes);
}

ingestTimeseries([
  {
    labels: [
      { key: "__name__", value: "answer" },
      { key: "region", value: "EU" },
    ],
    samples: [{ value: 42 }],
  },
  {
    labels: [
      { key: "__name__", value: "answer" },
      { key: "region", value: "US" },
    ],
    samples: [{ value: 42 }],
  },
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
