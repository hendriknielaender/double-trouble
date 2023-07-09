---
publishDate: "July 13 2023"
title: "Stirring Up Some TypeScript Magic"
description: "Advanced tips and helper functions for enhancing code structure and readability."
image: ~/assets/images/thumbnails/tips.png
imageCreditUrl: https://labs.openai.com/
tags: [gptpost, tips, functions, typescript, javascript, code]
---

For TypeScript developers, small enhancements and helper functions can significantly improve code readability and maintainability. This blog post is dedicated to providing you with five essential TypeScript tips and helper functions, designed to be easily copied and pasted into your codebase. Let's dive in.

1\. Inline Error Raising with the Nullish Coalescing Operator
-------------------------------------------------------------

Many times, we find ourselves needing to throw an error if a particular value is null or undefined. Instead of checking this manually, TypeScript provides a way to inline this process using the nullish coalescing operator (??) and a simple helper function.

```typescript
const raise = (err: string) : never => { throw new Error(err);};
```

This 'raise' function, when coupled with the nullish coalescing operator, allows you to write more readable and concise code.

```ts
const Page = (props: { params: { id?: string }}) => {
  const id = props.params.id ?? raise('No id provided');
};
```

Shout-out to the TS Wizard Matt Pocock and @HeyImMapleLeaf for this amazing tip.

2\. Safe Object Property Access with Optional Chaining
------------------------------------------------------

Navigating through nested objects in TypeScript can sometimes lead to runtime errors if a particular path is undefined. To handle this, TypeScript introduces the optional chaining operator (?).

```ts
const getNestedProperty = (obj: any, path: string) =>
  path.split('.').reduce((o, p) => o?.[p], obj);
```

Here, if any part of the path is undefined, it will short-circuit and return `undefined`.

```ts
const user = { info: { name: 'John' }};
const name = getNestedProperty(user, 'info.name'); // John
const age = getNestedProperty(user, 'info.age'); // undefined
```

3\. Type Guarding
-----------------

TypeScript supports user-defined type guards to narrow down the type of an object within a conditional block. This is achieved by using a function that returns a boolean, indicating whether the object is of a specific type.


```ts
function isString(test: any): test is string {
  return typeof test === "string";
}

function printLength(input: string | any[]) {
  if (isString(input)) {
    console.log(input.length);
  } else {
    console.log(input.length);
  }
}
```

In this example, `isString` is a type guard that ensures `input` is treated as a string within the if block.

4\. Strongly-Typed Event Emitters
---------------------------------

In cases where you need to use an event-driven architecture, you might need to use an event emitter. The downside of JavaScript's built-in event emitter is that it's not strongly typed. But fear not, TypeScript is here to save the day.

```ts
import { EventEmitter } from "events";

interface MyEvents {
  event1: (param1: string, param2: number) => void;
  event2: () => void;
}

class MyEventEmitter extends EventEmitter {
  public emit<T extends keyof MyEvents>(
    event: T,
    ...args: Parameters<MyEvents[T]>
  ) {
    return super.emit(event, ...args);
  }

  public on<T extends keyof MyEvents>(
    event: T,
    listener: MyEvents[T]
  ): this {
    return super.on(event, listener);
  }
}

const myEmitter = new MyEventEmitter();
myEmitter.on('event1', (param1, param2) => {
  // Type-safe parameters!
});
```

With this code, you can enjoy a fully type-safe event emitter!

5\. Enforcing Readonly Properties
---------------------------------

TypeScript has the `readonly` modifier, making it easy to create properties that can't be changed after they're set. This can be particularly useful for creating objects with properties that should never change.

```ts
interface Config {
  readonly apiUrl: string;
  readonly defaultTimeout: number;
}

const config: Config = {
  apiUrl: "https://myapi.com",
  defaultTimeout: 5000,
};

config.apiUrl = "https://anotherapi.com"; // Error!
```

In this example, any attempts to change the `apiUrl` or `defaultTimeout` will result in a TypeScript error.

These are just a few examples of the features and techniques TypeScript offers to enhance your development process. With these tips and helper functions, your code will be cleaner, safer, and easier to maintain. Happy TypeScripting!
