---
publishDate: "November 19 2026"
title: "You Don't Push Hard Enough"
description: "We have AI-powered tools, but we still work like it's the stone age. Why our speed hit a plateau - and how to push past it."
image: "../../src/assets/images/thumbnails/product_engineers_dalle.png"
imageCreditUrl: https://labs.openai.com/
tags: [ai, agents, productivity, workflows, engineering]
---

<!-- TODO: replace the thumbnail above with the Flintstones-style meme / a dedicated cover image -->

> **Status: idea mapping.** Building blocks for the argument, not prose yet.
>
> **Meta rule:** no ranting about our own work, in any way. Patterns we all share across the
> industry, framed as an opportunity ("more is possible"), not as a complaint.

## 1. Opening: the meme

**Core idea:** Flintstones - modern conveniences, stone age power source. Modern tools, old
approach.

> 🖼️ **MEME PLACEHOLDER** - Fred at a stone "workstation", an AI agent humming on the screen,
> while he still chisels the ticket into a stone tablet. Caption idea: _"Modern tools. Stone age
> workflows."_

- Use it early, right at the top
- Keep the intro short: meme + 2 short paragraphs max
- Teaser at the end of the intro: this is not just a rant - we also talk about solutions
  (e.g. _"…and what we can do about it: drawing a new line of control."_)

## 2. The problem

> 🚧 **UNDER CONSTRUCTION** - problem statement needs more work

**Core idea:** Innovation has hit a plateau - not because of the tools, but because of the
process around them. **The leverage of a better process is now much higher than the leverage of a
slightly better model or slightly better AI usage.**

- Tools are smart - feels like a lot is possible already
- It's not (only) that execution speed hit a plateau - the whole process feels uncomfortable
  - The way we channel innovation (idea → plan → build → ship) no longer seems enough
  - Initial bump when the tools arrived, then it flattened out
- Key point: marginal vs. radical
  - A marginally better model won't fundamentally change this
  - Only a radical model jump would - and we don't need to wait for that
  - A better process is the bigger lever, available today
- Possible phrasing: _"The bottleneck moved from the model to the process."_
- Hook into the title via Thorsten Ball:
  > "you won't get a good look if you don't push them hard enough"
  >
  > - Thorsten Ball, [Joy & Curiosity #72](https://registerspill.thorstenball.com/p/joy-and-curiosity-72)
  - His context: he's talking about the _models_ (see for yourself what they can and can't do)
  - Our twist: the same applies to our _workflows_
- Open: what did the friend find on Twitter? Maybe a better / more ranty quote

## 3. Examples of the problem

> 🚧 **UNDER CONSTRUCTION** - examples need more work

### 3.1 Trapped in the planning cycle (main example)

**Core idea:** We plan ahead as if we already knew what we want, then build it. That's an old way of
thinking from when building was the expensive part.

- Not about sprints vs. Kanban - both have planning cycles
- Safe example: same Jira sprint workflows as before AI
  - Only the current cycle is planned → little to pull forward when done early
  - Reflex "then plan more" → just makes the old cycle bigger → _we don't push hard enough_

### 3.2 Bespoke tools are barely used

**Core idea:** Custom tools for internal processes are cheap now, but only a small part of
processes gets automated this way.

- "Build our own tool" used to be too expensive to consider - assumption no longer holds
- Limits how we can experiment

### 3.3 Shipping is easy, learning is not (minor)

**Core idea:** Success of a feature is rarely checked; the "why" of what gets built is rarely
reflected. Faster shipping makes the gap bigger.

- Weaker / more annoying than the others - keep it as #3

### 3.x More examples?

- ?

## 4. Possible solutions

> 🚧 **UNDER CONSTRUCTION** - solutions need more work

- **Key solution: draw the line of control - and match the review to it**
  - Reference our own earlier post:
    [Agile Roadmaps - Line of Control](/post/agile-roadmaps-release#what-is-the-line-of-control)
    - Hypotheses instead of epics → leadership can choose _where_ to draw the line: only KPIs?
      KPIs + hypotheses? + sprint goals? + iterations?
    - Less control from the top → more room to experiment below the line
  - Same idea, applied to review: not every PR, project or product needs the full review
    - If the goal is to verify a hypothesis or idea, we don't need to review the UX
      implementation in detail
    - Review effort should match the risk and the goal of the change
  - Reference: Will Larson,
    [Speeding up code review with `small-change`](https://lethain.com/small-changes/)
    (Oct 2026)
    - CI decides which PRs are "small changes" (size, author experience, scope; sensitive areas
      like money movement excluded) → fast approval instead of full human review
    - Errors are treated as a gap in automated verification, not a reason for more human review
    - > "We believe we move fast by finding narrow, contained ways to validate new practices"
  - Link to the problem: the line of control is a process lever, not a model lever
- **Plan less, learn more:** planning must get smaller to become dynamic → hypothesis-driven work
  (hypothesis → smallest experiment → learn → next step)
- **Build bespoke tools:** automate internal processes, make experiments cheap
- **Close the loop:** check features against the hypothesis they were built for
- ?

## 5. Conclusion

> 🚧 **UNDER CONSTRUCTION** - conclusion needs more work

- Back to the Flintstones: take the feet off the ground
- ?
