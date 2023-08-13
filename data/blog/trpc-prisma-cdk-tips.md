---
publishDate: "Aug 12 2023"
title: "How to run trpc and prisma on AWS with the CDK"
description: "Pitfalls, Tips and Tricks to get your tRPC / Prisma Combo into the cloud."
image: ~/assets/images/thumbnails/trpc_prisma_cdk_template.png
imageCreditUrl: https://www.midjourney.com/
tags: [trpc, prisma, code, release, aws]
---

We have had the pleasure of launching a microfrontend feature using trpc, prisma and the
cdk. While official documentation exists, putting that into practice we encountered a few
pitfalls. If you are also looking to leverage the power of tRPC and Prisma on your next app on top
of AWS, this post is for you!

We will first go through a primer on tRPC and Prisma. Knowing the why, we will go through the how,
and notable obstacles you might also face. Of course the whole code supporting this post is also
available as a working [template](https://github.com/flyck/trpc-prisma-cdk-example).

## Prisma and TRPC, Why?

TODO

## Frontend to Backend Connection

AWS usually has tons of options for any given requirement. Hosting a website is the exception. AWS
has only one service for content distribution: AWS Cloudfront. The AWS S3 storage service can
also do basic webhosting, but it is only regional and does not support https. A simple fact that
sends many innocent cloud engineers down the rabbit hole of configuring cloudfront correctly.

To mimic the local setup, the cloudfront distribution will serve as the entry point and it will
proxy all requests matching `/api/*` to the api gateway. To do this, you will already need a
special forwarding policy, otherwise you will get a `Bad Request` error:

```typescript
    const originRequestPolicy = new OriginRequestPolicy(this, "origin-request", {
      originRequestPolicyName: `${projectName}-forwarding`,
      headerBehavior: OriginRequestHeaderBehavior.allowList(
        "CloudFront-Forwarded-Proto",
        "Origin",
        "Content-Type"
      ),
      cookieBehavior: OriginRequestCookieBehavior.all(),
      queryStringBehavior: OriginRequestCookieBehavior.all()
    })
```

## The API Path

To ensure we have the same api structure locally as in the cloud, this proxy configuration works
best. Misconfiguration here can be hard to debug, especially in combination with Cloudfront acting
as the api proxy.

The Api Route config (`/api/trpc/{proxy}`):
```typescript
    const trpcResource = api.root.addResource("api")
    const trpcApiResource = trpcResource.addResource("trpc")
    trpcApiResource.addProxy({
      anyMethod: true,
      defaultIntegration: new LambdaIntegration(handler),
    })
```

Into a friendly api name which hides also the Api Gateway Stage (`/prod` prefix in this case):
```typescript
    // ...
    new ARecord(this, `WebsiteAliasRecord`, {
      zone: hostedZone,
      recordName: apiDomain,
      target: RecordTarget.fromAlias(new ApiGateway(api)),
    });
```

Into a cloudfront origin forwarding anything below `/api/*` to that nice record:
```typescript
      additionalBehaviors: {
        "/api/*": {
          origin: trpcApiOrigin,
          allowedMethods: AllowedMethods.ALLOW_ALL,
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: CachePolicy.CACHING_DISABLED,
          originRequestPolicy: originRequestPolicy
        },
      },
```

## Building and bundling

Naturally, when building on AWS, the most favorite deployment tool is the CDK. After a very long
period of undifferentiated hype, the CDK is finally met with some sober honesty (see voices from
[Alex DeBrie](https://www.alexdebrie.com/posts/serverless-framework-vs-cdk/) and [Yan
Cui](https://theburningmonk.com/2023/04/are-you-ready-for-this-top-5-earth-shattering-pros-and-cons-of-aws-cdk/)),
while it still remains the tool of choice for many companies today.

To build the api with the trpc, you will need the correct bundling steps. Point your `entry` at
the file exporting the lambda handler:
```typescript
      trpcLambda = new NodejsFunction(this, 'trpcApiFunction', {
        // ...
        entry: path.join(__dirname, '../../src/server/routers/index.ts'),
        handler: 'handler',
        // ...
      })
```


And you'll be able to bundle it with this config:
```typescript
        bundling: {
          commandHooks: {
            beforeBundling(inputDir: string, outputDir: string): string[] {
              return []
            },
            beforeInstall(inputDir: string, outputDir: string) {
              return []
            },
            afterBundling(inputDir: string, outputDir: string): string[] {
              return [
                `cd ${outputDir}`,
                `cp -R ${inputDir}/node_modules/prisma/libquery_engine-rhel-openssl-1.0.x.so.node ${outputDir}/`,
                `npx prisma generate --schema=${inputDir}/prisma/schema.prisma`,
                `cp -R ${inputDir}/prisma/ .`,
                `rm -rf node_modules/@prisma/engines`,
              ]
            },
          },
        },
```

Notably this also requires adding the query enginer required by the lambda runtime to your
`primsa.schema`:
```conf
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-1.0.x"]
}
```

## The Lambda Handler

This brings us to the handler itself. To expose the trpc router as a lambda handler, trpc offers a
nice [lamdba adapter](https://trpc.io/docs/server/adapters/aws-lambda):
```typescript
// src/server/router/index.ts
import { awsLambdaRequestHandler } from '@trpc/server/adapters/aws-lambda';

import { appRouter } from './_app';

// adapted example from: https://trpc.io/docs/v9/aws-lambda
export const handler = awsLambdaRequestHandler({
  router: appRouter,
});
```

## Connecting to the DB

Typically, as you're building on AWS, you will have your relational database running in RDS. To
get the database credentials which are usually stored in a `AWS Secretsmanager` Secret, we'll have
to move the prisma client into something async. That's because we will need to make sure to first
fetch the credentials before instantiating our trpc client.

To fetch it, you can make sure of this very crappy helper function. But hey, it works and its
cached!
```typescript
import { SecretsManager } from 'aws-sdk';

export const secretId = process.env.DB_SECRET_ARN;

type dbSecret = {
  host: string;
  username: string;
  password: string;
};

const secretsManager = new SecretsManager({
  region: 'eu-central-1',
});
let secret: dbSecret;

export async function fetchSecret() {
  if (process.env.NODE_ENV === 'development') {
    if (!process.env.DATABASE_URL)
      throw 'DB URL cannot be found in development env variables';
    return process.env.DATABASE_URL;
  }
  console.log(`trying to fetch secret ${secretId}`);
  if (!secretId) throw 'Env variable for secret not set';

  if (!secret) {
    console.log('fetching secret...');
    const secretresponse = await secretsManager
      .getSecretValue({ SecretId: secretId })
      .promise();
    if (!secretresponse.SecretString) throw 'empty response';
    secret = JSON.parse(secretresponse.SecretString);
    console.log(`secret fetched: ${secret.host},...`);
  } else {
    console.log('secret already fetched!');
    console.debug(secret.host);
  }

  console.log(`returning secret: ${secret.host},...`);
  return `postgres://${secret.username}:${secret.password}@${secret.host}/main`;
}

export let secretUrl: string;
(async () => {
  secretUrl = await fetchSecret();
})();
```

The nice thing is that it will work with your Dockerfile local setup and in your cloud environment
without adding any extra build flags.

You can then remove your static instantiation of the prisma client, as it will be async. Within
each trpc route, you need to then add:

```typescript
      await initPrisma()
```

Which calls this helper function to prefent extra calls:

```typescript
async function initPrisma() {
  console.log(secretId)
  if (!secret) {
    secret = await fetchSecret()
  }
  if (!prisma) {
    console.log("setting prisma...")
    prisma = new PrismaClient({
      log: ['query'],
      datasources: {
        db: {
          url: secret
        }
      }
    })
    console.log("prisma set.")
  } else {
    console.log("prisma already set.")
  }
}
```

## Review Apps

Last but not least the example repo also contains the code necessary to setup Review Apps - branch
based deployments of your frontend stack. One technique which we already went in-depth into in a
[previous post](https://double-trouble.dev/post/gitlab-review-apps-aws-vite), and we're using
again here.

## Rounding up

All in all working with trpc and prisma has been great fun, and as always, your first app will
always be the hardest.

We hope with this post we can help others on their journey and save maybe somebody some very late
night 😃. Also, the repo for the code behind this post is available
[here](https://github.com/flyck/trpc-prisma-cdk-example). Feel free to contribute if you have
suggestions!
