---
publishDate: "July 26 2024"
title: "Exploring the Power of Negative Space Programming"
description: "Discover how negative space programming can enhance your code's robustness and clarity by focusing on what your program should not do."
image: "~/assets/images/thumbnails/negativ-space.jpg"
imageCreditUrl: https://chatgpt.com
tags: [tigerstyle, programming, zig, assertion, assert, test]
---

Negative space programming is a concept that embraces the art of defining a program by what it should not do, rather than what it should. This approach allows developers to create more robust and error-resistant code. Let’s dive into how this concept can be applied and explore its benefits.

## The Concept of Negative Space Programming

Negative space programming involves placing constraints and assertions throughout your code to explicitly define invalid states and conditions. By doing this, you ensure that the code fails fast and early, preventing unintended behaviors from propagating through the system. This method not only enhances the reliability of the software but also documents the developer's expectations clearly, offering a dual benefit of validation and communication.

### Benefits of Negative Space Programming

1. **Early Detection of Errors**: Assertions and constraints help catch errors at the earliest point in the execution flow. This makes debugging easier and faster, as issues are identified close to their origin.

2. **Improved Code Clarity**: By explicitly stating what should not happen, the code becomes self-documenting. Future maintainers of the code can quickly understand the boundaries and expectations set by the original developer.

3. **Enhanced Security**: Defining invalid states helps in creating secure code. It prevents unexpected inputs or states from being exploited by malicious users, thus adding an additional layer of security.

4. **Simplicity and Maintenance**: Negative space programming encourages simplicity. By focusing on constraints, the codebase often becomes leaner and easier to maintain, as it avoids overcomplication by detailing what is outside the scope of normal operation.

## TigerStyle! and NASA's The Power of 10: Rules for Developing Safety-Critical Code

One of the most compelling advocates for negative space programming is Joran Dirk Greef (CEO of [TigerBeetle](https://tigerbeetle.com)), who in [his talk](https://www.youtube.com/watch?v=w3WYdYyjek4), emphasized seeing your program like a hacker. This perspective involves imagining not how your code should work, but how it should not work. He highlights NASA’s ["The Power of 10: Rules for Developing Safety-Critical Code"](https://en.wikipedia.org/wiki/The_Power_of_10:_Rules_for_Developing_Safety-Critical_Code). particularly the fifth rule:

> "5. Use a minimum of two runtime assertions per function."

Assertions, which crash the program when they fail, are a critical component of negative space programming. They ensure that the program does not continue running with a known faulty state, effectively documenting the developer’s expectations. 

He also provided an excellent example of using assertions to check for infinite loops. Unless an infinite event loop is genuinely necessary, there should always be an upper bound. By asserting this upper bound, you ensure the loop behaves as expected. Testing minimum bounds—ensuring the loop runs the expected minimum number of times—is equally important.


Another famous dev, who now has changed the way he is programming is [ThePrimeagen](https://www.youtube.com/@ThePrimeagen):

<center>
<iframe width="315" height="560" 
src="https://www.youtube.com/embed/M-VU0fLjIUU?si=sFXEIxlBtWdTFTAw" 
title="ThePrimeagen negativ space programming" frameborder="0" 
allow="accelerometer; autoplay; clipboard-write; encrypted-media;
gyroscope; picture-in-picture;
web-share"
allowfullscreen></iframe>
</center>

### Practical Application

Here’s how you can apply these principles (in these examples we are using zig):

#### 1. Using Assertions

In Zig, assertions can be used to enforce constraints at runtime. For example:

```zig
const std = @import("std");
const assert = std.debug.assert;

fn calculateArea(width: i32, height: i32) i32 {
    assert(width > 0);
    assert(height > 0);
    return width * height;
}
```

In this function, assertions ensure that the width and height are always positive, preventing invalid inputs from producing incorrect results.

### 2. Handling Invalid States
You can use error handling capabilities to define and manage invalid states effectively:

```zig
const std = @import("std");

fn openFile(path: []const u8) !std.fs.File {
    if (path.len == 0) {
        return error.InvalidPath;
    }
    return std.fs.cwd().openFile(path, .{});
}
```

In this snippet, an error is returned if the file path is empty, clearly defining an invalid state and handling it gracefully.

### 3. Documenting Expectations
Negative space programming also involves documenting the negative space around your logic. This can be done through comments and error messages that clarify the constraints:

```zig
const std = @import("std");

fn connectToServer(address: []const u8) !void {
    if (address.len == 0) {
        return error.InvalidAddress;
    }
    // Connect to server
}
```

By documenting the invalid state `(address.len == 0)`, future developers understand the expectations without needing to delve deeply into the implementation.



### Keep Your Assertions in Production

It is essential to keep assertions in your production code. Assertions allow your program to check its own logic continuously, ensuring that it runs correctly even under the unexpected conditions often encountered in production. By defining and enforcing negative space, you significantly reduce the risk of undetected bugs causing severe issues.

Integrating these practices into your development workflow will enhance the reliability and clarity of your code, making negative space programming a cornerstone of robust software engineering.

## Conclusion
Negative space programming is a powerful technique that enhances code robustness, clarity, and security. By focusing on what should not happen, developers can create more resilient software.

### TigerStyle

Negative space programming is part of TigerStyle. But it's more than just a set of rules; it's a philosophy.

It emphasizes the importance of design, encapsulating safety, performance, and developer experience as its core goals. Good style, according to TigerStyle, goes beyond readability—it's about how the code works and how it makes the developer feel.

A significant aspect of TigerStyle is the pursuit of simplicity and elegance. Simplicity is not an easy pass but the result of rigorous thought and multiple revisions. It encourages you spending mental energy upfront during the design phase, ensuring that the code is efficient and reliable in the long run. This proactive approach prevents technical debt, making the codebase robust and maintainable.

It also stresses the importance of thinking about performance from the design phase, optimizing for the slowest resources first, and using back-of-the-envelope sketches to be roughly right. This approach ensures that the system is efficient and meets the demands of real-world usage.

Developer experience is also a critical focus. Naming things correctly, minimizing scope, and handling errors meticulously are all practices that enhance the developer's interaction with the code. It also emphasizes the importance of clear and concise documentation, explaining the rationale behind code decisions, and providing detailed commit messages.

By integrating these principles, TigerStyle ensures that the code is not only functional but also elegant and maintainable. 

For more details, check out the official [TigerStyle](https://github.com/tigerbeetle/tigerbeetle/blob/main/docs/TIGER_STYLE.md).
