---
publishDate: "Jan 29 2024"
title: "Efficient CI/CD Pipeline Triggers: A Step-by-Step Guide for GitLab"
description: "Discover strategies to fine-tune your CI/CD pipelines in GitLab for maximum efficiency and reduced wait times, complete with practical examples and tips."
image: "~/assets/images/thumbnails/optimal_pipeline_dalle.jpg"
imageCreditUrl: https://labs.openai.com
tweet: "https://twitter.com/doubletrblblogs/status/1752040836450132384"
tags: [cloud, infrastructure, IaC, GitLab, CI/CD, DevOps, pipeline, automation]
---

At work we have spend **a lot** of time together, looking the pipeline of a massive monorepo we
are handling. Through countless hours of doing this, we've arrived at a few "good defaults", or
useful techniques, which we also found useful in other repos. In this post we will share these
general techniques with concrete examples for gitlab, but similar concepts could also be applied
to other CI/CD platforms.

## Use Caching & Artifacts

Many pipeline systems have the concept of caching and artifacts, and so does
[gitlab](https://docs.gitlab.com/ee/ci/caching/). Our recommendation is to use caches for install
dependencies and artifacts for build results, with fallback caches to the main branch in case the
dependencies didn't change. This setup enables pull requests to bypass the installation job when
there are no changes in dependencies.  has changed. Similarly, the artifact has to be build only
once.

```yaml
variables:
  CACHE_FALLBACK_KEY: repo-name-main-node-modules.zip-7

install:
  script:
    - yarn install --frozen-lockfile --check-files
  cache:
    paths:
      - node_modules/
```

```yaml
build-job:
  needs:
    - job: install
      optional: true
```

Cache compression itself can be optimized, but watch out, some of these will not work well in combination with pnpm:
```yaml
variables:
  FF_USE_FASTZIP: "true"
  # These can be specified per job or per pipeline (slowest, slow, default, fast, and fastest)
  ARTIFACT_COMPRESSION_LEVEL: "fastest"
  CACHE_COMPRESSION_LEVEL: "fastest"
```


## Finetune Job Triggers

The deployment to production on the main branch generally should be a manual action that can be
triggered immediately. It doesn't have to wait for the dev and test deployment to succeed again
first. A merged MR will anyway have had all necessary safety checks succeeding in the Pull Request
already. This make it safe to deploy immediately to production after merge in 99% of the
cases. This also makes it so a hot-fix can be deployed to production asap without waiting for some
dev deployment first.

In gitlab, job dependencies are specified via the [needs](https://docs.gitlab.com/ee/ci/yaml/#needs) keyword:
```yaml
  needs: []
```

## Optimize Common Scenarios

If the pipeline feels slow, it can be helpful to think of pipelines in terms of their user
workflow, like an application. What are the use-cases the pipeline should be supported?

We often see these three across our repos:
- It is only an IaC change
- It is only a code change
- It is not a dependency change

For each supported use-case we can ask: How much waiting time is there in the pipeline, until I
the job that my workflows needs will be executed? If any use-case somehow needs a bunch of
unrelated other jobs to be executed first, then this can be optimized.

The ideal waiting time is 0.

## Find Dependencies between Stages

Adding more and more stages makes the pipeline easy to understand and satisfactory to look at, but
often it comes at the detriment of speed. Therefor, removing and merging stages might yield a
faster pipeline, which is still understandable.

When tests are fast, it might even be advantageous to execute the test together with the build
command, instead of spinning up a whole new docker environment in a subsequent action. In other
cases it might make sense to merge the install job with the build or similar. An optimal pipeline
is one that adapts to changes in the repository, to be always as fast as possible.

For further reading, the team at gitlab also has an article focussing on this topic: [Pipeline
Efficiency](https://docs.gitlab.com/ee/ci/pipelines/pipeline_efficiency.html).

## Speed up the Build Container

If you use big dependencies during deployment, it can be worth it to bundle them already into the
build container. Maintaining 1 or 2 build containers is usually within reason, while it should of
course not go out of hand.

If all you need is the aws cli, note that there is an [official docker
image](https://hub.docker.com/r/amazon/aws-cli) for that by AWS. Using a combination of such
tool-specific containers can get you around having to maintain your own CI/CD container, but keep
in mind anything that has to be installed during runtime depends on package repositories, which
don't have 100% up-time.

Note that if you use shared gitlab runners in your AWS account, it might be useful to use
company-wide shared build containers. This allows for easier caching of the build container on the
runners, so it doesn't have to be downloaded for every job.

## Use Great Tools

Staying up to date on tools, especially in JavaScript is essential. Better tools spring up all the
time and can bring you the deciding advantage in your pipeline. What has been amazing with
JavaScript is that especially package management tools get faster with each iteration. With node
we have this preference in terms of tooling: bun > pnpm > yarn2 > yarn > npm.

If you don't stay up to date on tooling for you language, you might be missing out on a much fast
pipeline. Especially with things like package management, it's probably worth it to give that new
tool a shot to potentially have a huge time saving in the end.

```yaml
install:
  stage: install
  cache:
    -
      <<: *global_cache_node_modules
      policy: pull-push
  before_script:
    - corepack enable
    - corepack prepare pnpm@latest-8 --activate
    - pnpm config set store-dir .pnpm-store
  script:
    - pnpm install
```

## Leverage Review Apps

Review apps or branch-based deployments is something nobody should sleep on. Especially with
serverless, once a team exceeds a certain size, branch based environments are a big help. When you
have to worry overwriting the deployment of somebody else in the dev/test/qa stage, you are
spending time on something that could be easily solved.


Review apps are also something that is highly appreciated by PMs once they understand it. For tips
how to set up a review up check our related post [How to configure Vite on AWS for Gitlab Review
Apps](https://double-trouble.dev/post/gitlab-review-apps-aws-vite/). This post shows an example
for branch based deployments in the frontend. This is often already enough, but to all the way
with branch based deployments also for the backend, we'll help you out in a future post.

## Try CI Linting

Last but not least, when tuning the pipeline a lot, it is easy to make a small mistake which will
have the pipeline not working after a push. To prevent at least some surprises here, it's a real
time saver to use some sort of linting. For gitlab linters exist for
[VSCode](https://docs.gitlab.com/ee/ci/lint.html) and
[emacs](https://gitlab.com/joewreschnig/gitlab-ci-mode/), for github there is a cli tool called
[actionlint](https://github.com/rhysd/actionlint/).

```lisp
;; gitlab-ci linting in emacs:
(use-package gitlab-ci-mode
  :ensure t)
```

## Rounding Up

A pipeline is something that shouldn't make you go to sleep. While many engineers shy away from
touching the CI at all, and they may even complain a lot if it doesn't work after a change, with
pipelines we need a bias for change and optimization. Yes, a changed pipeline is going to likely
fail for a bit after the workflow changed, but the eventual payout will be manifold.
