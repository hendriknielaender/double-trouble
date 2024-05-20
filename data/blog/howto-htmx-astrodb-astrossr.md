---
publishDate: "Apr 2 2024"
title: "Ditch React: Build Faster with htmx, Astro DB & Astro SSR in 2024"
description: "Explore common techniques and solutions needed for building a basic CRUD app with this modern react-less stack."
image: "~/assets/images/thumbnails/htmx_app.jpg"
imageCreditUrl: https://midjourney.com
tags: [htmx, react, astro, astrodb, astrossr, crud, netlify]
---

These days, many people feel tired of React, and as [Primeagen](https://twitter.com/ThePrimeagen)
announced it: `This is the year of HTMX!` While the htmx examples in the documentation look easy
enough, we took it to the test and re-implemented an existing React project in htmx.

We had created the original app earlier this year mostly to play around with Websockets and
AppSync subcriptions. In the frontend it was based on React and Nextjs, hosted ontop of Vercel. On
the backend it ran on AWS AppSync and Dynamodb as a persistent storage. In the re-implementation
we moved the frontend from to purely html, using [htmx](https://htmx.org/ "Visit HTMX Official Site for more details") and
[Astro](https://astro.build). For the backend we used [Astro DB](https://astro.build/db/), which
is currently in early preview, and Astro SSR hosted on [Netlify](https://www.netlify.com/) in the
free tier.

The basic point of this experiment was to see, how CRUD apps could be implemented in a
straightforward way, but also to see how the experience would be with HTMX instead of React.

## Responsive Buttons

A responsive button would change its appearance while the operation is ongoing. For our usecase
this means we want to show a "Confirm" text while the button is ready, and a loading spinner while
the confirmation is being processed.

<img
    style="display: block;
           margin-left: auto;
           margin-right: auto;"
  alt="Demonstration of HTMX responsive button"
src="../../src/assets/images/posts/howto-htmx-astrodb-astrossr/ezgif-button.gif">
</img>

Htmx automatically adds predefined css classes to requesting elements, so with tailwinds
conditional styles, we can use them to hide and display elements when needed. Instead of the
regular `useEffect` shenanigans and a dedicated loading state, we can make use of basic css
classes:

```html
<div class="block htmx-request:hidden">
    Confirm
</div>
<Spinner class="hidden htmx-request:block" />
```

These htmx-specific tags do not come out-of-the-box with tailwind, but they can be defined via a
tailwind [plugin](https://www.crocodile.dev/blog/css-transitions-with-tailwind-and-htmx):
```ts
  plugins: [
    plugin(function({ addVariant }) {
      addVariant('htmx-settling', ['&.htmx-settling', '.htmx-settling &'])
      addVariant('htmx-request', ['&.htmx-request', '.htmx-request &'])
      addVariant('htmx-swapping', ['&.htmx-swapping', '.htmx-swapping &'])
      addVariant('htmx-added', ['&.htmx-added', '.htmx-added &'])
    }),
  ],
```

## Skeletons

Before dynamic content loads, we typically want to display *something*. A basic component will have
skeletons as the initial content, which then gets replaced after loading.

<img
    style="display: block;
           margin-left: auto;
           margin-right: auto;"
    src="../../src/assets/images/posts/howto-htmx-astrodb-astrossr/loading-forms.gif">
</img>

In the static frontend page which holds those sceletons, we can load the form like so:
```html
<div
  hx-trigger="load"
  hx-get="/server/party/read"
  hx-target="#content"
>
</div>

<div id="content">
   <PartyDetails loading={true}>
</div>
```

While the server returns the same astro component with the relevant data:
```html
<PartyDetails title={title} location={location} date={date} description={description} loading={false} />
```

The component itself is again just html:
```html
import Input from "../mini/input.astro"

interface Props {
  loading: boolean
  title?: string
  location?: string
  date?: string
  description?: string
}

const { loading, title, location, date, description } = Astro.props
---
<Input name="title" title="Title" type="text" value={title} loading={loading}></Input>
<Input name="location" title="Where" type="text" value={location} loading={loading}></Input>
<Input name="date" title="When" type="text" value={date} loading={loading}></Input>
<Input name="description" title="Description" type="text" value={description} loading={loading}></Input>
```

## Toasty Errors

Once an interaction is submitted, problems can happen. There are many ways to display such
interactive errors to the user, and once such way are toast messages.

<img
    style="display: block;
           margin-left: auto;
           margin-right: auto;"
    src="../../src/assets/images/posts/howto-htmx-astrodb-astrossr/toast.gif">
</img>

The server action can be wrapped in a try-catch block, and the server itself decides that this
error will be rendered as a toast.
```ts
try {
  const id = getPartyIdOrThrowToast(request)

  // ...
} catch(error) {
  if (error instanceof ToastError) {
    return toastResponse(error)
  }
  return toastResponse(new ToastError("error", "Something went wrong. :(", 500))
}
```

The backend returns toast message as a part of the `hx-trigger` reply header. Htmx transforms that
payloed into an event, which we can listen for in the frontend and display the appropriate toast.
```js
function onDisplayToast(e) {
   const toast = new Toast(e.detail.level, e.detail.message);
   toast.show();
 }
document.body.addEventListener("displayToast", onMakeToast);
```

## View Transitions

View transitions are a modern browser feature, wich make it easy to have seamless transitions
between pages. They are natively supported by Astro,

<img
    style="display: block;
           margin-left: auto;
           margin-right: auto;"
    src="../../src/assets/images/posts/howto-htmx-astrodb-astrossr/viewtransition.gif">
</img>

```html
<head>
    <!-- ... -->
    <ViewTransitions />
</head>
<!-- ... -->
```

After a simulated page transition via the client-side navigation, javascript that had already been
loaded stays untouched. This has the positive effect of loading the htmx dependency only once, but
we will still have to re-trigger htmx with the new page.

```js
<script is:inline>
document.addEventListener(
  "astro:after-swap",
  () => {
    htmx.process(document.body || null)
  },
  { once: false }
);
</script>
```

## Astro SSR & Netlify

In theory, HTMX doesn't need any framework. You could write pure html with that bit of javascript.

For [astro-party](https://github.com/flyck/astro-party), the app behind this post, Astro gave the
following benefits:
- View Transitions (animated client-side routing with optimal dependency loading)
- Astro DB (persisting data on the backend with great local DX and generous free-tier)
- Astro SSR (dynamic backend routes with familiar astro templates)

Instead of using HTMX with a GOLang server, which is dishing out HTML, we use astro ssr with
astro db for persistence, and `.astro` syntax for templating. The experience here for our small
app was simply amazing.

For prototyping and learning within our own app, astro db and ssr with netlify gave an amazing,
carefree experience.

## Rounding up

Coming from react, HTMX introduces a completely different application paradigm. It requires going
back to the basics, which felt good. Simply not having the app written in React felt great.

On the other hand, it also revealed things react does, which can be easily taken for
granted. In react there is rarely ever the case where you'll need to worry about ids. In htmx this
is much mor the case. Also the dataflow between components is taken care of by react. Within htmx,
if you need a list of items to each open a modal with different properties,
