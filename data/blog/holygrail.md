---
publishDate: "March 29 2025"
title: "Uncovering the Holygrail: htmx, tailwind & alpine"
description: ""
image: ~/assets/images/thumbnails/holygrail.webp
imageCreditUrl: https://www.chatgpt.com
tags: [alpine.js, htmx, tailwindcss, mpa, interactive UI]
---

The past few years for us, in retrospective atleast, stood under one big common theme: The search
for better tools. Not only bigger tools, but tools that help us ship.

During this time, we have always been huge fans of bun and tailwind, but last year we've also
taken htmx more seriously. Building with it ontop of cloudflaire, let us cover the basics of app
building with htmx[↗](/post/howto-htmx-astrodb-astrossr). This year, we have a big project coming
up. It's going to be the biggest thing we've ever build together, and it's going to be build with
htmx and bun.

But there was a missing piece. With htmx, we found ourselves writing some last-mile
javascript[↗](/post/howto-htmx-astrodb-astrossr#is-htmx-the-ultimate-choice), which we didnt have
to write in regular frontend frameworks. The effort seemed justified, but it didn't feel great. To
fill this gap, Hendrik brought [alpine.js](https://alpinejs.dev/) into the mix, and it filled the
spot perfectly. As we're enjoying the experience with it, we already have a few techniques to
share, but also the bigger picture to discuss.

## What is Alpine?

Alpine lets you **embed reactive state and behavior directly in your HTML**. You include it via a
simple `<script>` tag (no build process needed), then you can use directives like `x-data` to
define component state, `x-text` or `x-html` to bind data to the DOM, `x-on:click` (shorthand
`@click`) to listen for events, `x-show` to conditionally display elements, `x-for` for loops,
[and so on](https://alpinejs.dev/start-here). All of this happens *declaratively in the HTML*. For
example, a basic Alpine counter component looks like:

```html
<div x-data="{ count: 0 }">
  <span x-text="count"></span>
  <button x-on:click="count++">Increment</button>
</div>
```

### Example 1: Dropdown

### Example 2: Dialog

## Where Alpine and Htmx overlap

While htmx and alpine synergize well, as alpine manages client-side interactivity, and htmx
manages server-side integration, there is a bit of overlap. One of these overlaps in the click
event trigger, which both htmx (`hx-trigger='click'`) and alpine (`x-on:click='foo=true'`) can do.

```html
<div x-data="{isClicked: false}">
  <button
    hx-put="/"
    hx-trigger="click"
    x-on:click="isClicked = !isClicked"
  >
    Click me
  </button>
  <div x-text="isClicked"></div>
</div>
```

In this case, both click-effects will be triggered, which is also what we would expect. In
practice, we found these tiny overlaps rarely come into effect, and an element which triggers a
server integration rarely also needs to do any more javascript via the alpine binding.

## No-Build Frontends

All of the examples in this post could actually be used without any build tools. TODO enhance this
section

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Htmx / Alpine Overlap</title>
    <script src="https://unpkg.com/htmx.org@2.0.4/dist/htmx.min.js" ></script>
    <script src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js" defer></script>
    <script src="https://unpkg.com/@tailwindcss/browser@4.0.14/dist/index.global.js" ></script>
  </head>
  <body>
    <!-- your awesome html goes here -->
  </body>
</html>
```

Running a few examples locally is actually so easy in combination with bun (TODO mention bun
version when this was released). To serve a few html files with bun, simply place them in the same
directory and type:

```
bun *.html
```

Bun will serve these html files locally and can simulate the basic htmx flow, as one html file may
load contents from another via htmx. This will give the advantage of avoiding any CORS errors, and
hot-reloading changes in the html files via bun.


## Why we need simpler tools

TODO section on grugbrain and theories of simplicty

## Section on Performance

TODO take some of the good bits from the gpt-posts

## Rounding up

TODO
