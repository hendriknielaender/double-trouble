---
publishDate: "Sep 11 2023"
title: "Agile Roadmaps - How and Why Roadmaps can be better"
description: "A new approach for roadmapping and why we need it."
image: "~/assets/images/thumbnails/agile-roadmaps-1.png"
imageCreditUrl: https://midjourney.com
tags: [agile, roadmap, concept, mvp, launch]
---

If you're working in tech, chances are you've already been working agile. If you've been working
in agile, then you have been working on roadmaps. We find that this area in tech today needs a
big overhaul and a fresh approach. This post is drawing a sketch for such an approach, and will
cover theory, practice and an MVP.


## Project Planning Sucks

In a software industry that has gotten so used to its ways, imagining anything new seems to go far
off the beaten path. There is hardly any company today which doesn't use jira, clickUp, trello, or
similar. While a new approach will be more than likely highly discussed, challenged and debated,
talking to friends and colleagues before this launch, we can all agree: There is a
problem. Project planning sucks, today.

Where fellow engineers but also professionals from other domains can agree is this: Planning
software projects has gone bad. Sketching a software project in detail, estimating all the
tickets, setting a start and end date. On a high level, many companies try to plan the whole year
ahead. What looks agile in sprints, is often enough the slow chipping away at a crushing Epic,
which got created, estimated, planned and deadlined a long time ago.

![4 In A Row Dashboard](./../../src/assets/images/posts/agile_roadmaps_release/planning_fallacy.jpg)

And we can ask ourselves as a generation, does this work? Are we happy with the way we plan on a
high level? As engineers, in our work we strive to create systems that work like a well-oiled
machine, which work to a maximum level of efficiency for everybody involved and with a minimal
level of friction. Yet we do it within a systems, which feels totally different. It very much
feels like something that has a lot of room for improvement. It is time to take a step back, and
to evolve again.

## What's wrong with Roadmaps?

Roadmaps today are primarily a tool for communication. Roadmaps are generally presented to the
whole company in quarterly meetings. Where epics lie on the roadmap, what needs to be prioritized
and most importantly, what can be marked as done keeps project managers busy for the entire year.

Over time, what seems to have happened is that the visuals and the mechanics of the roadmap tools
like jira have shaped our culture. Instead of using roadmaps consciously to clarify dependencies
and priorities, in reality roadmaps are often turn into a game of deadlines.

3 Pictures of roadmaps (jira, clickup and linear)

> Once an Epic is started, suddenly the only thing that matters is this: Will it finish on time?

A seemingly endless series of deadline syncs and alignment meetings starts in the background,
sometimes more subtle. This is exactly our point of departure. This is were the old ways of
waterfall planning have not left us, and we start chasing deadlines all over again.

After an Epic starts, or let's say after the Kickoff, we say these questions should rather be on
our minds:
- What will we learn from our first sprint?
- What will be the customer feedback after our initial release?
- How will we use that feedback to come up with the next iteration?
- When will we stop chasing the initial idea and be okay with what we've achieved?

It seems that as an industry, when we plan on a high level we keep ignoring this weird curiosity
which we have known for 20 years:

> Fixed plans do not work in software development.

Looking at roadmaps today, we find that they create tendencies in the organization that conflict
with this key learning:
- Meeting a deadline means success
- Marking something big off the roadmap means success
- Changing the Epic plan after start means failure

On the surface these ideas look fine and good. The only problem is that they completely lack the
agile character that is emulated on the lower levels of execution. Chasing a deadline and hitting
it can mean success, and it can mean a team pulled through. More often than not it can also mean
what we already know:

> Planning software projects is hard, and we dont know everything upfront.

On the project level, chasing deadlines in many cases seems like a self-created nightmare. First
you dream them up, and then they chase you until the end. But then you wake up, and the deadline
gets postponed. Time and time again we find that the initial deadline was not at the heart of the
matter. But what could be more at the core of things than deadlines?

A very valued CEO of Hendrik and I used to say this:

> Always validate your hypotheses as early as possible.

As engineers living and thinking in iterations and releases, this statement is much closer to our
hearts. Not only was it a key learning from our CEO, which he wanted everyone to know, but it also
aligns more with agile. Validating a hypothesis iteratively and as soon as possible, that is
something that can be done! Pinning epics on roadmaps for the year ahead, this has hardly anthing
iterative left.

## From Epics to Hypotheses

ideas:
- difference between epic and hypothesis
- how epics are part of the planning paralysis problem
- what can be the status of a hypothesis: open, confirmed, disconfirmed, dropped, inactive

## How the next generation of roadmaps needs to look like

based on the previous paragraphs, let's sketch how they should look like.

- central kpis as part of the roadmap visual
- high-level hypothesis instead of packed epics
  - project managers should pursue hypothesis

Show the initial sketch of agile roadmaps

## Introducing the Agile Roadmaps MVP

Based on all these thoughts, double trouble has created an initial agile roadmaps implementation.

It focuses on all the mentioned concepts and can be seen here: https://flyck.gitlab.io/agile-roadmaps/

## Is a new roadmap really needed?

A new roadmap tool is not a key requirement to plan things better. It is only supposed to be a
tool that fosters a new view on planning, and a fresh approach.

We have observed that jira and other tools have influenced how people think, and what people focus
on. If this would work well, we could leave it at that.

## How can roadmaps be more agile today?

- Make epics thinner. Distill epics to their underlying hypothesis to reduce planning paralysis
- Re-introduce true kickoffs after fixing the hypothesis. Planning ahead for months < learning for
  the customer feedback as you go.
- Dont sync on epic progress, sync on iterations. an iteration is a customer feedback or learning
  based on a release.
- Celebrate PMs on the amount of iterations they did, not on the size of the Epic they closed.

## Rounding up

In the end we see that every initial idea is not perfect. This is the whole motivator behind this
approach. Where we can agree is that software project planning can be improved, but how exactly
this will go remains the question. If you would be interested in the agile roadmaps demo to be
build out further, feel free to join us with a contribution or make sure to mark the
repository. This would let us know that people are interested in this approach and we should build
it our further.
