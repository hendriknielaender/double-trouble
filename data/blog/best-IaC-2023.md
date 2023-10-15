---
publishDate: "Oct 14, 2023"
title: "The best IaC tool in 2023"
description: "A fresh look at infrastructure provisioning tools in 2023 and their performance across different categories."
image: "~/assets/images/thumbnails/iac_best_2023.jpg"
imageCreditUrl: https://labs.openai.com/
tags: [terraform, cloud, infrastructure, IaC, ranking]
---

At the workplace, the choice of IaC tooling is largely determined by company policy, by what is
generally already used and works reasonably well. Through years of evolution and growing maturity,
a few projects have gained the most popularity: CDK and terraform (data?). But taking a fresh
look today, what could be the best tool today in the context of AWS?

Let's find out and take a look at the best infrastructure tools of the year. We'll evaluate
currently available infrastructure as code (IaC) tools, and look at them within certain
categories. This is in a specific context which we believe is relevant today: A lambda function
within an AWS account, which runs ontop of bun.

All the code related to this comparison can be found in this repository: [flyck/terraform-in-2023](https://github.com/flyck/terraform-in-2023).

## Contenders

### Terraform

### Open Tofu

### CDK

### CDKTF

### SST

### Serverless Framework

### Non-Contenders

Among the plethora of tools available today,  can be used to provision infrastructure today, there are , but which we didnt consider:
- Pulumi: Low popularity, pre-cursor to terraform (?)
- AWS Cloudformation & Co.: Too low level
- AWS Copilot [🐙](https://github.com/aws/copilot-cli/): Limited to containers
- AWS App Runner:
- AWS Proton:
- AWS Lightsail: Only for absolute cloud beginners
- AWS EBS: Community-hated service that AWS seems to want to deprecate.
- AWS Amplify: While it aims at being capable of deploying all infrastructure surrounding a
  full-stack app, it is still community-hated service with tons of issues.



## Evaluation

|Category|Terraform|Open Tofu|CDK|CDKTF|SAM|SST|Serverless Framework|
|-|-|-|-|-|-|-|-|
|Github Issues|
|Bootstrap Time|?|?|?|?|?|?|?|
|First deployment time|
|Code deployment time|
|Local Execution|
|Cloud Execution|
|Overall DX|2|2|1-2|1|1|2|3|
|Versatility Rating|2|2|3|1|?|?|1|


Bootstrap time: Some IaC frameworks use some kind of resources for state or access management,
which is shared across IaC projects within the same account.

Versatility Rating: The ability to add other infrastructure ontop of the lambda function and extend the
given stack

## On the sidelines: Winglang

Winglang is an up-and-coming IaC tool. It got founded in 2022(?) by the original founder of the
code that eventually became the CDK (link twitter for guy).

## Rounding up
