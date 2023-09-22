---
publishDate: "September 23 2023"
title: "Managing Zig Versions with zvm: A Technical Dive"
description: "Building CLI applications in Zig, using zvm for version management, and the challenges of JSON parsing."
image: ~/assets/images/thumbnails/zvm.webp
imageCreditUrl: https://www.labs.openai.com
tags: [gptpost, zig, zvm, release, version, cli, compiler]
---

With Zig's increasing popularity due to its focus on simplicity and performance, managing multiple Zig versions becomes a necessity. Enter `zvm`, the [Zig Version Manager](https://github.com/hendriknielaender/zvm), your go-to tool for a hassle-free Zig development experience.

Introduction to zvm: Simplifying Zig Version Management
-------------------------------------------------------

zvm is a version management tool for Zig. It allows developers to:

- Install different versions of the Zig compiler
- Switch between different versions seamlessly



You can find the tool [here](https://github.com/hendriknielaender/zvm), feel free to add comments or contribute.



### Behind the Scenes: Building zvm's Core Features

While I won't be detailing the installation process or enumerating every feature of `zvm` in this post, I'll be unraveling some intriguing insights and takeaways from my journey of building it. From its core components to the nuanced challenges, let's delve into the world of **CLI applications in Zig** and version management.


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

Leveraging build.zig: Accessing Options in Zig
----------------------------------------------

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

### Environment-Driven Configuration and Path Handling

The function `getZvmPathSegment` dynamically constructs a path based on an environment variable, allowing the software to be adaptable and avoid hardcoded values.

```zig
const user_home = std.os.getenv("HOME") orelse ".";
return std.fs.path.join(std.heap.page_allocator, &[_][]const u8{ user_home, ".zvm", segment });
```

Takeaway for Developers: Using environment variables, like `HOME` in this case, provides flexibility in path construction and makes your software more adaptable to different user setups. Especially when building cross-platform applications, it's beneficial to avoid hardcoded paths and instead derive them from reliable environment sources.

### Dynamic Symlinking for Version Management

The function `setZigVersion` updates the symbolic link to point to a specified Zig version. This is a fantastic approach to quickly switch between multiple installed versions of a tool.

```zig
const symlinkPath = try std.fs.path.join(allocator, &[_][]const u8{ userHome, ".zvm", "current" });
try updateSymlink(zigPath, symlinkPath);
```

After performing an operation, like changing the version, it's essential to confirm that the action had the desired effect. In this case, by checking the currently active version of Zig after attempting to switch.

### Challenges with Nested JSON Parsing in Zig

Zig's standard library offers support for JSON parsing through `std.json`. However there are several aspects that can be a bit cumbersome:

1.  Manual Iteration through JSON Objects

In the `fetchVersionData` function, i used an iterator to traverse the JSON object:

```zig
var it = root.object.iterator();
while (it.next()) |entry| {
  // ...code...
}
```

This means that we need to manually iterate over each key-value pair in the JSON, checking the keys against our expected fields.

2.  Nested JSON Handling

Handling nested objects requires additional iterators and nested loops:

```zig
var valObj = entry.value_ptr.*.object.iterator();
  while (valObj.next()) |value| {
    // ...code...
    const nestedObjConst = value.value_ptr.*.object.iterator();
    var nestedObj = nestedObjConst;
      while (nestedObj.next()) |nestedValue| {
        // ...nested handling...
      }
  }
```

This nested loop structure for handling nested JSON objects can quickly become complex, especially if the JSON structure depth increases. It can also make the code harder to follow.

3.  Error Handling for Missing Fields

After manually iterating and parsing the JSON data, i also have to check if all expected fields were found:
```zig
if (date == null or tarball == null or shasum == null) {
  return Error.MissingExpectedFields;
}
```
This kind of manual checking for every required field can become tedious and prone to oversight if the number of expected fields grows.

### Potential Enhancements

While Zig provides flexibility and performance, it does lean on the developer to handle many things manually. For JSON parsing, using or creating higher-level abstractions or libraries that facilitate JSON handling can help improve developer productivity and maintainability. Such utilities could offer:

-   Helper functions to retrieve fields with type safety.
-   More intuitive mechanisms for navigating nested JSON objects.
-   Automated checks for missing or unexpected fields.


## Wrap up

To sum it up, I hope this article helped you understand Zig development better, especially when creating CLI applications in Zig. With tools like zvm, handling different Zig versions becomes much easier. Sure, there might be some tricky parts like JSON parsing in Zig, but that's part of the fun and learning. Interested in more? Feel free to dive in, help out, share this, or read more about Zig. Here is another article [Taking off with Zig: Putting the Z in Benchmark](/zbench)

