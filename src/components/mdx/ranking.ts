export type Tool = {
  Name: string;
  Link: string;
  GithubStars: number;
  GithubIssues: number;
  BootstrapTime: number;
  FirstDeploymentTime: number;
  CodeDeploymentTime: number;
  DirtyDeploymentTime: number;
  LocalExecution: number;
  LocalDebugging: number;
  StreamedCloudExecution: number;
  OverallDX: number;
  VersatilityRating: number;
};

export type Metric = Exclude<keyof Tool, "Name" | "Link">;

export type WeightName =
  | "Popularity"
  | "Issues"
  | "Speed"
  | "DX"
  | "Versatility";

export type Weights = Record<WeightName, number>;

export const initialWeights: Weights = {
  Popularity: 1,
  Issues: 1,
  Speed: 1,
  DX: 2,
  Versatility: 1,
};

export const maxWeight = 3;

const thousands = (value: number) =>
  value >= 1000 ? `${value / 1000}k` : String(value);
const seconds = (value: number) => `${value}s`;
const faster = (cap: number) => (value: number) => 1 - Math.min(value / cap, 1);

export const columns: {
  key: Metric;
  label: string;
  format: (value: number) => string;
  tone?: (value: number) => number;
}[] = [
  { key: "GithubStars", label: "GitHub stars", format: thousands },
  { key: "GithubIssues", label: "GitHub issues", format: thousands },
  {
    key: "BootstrapTime",
    label: "Init time",
    format: seconds,
    tone: faster(105),
  },
  {
    key: "FirstDeploymentTime",
    label: "First deploy",
    format: seconds,
    tone: faster(105),
  },
  {
    key: "CodeDeploymentTime",
    label: "Code deploy",
    format: seconds,
    tone: faster(49),
  },
  {
    key: "DirtyDeploymentTime",
    label: "Dirty deploy",
    format: seconds,
    tone: faster(49),
  },
  {
    key: "LocalExecution",
    label: "Local execution",
    format: String,
    tone: (v) => v,
  },
  {
    key: "LocalDebugging",
    label: "Local debugging",
    format: String,
    tone: (v) => v,
  },
  {
    key: "StreamedCloudExecution",
    label: "Streamed cloud execution",
    format: String,
    tone: (v) => v,
  },
  { key: "OverallDX", label: "DX", format: String, tone: (v) => v / 3 },
  {
    key: "VersatilityRating",
    label: "Versatility",
    format: String,
    tone: (v) => v / 3,
  },
];

export function score(tool: Tool, weights: Weights): number {
  const speed =
    (tool.BootstrapTime * 0.5 +
      tool.CodeDeploymentTime +
      tool.DirtyDeploymentTime +
      tool.FirstDeploymentTime) /
    60;
  return (
    -(tool.GithubIssues / 1000) * weights.Issues +
    (tool.GithubStars / 10000) * weights.Popularity -
    speed * weights.Speed +
    tool.VersatilityRating * weights.Versatility * 0.5 +
    (tool.StreamedCloudExecution +
      tool.OverallDX +
      tool.LocalExecution +
      tool.LocalDebugging) *
      weights.DX
  );
}

export const notes: Record<string, Partial<Record<Metric, string>>> = {
  CDK: {
    LocalExecution:
      "Works by leveraging AWS SAM. Same limitation as sam, plus it doesn't support hot reloading (aws-sam-cli/issues/4000)",
    OverallDX:
      "The amount of work-arounds and hacks needed to make the CDK work as expected for us is substantial. Local execution itself only works by hooking in SAM. The v2 / v3 migration efforts, together with a bunch of alpha plugins for services like AppSync make for a lackluster experience overall.",
  },
  CDKTF: {
    OverallDX:
      "Not a drop-in replacement to the normal CDK dependency at all as one might expect. Completely new packages that need to be seperately downloaded which are also not typed.",
  },
  SAM: {
    LocalExecution:
      "Does work in general but not for the bun lambda layer. Bun runtime wont start because sam local won't pass a traceId.",
  },
  Terraform: {
    GithubStars:
      "Here we combined the stars from the terraform repo and the aws-provider package together, same for the issues.",
    OverallDX:
      "Terraform is simple and might have fewer features than others, but it does what it's supposed to do. No local execution but also no hacky solutions or surprises in this area. Less is more for terraform.",
  },
  "Serverless Framework": {
    DirtyDeploymentTime:
      "Dirty deployments are currently not supported (serverless/issues/4454), but certain delpoyments can still be sped up either with the --update-config flag, only for config updates, and --aws-s3-accelerate for artifact upload speed improvements.",
    LocalExecution:
      "Local Execution depends on the javascript build plugin which does not yet exist for bun.",
  },
  SST: {
    BootstrapTime:
      "Both the CDK bootstrap stack as well as the SST bootstrap stack need to be deployed, which results in a higher init time.",
    OverallDX:
      "The custom runtime property is currently not supported by sst, they only support the container version(sst/sst/issues/3264). Even still, the DX of SST is absolutely outstanding.",
    CodeDeploymentTime:
      "Increased deployment times everywhere here as custom runtimes are not supported, only the container version, which takes longer to deploy and build.",
    LocalDebugging:
      "Doesnt seem to work yet for containers, but works in general for supported runtimes and is well documented.",
  },
};

export const tools: Tool[] = [
  {
    Name: "Terraform",
    Link: "https://github.com/hashicorp/terraform",
    GithubStars: 48100,
    GithubIssues: 5500,
    BootstrapTime: 18,
    FirstDeploymentTime: 25,
    CodeDeploymentTime: 15,
    DirtyDeploymentTime: 15,
    LocalExecution: 0,
    LocalDebugging: 0,
    StreamedCloudExecution: 0,
    OverallDX: 2,
    VersatilityRating: 3,
  },
  {
    Name: "Open Tofu",
    Link: "https://github.com/opentofu/opentofu",
    GithubStars: 15300,
    GithubIssues: 119,
    BootstrapTime: 18,
    FirstDeploymentTime: 35,
    CodeDeploymentTime: 15,
    DirtyDeploymentTime: 15,
    LocalExecution: 0,
    LocalDebugging: 0,
    StreamedCloudExecution: 0,
    OverallDX: 2,
    VersatilityRating: 3,
  },
  {
    Name: "CDK",
    Link: "https://github.com/aws/aws-cdk",
    GithubStars: 10700,
    GithubIssues: 1900,
    BootstrapTime: 61,
    FirstDeploymentTime: 70,
    CodeDeploymentTime: 32,
    DirtyDeploymentTime: 12,
    LocalExecution: 0.5,
    LocalDebugging: 0.5,
    StreamedCloudExecution: 0,
    OverallDX: 1.5,
    VersatilityRating: 2.5,
  },
  {
    Name: "CDKTF",
    Link: "https://github.com/hashicorp/terraform-cdk",
    GithubStars: 4600,
    GithubIssues: 296,
    BootstrapTime: 19,
    FirstDeploymentTime: 26,
    CodeDeploymentTime: 16,
    DirtyDeploymentTime: 16,
    LocalExecution: 0,
    LocalDebugging: 0,
    StreamedCloudExecution: 0,
    OverallDX: 1,
    VersatilityRating: 1,
  },
  {
    Name: "SAM",
    Link: "https://github.com/aws/aws-sam-cli",
    GithubStars: 6400,
    GithubIssues: 383,
    BootstrapTime: 47,
    FirstDeploymentTime: 49,
    CodeDeploymentTime: 31,
    DirtyDeploymentTime: 10,
    LocalExecution: 0.5,
    LocalDebugging: 0.5,
    StreamedCloudExecution: 0,
    OverallDX: 1.5,
    VersatilityRating: 2,
  },
  {
    Name: "SST",
    Link: "https://github.com/sst/sst",
    GithubStars: 18100,
    GithubIssues: 660,
    BootstrapTime: 233,
    FirstDeploymentTime: 156,
    CodeDeploymentTime: 81,
    DirtyDeploymentTime: 81,
    LocalExecution: 1,
    LocalDebugging: 0.5,
    StreamedCloudExecution: 1,
    OverallDX: 3,
    VersatilityRating: 2.5,
  },
  {
    Name: "Serverless Framework",
    Link: "https://github.com/serverless/serverless",
    GithubStars: 45300,
    GithubIssues: 1000,
    BootstrapTime: 43,
    FirstDeploymentTime: 55,
    CodeDeploymentTime: 32,
    DirtyDeploymentTime: 32,
    LocalExecution: 0.5,
    LocalDebugging: 0.5,
    StreamedCloudExecution: 0,
    OverallDX: 3,
    VersatilityRating: 1,
  },
];
