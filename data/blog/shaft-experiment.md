---
publishDate: "Mar 01 2024"
title: "The Rise and Fall of the SHAFT stack: An Experiment in Tooling"
description: "Learnings from migrating a vercel nextjs appsync app onto a stack made of sqlite, htmx, astro,
fly.io and tuql"
image: "~/assets/images/thumbnails/agile-roadmaps-1.png"
imageCreditUrl: https://midjourney.com
tags: [concept, bun, astro, htmx, fly.io, sqlite]
---

On github we have an app that is called
[party-task-planner](https://github.com/flyck/party-task-planner). It is a basic app which allows
users to create parties, add participants and assign tasks to those participants. An attempt to
organize party planning in a collaborative setting via websockets. It is hosted on Vercel and uses
NextJs and React in the frontend, together with an AWS AppSync graphql api in the backend to store
the data.

Looking at this app, which is basically a CRUD application with little extra functionality, we had
the idea of rebuilding it with different tools, to ideally achieve better development speed, as
well as a better development experience. And so began the inception of SHAFT.

## What is SHAFT?

The stack looks like this:
- Backend:
  - Sqlite db
  - [Tuql](https://github.com/bradleyboy/tuql) (turns a sqlite schema into a graphql api)
  - Fly.io hosting
    - [litefs](https://fly.io/docs/litefs/) for distributed sqlite
    - containers app to host the tuql nodejs express api
    - fly can also host static pages
- Frontend:
  - Htmx
  - Astro

## A Primer on Htmx

Htmx is not really new, but it was new to us going into this experiment. What is Htmx? Htmx
competes as a frontend library, and plays in the same category as react. It has recently gotten
much more popularity, getting covered by prime and more (TODO link). At the same time these days
there seems to be a general fatigue around react development, which we also felt when created the
party-task-planner.

How does Htmx look in practice? Here we have simple example from the
[docs](https://htmx.org/attributes/hx-get/):
```html
<div hx-get="/example">
  Get Some HTML
</div>
```

This snippet will cause the div to issue a GET to /example and swap the returned HTML into the
innerHTML of the div. Htmx has a wide range of these html attributes, which in combination act as
a complete frontend library.

Htmx advertises on their website: `high power tools for HTML`. But what is the limit of these
tools, and what is their extended purpose?  It seems that the Htmx approach is one which tries to
avoid javascript, and have the frontend build only on html attributes which are then interpreted
by htmx. This is supported by the following haiku featured on [htmx.org](htmx.org):

```
javascript fatigue:
longing for a hypertext
already in hand
```

### Htmx Templating: Frontend vs Backend

JSON & Frontend templates vs Backend templates and HTML.


## Htmx and Astro

While Htmx as a frontend library doesnt need a framework like Astro, on first glance it seems like
they would be best friends. They both share a the same bias against Javascript and both have a
love for html. From the astro [docs](https://docs.astro.build/en/basics/astro-syntax/): `If you
know HTML, you already know enough to write your first Astro component.`. Astros approach is to
include as little javascript as possible, to have the most performant site possible. Loading in
javascript and even frontend library components via the concept of `islands` is still possible,
but the idea is that those are the exception.

Migrating a small app to this combination revealed certain attributes:
- `Pro: Hot reload`: While Htmx can live simply in a html page which is displayed in the browser,
  having the automatic hot-reload on save from Astro was nice.
- `Pro: Components`: Astros buildin components make it easy to structure the html into different
  components and have a somewhat orderly project structure.
- `Pro: Easier Debugging`: Astros dev tools can point exactly to the file where the problem
  exists. In raw html there is much less support during development.
- `Con: Templating`: Astros [templates](https://docs.astro.build/en/basics/astro-syntax/) are only
  evaluated on their initial render. So unless you're running an astro server with ssr, you'll
  need another templating language to render json responses with Htmx. With the recommended
  example of mustache, this leads to funny escaping in the astro components:
  ```astro
  {`{{^data.party}}`}<p>Party not found :(</p>{`{{/data.party}}`}
  ```
- `Con: Astros Static Page Router`: Astro is basically a tool to generate pages with a
  pre-computable page structure. This way it lends itself for less dynamic settings, like with a
  blog or a landing page, while again minimizing the involved javascript for the display. The
  scope of Htmx as a react competitor however goes beyond this. To create an app with truly
  dynamic routes, Astro has to budge and find work-arounds via for example a query string.
  - The original app had a route `/[partyid]` to navigate to the party infos
  - With the astros router, we can replicate this with `/party?id=partyId`

  There might be many apps which don't run into this limitation, but there is a clear mismatch
  between the intended scope of astro and the potential capabilities of Htmx.

## Fly.io and Tuql
