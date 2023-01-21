---
title: "How to configure Vite on AWS for Gitlab Review Apps"
description: "A guide on how to make Merge Requests more awesome! "
image: ~/assets/images/thumbnails/gitlab_review_apps_aws2.png
imageCreditUrl: https://labs.openai.com/
tags: [aws, vite, gitlab, reviews apps, code reviews]
---
Engineering teams often struggle working in just a few shared cloud environments.
Deployments accidentally overwrite each other make it a hassle
to easily provide reviewable apps for product managers, designers or QA.

Here Gitlab `Review Apps` come to the rescue - an integrated way to deploy dynamic
branch-specific environments for individual reviews. Natively they come with support for
kubernetes, but this is just the default, which can be easily customized.

In this post we'll show the customizations needed to make review apps work in a typical aws
website hosting setup: Cloudfront + S3.

## Code

Regarding code customization, it's mostly the routing that needs changing.

The [React Router](https://reactrouter.com/en/6.4.5/router-components/router) needs to have the vite [BASE_URL](https://vitejs.dev/guide/env-and-mode.html#env-variables) added as an option:
```javascript
<Router basename={import.meta.env.BASE_URL}>
```

This [env var](https://vitejs.dev/guide/build.html#public-base-path) can then be changed at
runtime via a cli parameter, which we'll make use of in the next section.

```bash
vite build --base=/my/public/path
```

## CI/CD

In your pipeline you'll need two new jobs `deploy_review` and `stop_review`:

```yaml
deploy_review:
  stage: deploy
  script:
    - npx vite build --base=/${$CI_COMMIT_REF_SLUG}/
    - aws s3 cp ./dist s3://${BUCKET_NAME}/${CI_ENVIRONMENT_SLUG}/ --recursive
    # cache busting
    - aws s3 cp dist/index.html s3://${BUCKET_NAME}/${CI_COMMIT_REF_SLUG}/ --cache-control "max-age=0,no-cache,no-store,must-revalidate"
  environment:
    name: review/$CI_COMMIT_REF_SLUG
    url: https://app.example.com/$CI_ENVIRONMENT_SLUG
    on_stop: stop_review
  only:
    - merge_requests
  except:
    - master

stop_review:
  script:
    - aws s3 rm --recursive s3://${BUCKET_NAME}/${CI_COMMIT_REF_SLUG}/
  when: manual
  variables:
    BUCKET_NAME: $BUCKET_NAME
  environment:
    name: review/$CI_COMMIT_REF_SLUG
    action: stop
  only:
    - merge_requests
```


## Cloudfront Infrastructure

Once these jobs are added the code is deployed into the subdirectory appropriately, but
there is still a problem with the routing. The key issue being the default root object here.
Cloudfront natively only supports it for the root directory, which will leave you with a
"file not found" greeting for the review URL.

To support default indexes also in sub-directories, there is a work-around available using
Cloudfront Functions. Instructions can be found in the AWS blog [here](https://aws.amazon.com/blogs/networking-and-content-delivery/implementing-default-directory-indexes-in-amazon-s3-backed-amazon-cloudfront-origins-using-cloudfront-functions/). Once these are in place,
the setup is complete.

Key components to have this work is the function code itself:

```javascript
function handler(event) {
  var request = event.request;
  // the uri equals to the request path
  var uri = request.uri;

  if (uri.endsWith('/')) {
    request.uri += 'index.html';
  }
  else if (!uri.includes('.')) {
    request.uri += '/index.html';
  }

  return request;
}
```

And the IaC code the configures it as a `VIEWER_REQUEST` type function. Below you can find an
example for the CDK.

```javascript
import { Function, FunctionCode, FunctionEventType } from "aws-cdk-lib/aws-cloudfront";

const subDirFunction = new Function(stack, 'SubDirectoryIndex', {
  code: FunctionCode.fromFile({
    filePath: path.join(__dirname, "subdirIndex.js")
  }),
})

// this goes into your origin configuration:
functionAssociations: stage != "prod" ? [{
  function: subDirFunction,
  eventType: FunctionEventType.VIEWER_REQUEST,
}] : undefined
```

Now you should have a review app spun up for every MR, which gets automatically cleaned up on merge,
which you can pass to your fellow reviewer.

## Months later

We've been using the review apps productively for months now in multiple projects, and we can no
longer do without them.

Having a branch-based deployment even for simple things like a frontend change works great and
enhances the workflow. Context switches required for performing a review are decreased.

What we're yet to add are review environments for backend changes. Should we straightforward with
API Gateway stages and could be another cool addition.
