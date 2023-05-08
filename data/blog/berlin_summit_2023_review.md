---
publishDate: "May 8 2023"
title: "Berlin Summit 2023 Writeup"
description: "Highlights, tips, recommendations from this years summit."
image: ~/assets/images/thumbnails/berlin_summit_keynote.jpg
imageCreditUrl: https://double-trouble.dev
tags: [conf, aws]
---

This years Berlin Summit showed why it needs to be taken seriously. The usual two day format got
compressed into one, which made it feel that much more exciting. Polished booths, a diverse crowd,
plenty of snacks, exciting challenges and good talks.

During this Summit Hendrik had stayed away, in part because of mixed reviews from
previous years, so only I went. And it was worth it!

# First Impressions

Heading straight into the "AWS World" area, waiting there was a difficult and fast-paced AWS quiz,
along with AWS socks and stickers. The quiz was exceptional, and I really wish they would bring it
out as an app for training.

A cloud style escape room, a Four In A Row (Connect Four) against AI, and AWS principal cloud
architects Architects already waiting on the sidelines, made me eager to come back later and
explore more. The Four In A Row was interesting, as the metrics were published through
[Athena](https://docs.aws.amazon.com/athena/latest/ug/what-is.html) into a Grafana dashboard. Nice
to see that for small datasets and optimized queries, load times can be as fast as 0.5 seconds.

![4 In A Row Dashboard](/src/assets/images/berlin_summit_2023_review/berlin_summit_4_in_a_row.jpg)

But off to the talks! AWS divides its talks into skill levels: 200, 300 and 400. These talks are
not livestreamed, and they are not uploaded to youtube. With the occasional exception of the
keynote, you have to be there to see them.


As the Summit is traditionally not a release-fest like Reinvent, and also many of the talks are
held by aws customers, picking a talk is not as easy as searching for an AWS service. Instead of
pure technical deep dives, many of the Summit talks consist of stories. Big AWS customers like
Volkswagen, Mercedes-Benz & more, share learnings from some of their biggest cloud
endeavours. While some of them keep it light, or shy away from technical details, in others a
leading engineer will bluntly tell you what worked and what didnt. Besides that, there are also
those expert talks by AWS, that focus only on a given architecture or pattern. Independent of
your skill level, this can give you a *feel* for aws - something that cannot be found in the docs,
the product video or in tutorials.

While I thought the keynote was underwhelming due to its overly heroic focus on the situation in
Ukraine, and the boring talk from Siemens, what followed was much better. After past years of swag
hunting, this year I was satisfied with the AWS socks and stickers I got early on, and got sucked
into one talk after the other.

# Ideas and Highlights

Opposite to the Nodeconf we visited last year, the Berlin Summit didn't really have a common
theme - well, except for the usage of AWS. The different stories and learnings provided by big AWS
customers, as well as from AWS themselves, still provided a constant stream of brainfood and new
ideas.

Ideas from the talks I saw:
- Data Visibility in the company is key.
- Consider the impact a customized experience could have on your customers and revenue.
- When building an AI, look at existing use-cases over here https://aiexplorer.aws.amazon.com/

Highlights and Learnings:
- Quite possibly my favorite talk was ANT301 (Frictionless Compliant Data & Analytics Environments
  at Merck). Kudos to [John Mousa](https://www.linkedin.com/in/johnmousa/) for making this
  presentaiton exceptionally kind, enjoyable and insightful. Truly a talk of its own league.
  ![](/src/assets/berlin_summit_2023_review/ant301_people.jpg)
  - You make change happen by identifying innovators and empowering them
  - It is useful to have different shapes of datasets stored for different users, so people can
    iterate over them together. Storing only the final results of a data analysis will result in a
    mess and many people stirring their own pot.
    ![](/src/assets/berlin_summit_2023_review/ant301_layers.jpg)
- [Jonathan Weiss'](https://www.linkedin.com/in/jonathan-weiss-26938622/) MAD202 (The Amazon
  Development Process) must have been a close second. Keeping feedback loops short is key. Amazon
  calls it the ECT Loop (edit-compile-test), I term it "the feedback loop of doom".
  - Ops meetings can be a good way to increase dashboard and monitoring practices in your company
    ![](/src/assets/berlin_summit_2023_review/mad202_ops_meetings.jpg)
  - Change happens by treating Service teams as independent startups. They are empowered to make
    their own decisions. They can decide, which feature they believe will serve the customer
    best. As a trade-off for more autonomy, they get held accountable only through KPIs, looking
    at the end results.
  - Following Werner Vogels approach of [working
    backwards](https://www.allthingsdistributed.com/2006/11/working_backwards.html) from customer
    needs is one of the hardest and most important things to put into practice.
- MAD303 (Unlocking Business Agility with Event-Driven Architectures), a great architecture talk,
  really hammered home the point of putting queues behind event receivers. Allowing any subscribers
  to receive your messages, while the receiver takes care of first putting these events into a
  queue, makes for a resilient event-driven architecture.
  ![](/src/assets/berlin_summit_2023_review/mad303_pattern.jpg)
- ANT203 (Streamlining Manufacturing Reports at Volkswagen Group) told a great story about data
  migration.
  - Sometimes you'll have to provide people with a sense of control. On request they implemented
    "kill-switch" for local database operators to possibly stop cloud migrations, in case of
    "emergency". Along the same lines in another talk, execute leadership was given control over a
    confidence percentage slider, for an AI model.
  - Two great quotes I took with me, that I couldn't even spot on the slides:
    - > Redshift is not a typical db. It is a data warehouse, that happens to have an SQL interface
      infront of it.
    - > Use Redshift for its intended purpose: Transforming huge chunks of data from one format to another.

- Last but not least, a "Zero ETL" AWS solution got teasiered in one of the talks. It is said to
  be coming up later this year, using Aurora and Redshit. A solution that aims at simpler,
  on-demand data pipelines.


# Recommendations

When visiting the summit:
- Enter the AWS world area early. Here you get cool AWS swag but without the sales pitch. A good
  thing to mark off your list early in the day.
- Stay away from the booths, they are honestly not worth it. They want to book a sales demo with
  you, but you for the most part, you just want their swag. A combo that is bound to nibble on
  your precious energy on this long summit day.
- Stay away from the general coffee, and from the free sodas. One or two of those and you'll be
  fine, but one too many and you'll be off on a weird sugar-caffeine
  rollercoaster. Serverlesspresso all the way!
- Getting a cool coffee at Serverlesspresso is a must. It is the way to get to know new tech
  people in the industry, and to hear their stories. There's nothing easier than staring at a step
  function brewing your coffe, and chatting up the next one in queue, who is doing the same.
  ![Serverlesspresso](/src/assets/berlin_summit_2023_review/berlin_summit_23_serverlesspresso.jpg)
- To navigate around the summit, get a paper map outside of the keynote hall, and get the AWS
  Events app for your phone.


Personal take-aways for my next attendance:
- Dont bring your laptop, there is absolutely no need.
- Bring a small metal-box to protect smaller stickers during travel.
- Have topics in mind you want to evangelize.


# Rounding Up

Finishing up the post, I think it cannot be understated which kind of hype and enjoyment I got
from this years summit. Will I go again? Yes, 100%.
