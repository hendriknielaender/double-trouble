---
publishDate: "September 22 2023"
title: "Managing Zig Versions with zvm"
description: "Zig Programming Landscape: Creating a Benchmarking Library"
image: ~/assets/images/thumbnails/zvm.png
imageCreditUrl: https://www.midjourney.com/
tags: [gptpost, zig, rust, benchmark, release]
---

Zig has rapidly gained attention for its strong emphasis on simplicity, performance, and first-class support for modern hardware architectures. But as with any programming language, developers have to manage different versions to suit their project requirements or to test their code against multiple compiler versions. Meet zvm, the Zig Version Manager, a tool built to simplify your Zig development workflow.

What is zvm?
--------------------

zvm is a version management tool for Zig. It allows developers to:

- Install different versions of the Zig compiler
- Switch between different versions seamlessly

### How does zvm work?

In this post, I won't go over how to install zvm or list all its features. Instead, I want to share some cool things i learned while building it. If you're curious about all the details or want to help improve zvm, check out the [zvm GitHub project page](https://github.com/hendriknielaender/zvm). You'll find how to install it and all the options you can use. Contributions and feedback are welcomed!


### A Simple Approach to CLI Command Parsing in Zig

In building `zvm`, one of the key tasks was to implement a CLI (Command-Line Interface) that can effectively parse user input. This is crucial for a smooth user experience and for enabling the tool to act accordingly. Below is a simplified explanation of how I went about implementing CLI command parsing in Zig.

#### Main Points:

1\. **Data Structures**: I created custom structs, namely `CommandData` and `CommandOption`, to hold the relevant command and parameters.

```zig
    const CommandData = struct {
        cmd: Command,
        params: ?[]const u8,
    };

    const CommandOption = struct {
        short_handle: ?[]const u8,
        handle: []const u8,
        cmd: Command,
    };
```

2\. **Command Enumeration**: A simple enum type, `Command`, is used to represent the different commands supported.

```zig
    pub const Command = enum {
        List,
        Install,
        Use,
        // ...
    };
```

3\. **Parsing Arguments**: I used a `parseArgs` function to iterate through the command-line arguments and find a match within the available commands.

```zig
    fn parseArgs(args: []const []const u8) !CommandData {
        const options = getAvailableCommands();
        // ...
        return findCommandInArgs(args[1..], options) orelse CommandData{ .cmd = Command.Unknown, .params = null };
    }
```

4\. **Handling Commands**: A `handleCommands` function is used to perform the action associated with each parsed command.

```zig
    pub fn handleCommands(cmd: Command, params: ?[]const u8) !void {
        switch (cmd) {
            Command.List => try handleList(),
            // ...
        }
    }
```

This way, when the program starts, the `main()` function captures the CLI input and uses `parseArgs` to interpret the commands. Then, `handleCommands` takes care of executing the relevant functionality.

You can easily adopt this approach for any CLI application you're building. Just copy these general structures and functions, and adjust them to fit your specific needs.

How to access options in zig?
-----------------------------

### Modifying `build.zig`

In your `build.zig`, declare the semantic version like this:


```zig
const version = std.SemanticVersion{ .major = 0, .minor = 1, .patch = 0 };
```

Then, add an option to your build script to accept this semantic version.

```zig
const options = b.addOptions();
options.addOption(std.SemanticVersion, "zvm_version", version);
```

This creates a build option called `zvm_version` that will hold the semantic version of zvm.

### Using Version Information

After declaring and setting the semantic version in `build.zig`, you can now access this information in your application.

In your application code, you could use it like this:

```zig
const options = @import("options");
std.debug.print("zvm {}\n", .{options.zvm_version});
```

Voila! Now your application knows what version it's using. This can be incredibly useful for debugging, logging, or any features that are version dependent.
