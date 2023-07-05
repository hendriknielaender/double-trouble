---
publishDate: "July 08 2023"
title: "Zig Programming Landscape: Creating a Benchmarking Library"
description: "Explore the process of creating a benchmarking library in Zig."
image: ~/assets/images/thumbnails/lizard.png
imageCreditUrl: https://labs.openai.com/
tags: [gptpost, zig, rust, benchmark,]
---

My Journey in Creating My First Zig Library
===========================================

As a software engineer, I'm always fascinated by new languages and tools that could potentially revolutionize how we write and manage our code. When I discovered Zig, an open-source programming language that aims to rival C/C++ in its speed and simplicity, I was instantly intrigued. I decided to undertake the creation of my first Zig library. This was a challenge that taught me a lot about the current state of Zig, and allowed me to appreciate its potential, while also recognizing its limitations.

Starting with zBench
--------------------

My library, which I decided to call zBench, was inspired by the built-in testing benchmark package in Golang. I wanted to provide similar functionality to measure and compare the performance of Zig code.

Creating zBench wasn't without its challenges. Zig is still in its early days, and its API frequently changes. This inconsistency resulted in many rounds of troubleshooting and rewriting code to ensure compatibility with the latest versions.

Zig vs. Rust
------------

During my journey, I couldn't help but compare Zig to another language I'm familiar with, Rust. Rust, with its comprehensive package manager Cargo, makes it relatively straightforward to manage dependencies and build packages. I wished that Zig had something similar. Currently, the process to manage dependencies is more manual and less seamless than it is in Rust.

However, it's important to note that Zig and Rust have different goals. Rust aims to eliminate undefined behavior and data races, thus making it suitable for large, complex systems where security and stability are critical. On the other hand, Zig aims to be a more modern, simpler alternative to C/C++, without as strong a focus on avoiding these complex issues.

Struggles and Successes
-----------------------

One of the biggest challenges I faced was managing dependencies in Zig. This required careful updating and initialization of the submodule after cloning the repository. A more straightforward package management system, like Rust's Cargo, would make this process easier.

On a brighter note, I enjoyed the simplicity of Zig's syntax and its similarity to C/C++. The simplicity is definitely one of Zig's strengths and is something that will make it more accessible to developers who are familiar with C/C++.

Conclusion
----------

My journey with Zig, while challenging, was highly rewarding. Despite the growing pains that come with a new language, I was able to create a functional benchmarking library and appreciate the potential of Zig. I believe that with the further development of the ecosystem and improvements in tooling, Zig could become a serious competitor to C/C++ in terms of speed and simplicity.

As I conclude this post, I'd like to stress that Zig and Rust, while similar, cater to different needs and should be evaluated based on the requirements of the project. Zig offers a simpler, more modern alternative to C/C++, while Rust provides more robust mechanisms to avoid complex issues, making it suitable for larger, more intricate projects.

I look forward to continuing my journey with Zig, and I'm excited about the possibilities this new language brings to the table.
