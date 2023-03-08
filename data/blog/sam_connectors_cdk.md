---
publishDate: "Mar 08 2023"
title: "AWS CDK & AWS SAM: Better together for least privilege?"
description: "Can we bring Sam Connectors and Sam Policy Templates into the CDK?"
image: "https://ermetic.com/wp-content/uploads/2020/08/cloude-header.jpg"
imageCreditUrl: https://ermetic.com
tags: [aws, cdk, sam, security]
---

Creating permissions that only give the minimum amount of permissions needed for the job can be a tedious task.

Depending on the service the documentation itself points out that Administrator permissions are needed. That's not very good. Some services do have aws managed policies, which can serve as a starting point, but more often than not the engineer has to start from scratch.

Interestingly, AWS Sam has recently come out with a couple of related announcements:
- 10th of Oct 2022: The release of SAM Connectors ([AWS What's New?](https://aws.amazon.com/about-aws/whats-new/2022/10/aws-sam-serverless-connectors/) announcement). A new custom resource that wants to `to simplify granting the appropriate level of access to the resources in their application’s infrastructure.`
- Feb 9th, 2023: Sam Connectors can now also be defined on the resource itself, not only the lambda function ([AWS What's New?](https://aws.amazon.com/about-aws/whats-new/2023/02/aws-sam-connectors-resource-parameter/) announcement)

So as we're using the CDK in our company, the question for this blog post is: Using the CDK, can we leverage sam connectors? AWS themselves has already said that SAM and the CDK are [better together](https://aws.amazon.com/blogs/compute/better-together-aws-sam-and-aws-cdk/), as SAM can now [officially](https://docs.aws.amazon.com/cdk/v2/guide/sam.html) run cdk resources locally. But can it also help with least privilege?

We will first have a look at the sam connectors by using them as intended in sam itself, and then we'll attempt to port that into CDK.

Looking at the [sam permissions](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-permissions.html) guide sam actually has another handy approach for permissions: [community templates](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-policy-templates.html). So we will also have a look at that further down in the blog.

But let's first have a look at the Sam Connectors.

## Sam Connectors Example

Following the usual shebang of installing sam, cloning a hello world app (sam helps here) and opening up that old free tier aws account again, we can finally start.

Our app will do a simple thing, it will create a lambda function which can read and write to a s3 bucket. The interesting part can be found from line 4 to 11:

```yaml
Resources:
  HelloWorldFunction:
    Type: AWS::Serverless::Function # More info about Function Resource: https://github.com/awslabs/serverless-application-model/blob/master/versions/2016-10-31.md#awsserverlessfunction
    Connectors:
      MyConn:
        Properties:
          Destination:
            Id: S3Bucket
          Permissions:
            - Write
            - Read
    Properties:
      CodeUri: hello-world/
      Handler: app.lambdaHandler
      Runtime: nodejs16.x
      Architectures:
        - x86_64
    Metadata: # Manage esbuild properties
      BuildMethod: esbuild
      BuildProperties:
        Minify: true
        Target: "es2020"
        # Sourcemap: true # Enabling source maps will create the required NODE_OPTIONS environment variables on your lambda function during sam build
        EntryPoints:
          - app.ts
  S3Bucket:
    Type: AWS::S3::Bucket
    Properties:
      BucketName: "wopwopw123"
```

Executing first `sam build` and then `sam deploy --guided` a bunch of times (why isn't that the same command btw), and then spamming enter to answer the deployment guide, we have ourselves a deployed stack.

As sam connectors are a custom resource, we cannot see the role in the cloudformation stack **until after it is deployed**. The sam demo template itself points out that it is `an implicit resource` further down in the output section.

Opening the function role, along with the `AWSLambdaBasicExecutionRole` default policy we find the following custom policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
                "s3:GetObject",
                "s3:GetObjectAcl",
                "s3:GetObjectLegalHold",
                "s3:GetObjectRetention",
                "s3:GetObjectTorrent",
                "s3:GetObjectVersion",
                "s3:GetObjectVersionAcl",
                "s3:GetObjectVersionForReplication",
                "s3:GetObjectVersionTorrent",
                "s3:ListBucket",
                "s3:ListBucketMultipartUploads",
                "s3:ListBucketVersions",
                "s3:ListMultipartUploadParts"
            ],
            "Resource": [
                "arn:aws:s3:::wopwopw123",
                "arn:aws:s3:::wopwopw123/*"
            ],
            "Effect": "Allow"
        },
        {
            "Action": [
                "s3:AbortMultipartUpload",
                "s3:DeleteObject",
                "s3:DeleteObjectVersion",
                "s3:PutObject",
                "s3:PutObjectLegalHold",
                "s3:PutObjectRetention",
                "s3:RestoreObject"
            ],
            "Resource": [
                "arn:aws:s3:::wopwopw123",
                "arn:aws:s3:::wopwopw123/*"
            ],
            "Effect": "Allow"
        }
    ]
}
```

Interesting are the two different statements, the **first one** is for the **read connector**, the **second one** for **write**. Noteworthy is that the write statement mentions the bucket resource itself, though none of the granted actions work on the bucket level. Also the resource section includes the bucket resource directly, which is actually not needed for any of the granted actions in that section.

It can be debated how useful such an automatically generated policy is that you cannot alter or pin down further, but that might be the whole point - you are supposed to be lifted off the burdon of least privilege.

Interesting are also the supported recources for sam connectors. Generally the permission model knows only `Read` and `Write`, and the list of supported can be found in the [reference](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/reference-sam-connector.html). Generally by the time of writing the supported resources are:
- Lambda Functions
- SNS Topics
- S3 Buckets
- Dynamodb Tables
- API Gateways
- Eventbridge Rule
- SQS Queues
- Step Functions

Extra mutations occur because of the custom `Serverless::` resource types introduced by SAM. Now that we have a first taste of sam connectors, let's move over to the policies.

## Sam Policy Templates

Sam Policy templates or as we would dub them community templates - as the repo is open for [submissions](https://github.com/aws/serverless-application-model/blob/develop/samtranslator/policy_templates_data/policy_templates.json) - are another approach for better policies.