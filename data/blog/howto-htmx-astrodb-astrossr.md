---
publishDate: "May 23 2024"
title: "Ditch React: Build Faster with htmx, Astro DB & Astro SSR in 2024"
description: "Explore common techniques and solutions for building a fast and efficient CRUD app using htmx, Astro DB, and Astro SSR without React in 2024."
image: "~/assets/images/thumbnails/htmx_app.jpg"
imageCreditUrl: https://midjourney.com
tags: [htmx, react, astro, astrodb, astrossr, crud, netlify]
---

These days, many people feel tired of React, and as [@ThePrimeagen](https://twitter.com/ThePrimeagen)
announced it:

> This is the year of HTMX!


While the htmx examples in the [documentation](https://htmx.org/examples/) look easy enough, we
decided to take it to the test and re-implemented an existing [React
project](https://github.com/flyck/party-task-planner) in
[htmx](https://github.com/flyck/astro-party).

We had created the original app earlier this year, mostly to play around with Websockets and
AppSync subscriptions. In the frontend it was based on React and Next.js, hosted on top of
Vercel. On the backend it ran on AWS AppSync and Dynamodb as a persistent storage. In the
[re-implementation](https://github.com/flyck/astro-party), we moved the frontend to pure HTML and
js, using [htmx](https://htmx.org/ "Visit HTMX Official Site for more details") and
[Astro](https://astro.build). For the backend we used [Astro DB](https://astro.build/db/), which
is currently in early preview, and Astro SSR hosted on [Netlify](https://www.netlify.com/).

We were curious how well this stack could work for CRUD apps, but especially the experience
of using htmx instead of React. In the following we'll share basic techniques for this stack,
and also our conclusions, looking back.

## Responsive Buttons

A responsive button would change its appearance while the operation is ongoing. For our use-case
this means we want to show a "Confirm" text while the button is ready, and a loading spinner while
the confirmation is being processed.

<img
    style="display: block;
           margin-left: auto;
           margin-right: auto;"
  alt="Demonstration of HTMX responsive button"
src="../../src/assets/images/posts/howto-htmx-astrodb-astrossr/button.gif">
</img>

Htmx automatically adds predefined CSS classes to requesting elements, so with tailwind's
conditional styles, we can use them to hide and display elements when needed. Instead of the
regular `useEffect` shenanigans and a dedicated loading state, we can make use of basic CSS
classes:

```html
<div class="block htmx-request:hidden">
    Confirm
</div>
<Spinner class="hidden htmx-request:block" />
```

These htmx-specific tags are not available in tailwind by default, but they can be added via
tailwind [plugins](https://www.crocodile.dev/blog/css-transitions-with-tailwind-and-htmx) in the
astro config:
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

Before dynamic content loads, we typically want to display *something*. A basic component will
have skeletons as the initial content, which then gets replaced after loading.

<img
    style="display: block;
           margin-left: auto;
           margin-right: auto;"
    src="../../src/assets/images/posts/howto-htmx-astrodb-astrossr/loading-forms.gif">
</img>

In the static frontend page which holds those skeletons, we can load the form like so:
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

While the server returns the same Astro component, but with the relevant data:
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
<Input name="title" title="Title" value={title} loading={loading}></Input>
<Input name="location" title="Where" value={location} loading={loading}></Input>
<Input name="date" title="When" value={date} loading={loading}></Input>
<Input name="description" title="Description" value={description} loading={loading}></Input>
```

## Inline Validation

Giving the user early feedback, by displaying form errors on individual fields, is another
great way to increase the user experience.

<img
    style="display: block;
           margin-left: auto;
           margin-right: auto;"
  alt="Demonstration of HTMX responsive button"
src="../../src/assets/images/posts/howto-htmx-astrodb-astrossr/inline-validation.gif">
</img>

In the frontend, we trigger the validation on key-up or input change (copy paste actions). Htmx
conveniently resets the timer if another letter is input early. Using `hx-params`, we make sure to
only send the current input as payload.
```js
<div class="...">
  {title}: <div class="ml-2" id={validationResultId}></div>
</div>
<!-- ... -->
<input aria-label={title} type={type || "text"} name={name} {...rest}
  hx-trigger="keyup changed delay:0.8s, change delay:0.8s"
  hx-post={validateUrl}
  hx-params={name}
  hx-swap="innerHTML"
  hx-target={"#" + validationResultId}
  />
```

In the backend, we then simply apply a partial schema validation using Astro DB's Zod:

```js
// ...
const parsedInput = schema.partial().safeParse(inputJson);
if (!parsedInput.success) {
  error = parsedInput.error.errors[0].message;
}
---
<div class="text-xs text-red-400">{error ? `(${error})` : undefined}</div>
```


## Toasty Errors

Once an interaction is submitted, problems can happen. There are many ways to display such
interactive errors to the user, and one such way is toast messages.

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
  return toastResponse(new ToastError("danger", "Something went wrong. :(", 500))
}
```

The backend returns toast message as a part of the `hx-trigger` reply header. Htmx transforms that
payload into an event, which we can listen for in the frontend and display the appropriate toast.
```js
function onDisplayToast(e) {
   const toast = new Toast(e.detail.level, e.detail.message);
   toast.show();
 }
document.body.addEventListener("displayToast", onMakeToast);
```

Shout-out to `thisisthemurph` for the basic concept in his [blog-post](https://dev.to/thisisthemurph/go-beyond-the-basics-mastering-toast-notifications-with-go-and-htmx-4ao3).

## View Transitions

View transitions are a modern browser feature, which make it easy to have seamless transitions
between pages. They make page navigation more smooth, while also hiding a bit of loading time.

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
<div transition:animate={slide()}>
    <slot />
</div>
```

They are natively supported by Astro, by introducing client-side navigation. After a simulated
page load, JavaScript that had already been loaded stays untouched. This has the positive
side-effect of loading the htmx dependency only once, but we will still have to re-trigger htmx
with the new page.

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

Htmx itself doesn't need any outside framework, in order to stand up an app. You could write pure
html with that bit of JavaScript.

Instead of using htmx with a Go, we used Astro SSR as the api, with Astro DB for persistence, and
`.astro` syntax for templating all around. The experience here for our small app was simply
amazing. The complexity of React and Next.js could be completely skipped, and we could deliver an
app without any JSON contracts minimal dependencies.

## Is htmx the ultimate choice?

Htmx author Carson himself points out the advantages and disadvantages of htmx based on the
situation (see [essay](https://htmx.org/essays/when-to-use-hypermedia/)).

To us, htmx excels at going back to basics. HTML forms are a breeze, and the whole contracted
JSON api middleman can be skipped, by shipping HTML directly. Especially with Astro, having
`.astro` templates all the way through, with minimal external dependencies, keeps the complexity
low.

On the other hand, building this app highlighted also a few strengths of React. Handling the data
flow between components is the main purpose of the React component properties. With htmx, doing
the same while only fetching data once, had us come up with some last-mile JavaScript. The
alternative could be to simply fetch more HTML, which seems to be part of the htmx paradigm.

Generally the chance of writing explicit JavaScript seems slightly higher with htmx, but at least
you know what you're doing, and it's very honest work. Though in this case more explicit JavaScript
was written, the perceived complexity was lower and the overall enjoyment greater.

## Rounding up

Coming from React, htmx introduces a completely different application paradigm. It requires going
back to the basics, which felt good. Simply not having the app written in React felt great.

Also the combination of [Astro DB](https://astro.build/db/) with [Astro
SSR](https://docs.astro.build/en/guides/server-side-rendering/) hosted on
[Netlify](https://www.netlify.com/) was great. After it initially seemed like an anti-pattern to
use Astro for dynamic content, the site itself is quite fast and the experience was great.

Htmx is conceptually easy to grasp, and while the initial learning curve is somewhat steep, it
plateaus relatively quickly, due to the standards-based approach. For smaller apps we definitely
already recommend to give htmx a try, for bigger apps we'll need to do more research. Hopefully,
as more and more people learn these basic concepts, we can eventually use them for real projects
at work, and build simple solutions in a simple way.
