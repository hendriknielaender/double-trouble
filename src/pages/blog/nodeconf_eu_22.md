---
layout: "../../layouts/BlogPost.astro"
title: "NodeConf EU 2022 Review"
description: "Visiting was a blast. Notes, Links and Inspirations we took from the conf."
pubDate: "Oct 17 2022"
heroImage: "https://cdn.eventyco.com/images/218907a0-4b28-472b-90cc-2226e388df6e.png"
---

Visiting was a blast. Notes, links and impressions from this years NodeConf EU.

General Theme:

-   Fastify is awesome
-   the 20/80 rule
-   node core development hype: stay up-to-date on updates and upgrade

Links:

-   [Fastify](https://github.com/fastify/fastify): modern, blazingly fast webserver
    -   [mercurius.dev](https://mercurius.dev/): graphql adapter for fastify
-   [NodeJS undici](https://github.com/nodejs/undici): a better web client, rewritten from scratch
-   [js-url](https://github.com/websanova/js-url): a faster version for URL parsing. URL parsing is used in almost every request
-   [autocannon](https://github.com/mcollina/autocannon): a handy tool for loadtesting
-   [ClinicJS](https://clinicjs.org/): a tool to diagnose NodeJS performance issues
-   [Lyrasearch](https://github.com/LyraSearch/lyra): A blazingly fast full-text search, written by a guy who tried to understand Elasticsearch
-   [Lavamoat](https://github.com/LavaMoat/LavaMoat): scope npm package access at runtime
-   The [NPM best practices guide](https://openssf.org/blog/2022/09/01/npm-best-practices-for-the-supply-chain/)
-   [Node API](https://github.com/nodejs/node-addon-api) to cross from node to other languages
-   [Node18 Native Test Runner](https://nodejs.org/api/test.html)
-   [Socket Runtime](https://github.com/socketsupply/socket): a p2p node runtime
-   [Graphql-yoga](https://github.com/dotansimha/graphql-yoga): A better graphql server?
-   [Cytoscape-js](https://github.com/cytoscape/cytoscape.js/): a visualization tool used in the industry, talked about it with one engineer. Otherwise he mentioned d3.
-   [NodeSource](https://nodesource.com/): Node freaks that build their own runtime. Very cool talk on opentelemetry!
-   CommonJS vs ES Modules [oppinions](https://blog.logrocket.com/commonjs-vs-es-modules-node-js/)
-   [web3.storage](https://web3.storage/): blockchain based storage on s3
-   [storj.io](https://www.storj.io/blog/how-storj-built-the-fastest-and-lowest-cost-cloud-video-sharing-option): blockchain based decentralized video streaming

General Notes

-   [Web Assembly](https://radu-matei.com/blog/nodejs-wasi/) is the cool kid
-   "Promises always fix callback issues"
-   "Javascript gets slower every time you modify an object"
    -   Object freezing is shallow
    -   Cool proposal in progress: Touples#[] and Records #{}
-   AbortSignal and setTimeout make things slower
    -   One AbortSignal bug will be removed soon, which will improve the performance of every single node request
    -   [Blog: Using AbortSignal in NodeJS](https://www.nearform.com/blog/using-abortsignal-in-node-js/)

Inspiration:

-   Add security checks to MR approval rules
-   Awesome workshops: Have it all in a readme, makes it easy to follow along. Predefined checkpoints as branches make it easy to have everyone on the same page
-   From centralization (cloud) back to decentralization (p2p) into the billions of hardware devices. A vision for computing future not in cloud but P2P.
-   Saw a DevOps engineer who is also node contributor <3
-   [ ] Buy a nice kyeboard
-   [ ] Fix that pesky iterm navigation bug, fix it also in magit with the gitflow plugin
-   [ ] Maybe just switch to alaccrity rust terminal

People and Corps:

-   [Matteo Collina](https://github.com/mcollina): Involved in many things, now build his own framework with platformatic.io
-   [Zakodium](https://www.zakodium.com/): Cool startup building open source tools for universities
-   [Bloomberg Engineering](https://www.bloomberg.com/company/careers/working-here/engineering/): Big sponsor, talked to some folks
-   [Nearform](https://www.nearform.com/blog): Organiser of the event, does many open source things
-   [Naugtur.pl](https://naugtur.pl/): Cool guy with cool presentation who talked about Lavamoat
-   [fusebit.io](https://fusebit.io): multi tenant saas platform

Travel Learnings:

-   Check out if a travel power adapter might be needed
-   Be aware of the local timezone when making train bookings
-   Print out all travel documents and have them in an easily reachable compartment of your bagpack
