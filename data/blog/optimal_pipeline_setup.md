---
publishDate: "Jan 21 2024"
title: "How to setup efficient Pipeline Triggers"
description: "How we tune our CI/CD pipelines for optimal workflows and minimal waiting times"
image: "~/assets/images/thumbnails/optimal_pipeline_setup_dalle.png"
imageCreditUrl: https://labs.openai.com
tags: [cloud, infrastructure, IaC, gitlab]
---

This post has examples for gitlab, but similar concepts can also be applied to for example github
actions.

TODO add config examples

## Caching & Artifacts

Use install caches and build artifacts, with fallback caches to master in case the dependencies
didnt change.

```yaml
example-job:
  script:
    - yarn install --frozen-lockfile --check-files
  cache:
    paths:
      - node_modules/
```

```
variables:
  FF_USE_FASTZIP: "true"
  # These can be specified per job or per pipeline (slowest, slow, default, fast, and fastest)
  ARTIFACT_COMPRESSION_LEVEL: "fastest"
  CACHE_COMPRESSION_LEVEL: "fastest"
```

## Deployment Job Triggers

The deployment to prod on master is a manual action and can be triggered immediately. It doesnt
have to wait for the dev and test deployment to succeed again first. This is so a hotfix can be
deployed to prod asap via CI/CD without unnecessary steps. A merged MR will anyway have had the
dev and test deployment succeeding, so it is safe to deploy immediately to prod in 99% of the
cases.

## Merging Stages

Adding more and more stages makes the pipeline easy to understand and satisfactory to look at, but
often it comes at the detriment of speed.

When tests are fast, it might be more advantageous to execute the test together with the build
command, instead of spinning up a whole new environment in a subsequent job. In other cases it
might make sense to merge the install job with the build or similar. An optimal pipeline is one
that adapts to changes in the repository, to be always as fast as possible.

## The Build Container

If you use heavy dependencies during deployment, it can be worth it to bundle them already into
the build container. Maintaining 1 or 2 build containers is usually within reason, while it should
of course not go out of hand.

Using a combination of tool-specific containers can get you around having to maintain your own
CI/CD container, but keep in mind anything that has to be installed during runtime depends on
package repostories, which dont have 100% uptime.

TODO section needs rework

## Use Great Tooling (Node Specific)

Staying up to date, especially in javascript is essential. Better tools spring up all the time and
can bring you the deciding advantage in your pipeline. With node we have this preference in terms
of tooling: bun > pnpm > yarn2 > yarn > npm.

## Review Apps

Review apps or branch-based deployments is something nobody should sleep on. Especially with
serverless, once a team exceeds a certain size, branch based environments are a big help. When you
have to worry overwriting the deployment of somebody else in the dev/test/qa stage, you are
spending time on something that could be easily solved.


Review apps are also something that is highly appreciated by PMs once they understand it. For tips
how to set up a review up check our related post [How to configure Vite on AWS for Gitlab Review
Apps](https://double-trouble.dev/post/gitlab-review-apps-aws-vite/).

## Pipeline Workflows

It can be helpful to think of pipelines in terms of their user workflow, like an application. What
are the usecases the pipeline should be supported?

Probably at least those two, but maybe more:
- It is only an IaC change
- It is only a code change

For each supported use-case we can ask: How long until I can execute the job that I need to be
executed? If any use-case somehow needs a bunch of unrelated other jobs to be executed first, then
this can be optimized. The ideal waiting time is 0.
