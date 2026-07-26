import type { components } from "@octokit/openapi-types";

export type GitHubRelease = components["schemas"]["release"];
export type GitHubReleaseAsset = components["schemas"]["release-asset"];
export type GitHubTag = components["schemas"]["tag"];
export type GitHubBranch = components["schemas"]["short-branch"];
export type GitHubPullRequest = components["schemas"]["pull-request"];
export type GitHubIssue = components["schemas"]["issue"];
export type GitHubUser = components["schemas"]["simple-user"];
export type GitHubLabel = components["schemas"]["label"];
