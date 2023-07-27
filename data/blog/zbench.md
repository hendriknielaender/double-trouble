---
publishDate: "July 28 2023"
title: "Taking off with Zig: Putting the Z in Benchmark"
description: "Zig Programming Landscape: Creating a Benchmarking Library"
image: ~/assets/images/thumbnails/lizard.png
imageCreditUrl: https://www.midjourney.com/
tags: [gptpost, zig, rust, benchmark, release]
---

My Journey in Creating My First Zig Library
===========================================

I've been on the hunt for fresh ideas in coding when I discovered Zig, a free and new programming language. It tries to match up to popular ones like C/C++, both in speed and simplicity. Intrigued, I decided to take a swing at building a benchmark library using Zig. This experience taught me about what Zig can do today, its future possibilities, and its weak spots. So, let's jump into the story of "Creating My First Zig Library!"

Starting with zBench
--------------------

Inspired by Golang's built-in testing benchmark package, I decided to create a similar tool for Zig, naming it 'zBench'. The objective was to allow developers to measure and compare the performance of their Zig code. However, creating zBench was not straightforward. As a young language, Zig's API undergoes frequent changes, which meant I had to frequently troubleshoot and rewrite my code to keep it compatible with the latest versions.

Feel free to checkout the [repository](https://github.com/hendriknielaender/zBench)

The Journey
--------------------

The first step was to get familiar with Zig and understand how to structure a library in this language. I spent quite a bit of time studying other Zig libraries and the official Zig documentation. Unlike Go or Rust, Zig has a much smaller community, which meant fewer resources and a lot of learning from trial and error.

The primary components of the 'zBench' library were a `Benchmark` struct and a `run` function. The `Benchmark` struct contained fields for tracking the benchmark's state and metrics. The `run` function, on the other hand, would execute a given function a specified number of times and capture the performance statistics.

In the `Benchmark` struct, I included fields like `name`, `N` for the number of iterations, `timer` for timing, and `totalOperations`, `minDuration`, `maxDuration`, `totalDuration`, `durations`, `allocator`, and `startTime` for tracking benchmarking statistics. I also incorporated a method `init` to initialize a new benchmark, `start` and `stop` to control benchmarking, and `reset` to reset the benchmark's state.

One of the biggest challenges in this endeavor was managing dependencies. Zig, unlike Rust, does not currently have a built-in package manager. This meant that I had to manually initialize and update the submodules whenever the repository was cloned. This was a hands-on task and, while it could be seen as a chore, I viewed it as an opportunity to truly understand how Zig handled dependencies.

The `run` function involved running the benchmark multiple times, gradually increasing the number of iterations (`N`), until the total duration reached a minimum threshold or a maximum number of iterations were reached. The results were then stored in a `BenchmarkResult` struct and appended to a `BenchmarkResults` list.

Once the benchmark ran successfully, the next task was to visualize the results. I wrote a function called `prettyPrint` to format and display the benchmark results, complete with percentiles and color-coding for better readability.

Zig Features
------------

1.  ***Custom types and structs***: Zig allows the definition of custom types and structures, giving developers the ability to design their own data structures to meet their requirements. The `Benchmark`, `Percentiles`, `BenchmarkResult`, and `BenchmarkResults` structs in the code are excellent examples of this.

```zig
pub const Benchmark = struct {
    name: []const u8,
    N: usize = 1, // number of iterations
    timer: t.Timer,
    totalOperations: usize = 0,
    ...
    allocator: *std.mem.Allocator,
    startTime: u64,
...
};
```

2.  ***Explicit error handling***: Zig has no exceptions. Instead, it uses explicit error handling, meaning all potential errors must be declared and handled by the function. For example, in the `init` function inside the `Benchmark` struct, the `!Benchmark` return type indicates that this function may fail and return an error, and thus, the caller must handle this error.

```zig
pub fn init(name: []const u8, allocator: *std.mem.Allocator) !Benchmark {
        var startTime: u64 = @intCast(std.time.microTimestamp());
        if (startTime < 0) {
            std.debug.warn("Failed to get start time. Defaulting to 0.\n", .{});
            startTime = 0;
        }
...
};
```

3.  ***Control over memory allocation***: Zig gives developers explicit control over memory allocation, which can be seen from the use of allocators in the `init` function within the `Benchmark` struct. This control enables Zig programmers to optimize their applications for resource-constrained environments, and to prevent memory leaks and other memory-related issues.

4.  ***Importing files***: In Zig, you import files with the `@import` directive. This is a built-in function, and its argument must be a constant string. This function can be seen in use at the top of the code snippet:


```zig
const std = @import("std");
const c = @import("./util/color.zig");
const t = @import("./util/timer.zig");
const format = @import("./util/format.zig");
```

5.  ***comptime (compile-time) feature***: The `comptime` keyword is used in Zig to run computations at compile-time. It allows the programmer to generate efficient code without having to resort to code generation scripts or build-time computations. This feature is demonstrated in the `run` function where `comptime` is used to compute the `func: BenchFunc` during compile-time.


```zig
pub fn run(comptime func: BenchFunc, bench: *Benchmark, benchResult: *BenchmarkResults) !void {
...
}
```

6.  ***Function calling convention***: Zig uses a special calling convention for functions. For instance, when calling member functions, Zig passes `self` as an explicit first argument to the function:



```zig
pub fn start(self: *Benchmark) void {
        self.timer.start();
        self.startTime = self.timer.startTime;
    }
```

These features together contribute to making Zig a unique and compelling language, particularly for system-level programming where control over system resources is crucial.

Zig vs. Rust: A Quick Comparison
--------------------------------

Throughout this project, I often found myself comparing Zig with Rust. If you've worked with Rust, you know how straightforward the package manager, Cargo, makes things. It handles dependencies and builds packages without breaking a sweat. Zig, however, doesn't yet have this feature, making dependency management a more hands-on task.

But here's the thing, both Zig and Rust are aiming to achieve different things. Rust's forte lies in preventing undefined behavior and data races, making it a good fit for large, complex systems. Zig, on the other hand, is all about offering a simpler alternative to C/C++, not focusing on solving these complex issues.

Ups and Downs with Zig
----------------------

One of the main challenges I faced was managing dependencies in Zig. It required constant attention to updating and initializing the submodule whenever the repository was cloned. Having a package management system like Rust's Cargo would definitely make this smoother.

That said, Zig does have its perks. Its syntax is refreshingly simple and will feel familiar if you've worked with C/C++. This could make it easier to pick up for those well-versed in these languages.

Conclusion
----------

My journey with Zig, while challenging, was highly rewarding. Despite the growing pains that come with a new language, I was able to create a functional benchmarking library and appreciate the potential of Zig. I believe that with the further development of the ecosystem and improvements in tooling, Zig could become a serious competitor to C/C++ in terms of speed and simplicity.

In conclusion, Zig offers a unique approach to programming, particularly in the systems domain. Its focus on explicit error handling, control over memory allocation, and compile-time computation contribute to clear, robust, and efficient code. Additionally, Zig's custom types and structs enable flexibility and precision in data structure design, catering to the specific needs of a project.

The language's syntax, while distinct, is designed to enhance readability and reduce ambiguity. Zig's function calling convention, for example, might initially seem unusual to developers accustomed to other languages, but it brings clarity by making the scope and use of variables explicit.

I look forward to continuing my journey with Zig, and I'm excited about the possibilities this new language brings to the table.
