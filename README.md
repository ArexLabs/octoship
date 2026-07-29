# @ims/octoship

Fetch any release, tag, branch, pull request, or issue from any GitHub repository.

## Installation

```bash
bun add @ims/octoship
# or
pnpm install @ims/octoship
```

## Quick Start

```ts
import {
  fetchLatestRelease,
  fetchAllReleases,
  fetchAllTags,
} from "@ims/octoship";

// Fetch the latest release of a repository
const release = await fetchLatestRelease("facebook/react");

// Fetch all releases
const releases = await fetchAllReleases("facebook/react");

// Fetch all tags
const tags = await fetchAllTags("facebook/react");
```

## Configuration

Create an `octoship.yaml` in the root of your project:

```yaml
token: "ghp_your_github_token"        # Optional: for authenticated requests
defaultRepository: "owner/repo"       # Optional: default repo for all calls
defaultBranch: "main"                 # Optional: default branch name
perPage: 30                           # Optional: results per page (default: 30)
userAgent: "my-app"                   # Optional: custom User-Agent header
```

You can also set the `GITHUB_TOKEN` environment variable. If both are present, the `token` in `octoship.yaml` takes precedence.

> **Note:** Authentication is optional for public repositories but recommended to avoid rate limiting (60 requests/hour unauthenticated vs 5,000 authenticated).

## API

All functions accept an optional `repositoryUrl` parameter (e.g. `"owner/repo"`). If omitted, the `defaultRepository` from `octoship.yaml` is used.

### Releases

```ts
// Latest release
const release = await fetchLatestRelease("owner/repo");

// Release by tag
const release = await fetchRelease("v1.0.0", "owner/repo");

// First (oldest) release
const release = await fetchFirstRelease("owner/repo");

// All releases
const releases = await fetchAllReleases("owner/repo");
```

### Tags

```ts
const tags = await fetchAllTags("owner/repo");
```

### Branches

```ts
const branches = await fetchAllBranches("owner/repo");
```

### Pull Requests

```ts
// All pull requests
const prs = await fetchAllPullRequests("owner/repo");

// Latest pull request
const pr = await fetchLatestPullRequest("owner/repo");
```

### Issues

```ts
// All issues
const issues = await fetchAllIssues("owner/repo");

// Latest issue
const issue = await fetchLatestIssue("owner/repo");
```

## Types

All return types are fully typed and exported:

- `GitHubRelease`
- `GitHubTag`
- `GitHubBranch`
- `GitHubPullRequest`
- `GitHubIssue`
- `GitHubUser`
- `GitHubAsset`
- `GitHubLabel`
- `OctoshipConfig`

## Error Handling

All functions throw an `Error` when:

- The GitHub API returns a non-OK response (404, 403, 500, etc.)
- No repository is specified (neither parameter nor config)
- A "fetch latest/first" function finds no results

```ts
try {
  const release = await fetchLatestRelease("owner/repo");
} catch (error) {
  console.error(error.message);
  // "GitHub API error: 404 Not Found — https://api.github.com/repos/owner/repo/releases/latest"
}
```

## RoadMap

1. Replace tsup with tsdown

## License

[Apache-2.0](LICENSE)
