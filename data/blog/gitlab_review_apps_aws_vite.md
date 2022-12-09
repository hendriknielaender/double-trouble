---
title: "Draft: How to configure Vite on AWS for Gitlab Review Apps"
description: "A guide on how to make Merge Requests more awesome! "
image: "https://pluspng.com/img-png/gitlab-logo-png-press-and-logos-gitlab-1750x1225.png"
tags: [aws, vite, gitlab, reviews apps, code reviews]
---
Engineering teams often struggle working in just a few shared cloud environments.
Deployments accidentally overwrite each other make it a hassle
to easily provide reviewable apps for product managers, designers or QA.

Here Gitlab `Review Apps` come to the rescue - an integrated way to deploy dynamic
branch-specific environments for individual reviews. Natively they come with support for
kubernetes, but this is just the default, which can be easily customized.

## CI/CD

To enable these, you can extend your pipeline with these jobs below.

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

## Code

Regarding code customization, there is not a whole lot to do.

[React Router](https://reactrouter.com/en/6.4.5/router-components/router) needs to have the vite [BASE_URL](https://vitejs.dev/guide/env-and-mode.html#env-variables) added as an option:
```javascript
<Router basename={import.meta.env.BASE_URL}>
```

Set the [env var](https://vitejs.dev/guide/build.html#public-base-path) to your needs, e.g: `vite build --base=/my/public/path`

If your app is served from a sub-directory on your server, you’ll want to set this to the sub-directory.
A properly formatted basename should have a leading slash, but no trailing slash.

## Cloudfront

Once these jobs are added the code is deployed into the subdirectory appropriately, but
there is still a problem with the routing. The key issue being the default root object here.
Cloudfront natively only supports it for the root directory, which will leave you with a
"file not found" greeting for the review url.

To support default indexes also in subdirectories, there is a work-around available using
Cloudfront Functions. Instructions can be found in the AWS blog [here](https://aws.amazon.com/blogs/networking-and-content-delivery/implementing-default-directory-indexes-in-amazon-s3-backed-amazon-cloudfront-origins-using-cloudfront-functions/). Once these are in place,
the setup is complete.

Now you should have a review app spun up for every MR, which gets automatically cleaned up on merge,
which you can pass to your fellow reviewer.

## Months later

We've been using the review apps productively for months now in multiple projects, and we can no
longer do without them.

Having a branch-based deployment even for simple things like a frontend change works great and
enhances the workflow. Context switches required for performing a review are decreased.

Still on the list are changes needed
