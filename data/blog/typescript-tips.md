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

Shout-out to the TypeScript Wizard himself [Matt Pocock](https://www.twitter.com/mattpocockuk) and [@HeyImMapleLeaf](https://twitter.com/heyImMapleLeaf) (originally posted) for this amazing tip.

2\. Utilizing Mapped Types
------------------------------------------------------

Mapped Types is a powerful TypeScript feature that allows you to create new types based on existing ones. They can help you to keep your types DRY, reducing duplication and improving maintainability.

### Readonly

A common example of a Mapped Type is `Readonly<T>`. This makes all properties of `T` read-only:

```ts
interface IUser {
  name: string;
  age: number;
}

type ReadonlyUser = Readonly<IUser>;
```

Now, all properties of `ReadonlyUser` are read-only.

### Partial

Another handy Mapped Type is `Partial<T>`, which makes all properties of `T` optional:

typescriptCopy code

```ts
type PartialUser = Partial<IUser>;
```

`PartialUser` is now `{ name?: string, age?: number }`.

### Record

The `Record<K,T>` Mapped Type can be used to create an object type where the property keys are `K` and the property values are `T`:

```ts
type UserRecord = Record<string, IUser>;
```

`UserRecord` is now an object type that will accept any string as a key, and any value must be of type `IUser`.

### Creating Your Own Mapped Types

You're not just limited to the Mapped Types that TypeScript provides. You can also create your own:

```ts
type Nullable<T> = { [P in keyof T]: T[P] | null };
```

This `Nullable<T>` type takes an existing type `T`, and produces a new type where every property is nullable.

Mapped types help you to create complex types based on your existing ones, reducing code duplication and enhancing type safety.

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
