import { loadConfig, type OctoshipConfig } from "./config";
import type {
  GitHubBranch,
  GitHubIssue,
  GitHubPullRequest,
  GitHubRelease,
  GitHubTag,
} from "./types";

export { loadConfig, type OctoshipConfig, resetConfig } from "./config";
export { computeSha256, verifyAssetChecksum } from "./crypto";
export type {
  GitHubBranch,
  GitHubIssue,
  GitHubLabel,
  GitHubPullRequest,
  GitHubRelease,
  GitHubReleaseAsset,
  GitHubTag,
  GitHubUser,
} from "./types";

// ── Internal Helpers ─────────────────────────────────────────────────────────

function resolveConfig(): OctoshipConfig {
  return loadConfig();
}

function resolveRepository(repositoryUrl?: string): string {
  const repo = repositoryUrl ?? resolveConfig().defaultRepository;
  if (!repo) {
    throw new Error(
      "No repository specified. Pass a repository URL or set 'defaultRepository' in octoship.json."
    );
  }
  return repo;
}

function buildHeaders(): Record<string, string> {
  const config = resolveConfig();
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };

  const token = config.token ?? process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (config.userAgent) {
    headers["User-Agent"] = config.userAgent;
  }

  return headers;
}

function buildUrl(
  repositoryUrl: string,
  path: string,
  params?: Record<string, string>
): string {
  const config = resolveConfig();
  let url = `https://api.github.com/repos/${repositoryUrl}/${path}`;

  const searchParams = new URLSearchParams();
  if (config.perPage) {
    searchParams.set("per_page", String(config.perPage));
  }
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      searchParams.set(key, value);
    }
  }

  const qs = searchParams.toString();
  if (qs) {
    url += `?${qs}`;
  }

  return url;
}

async function githubFetch<T>(url: string): Promise<T> {
  const response = await fetch(url, { headers: buildHeaders() });

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText} — ${url}`
    );
  }

  return (await response.json()) as T;
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function fetchLatestRelease(
  repositoryUrl?: string
): Promise<GitHubRelease> {
  const repo = resolveRepository(repositoryUrl);
  return await githubFetch<GitHubRelease>(buildUrl(repo, "releases/latest"));
}

export async function fetchRelease(
  tag: string,
  repositoryUrl?: string
): Promise<GitHubRelease> {
  const repo = resolveRepository(repositoryUrl);
  return await githubFetch<GitHubRelease>(
    buildUrl(repo, `releases/tags/${encodeURIComponent(tag)}`)
  );
}

export async function fetchFirstRelease(
  repositoryUrl?: string
): Promise<GitHubRelease> {
  const repo = resolveRepository(repositoryUrl);
  const releases = await githubFetch<GitHubRelease[]>(
    buildUrl(repo, "releases", {
      direction: "asc",
      page: "1",
      sort: "created",
    })
  );

  const [first] = releases;
  if (!first) {
    throw new Error(`No releases found for ${repo}`);
  }
  return first;
}

export async function fetchAllReleases(
  repositoryUrl?: string
): Promise<GitHubRelease[]> {
  const repo = resolveRepository(repositoryUrl);
  return await githubFetch<GitHubRelease[]>(buildUrl(repo, "releases"));
}

export async function fetchAllTags(
  repositoryUrl?: string
): Promise<GitHubTag[]> {
  const repo = resolveRepository(repositoryUrl);
  return await githubFetch<GitHubTag[]>(buildUrl(repo, "tags"));
}

export async function fetchAllBranches(
  repositoryUrl?: string
): Promise<GitHubBranch[]> {
  const repo = resolveRepository(repositoryUrl);
  return await githubFetch<GitHubBranch[]>(buildUrl(repo, "branches"));
}

export async function fetchAllPullRequests(
  repositoryUrl?: string
): Promise<GitHubPullRequest[]> {
  const repo = resolveRepository(repositoryUrl);
  return await githubFetch<GitHubPullRequest[]>(buildUrl(repo, "pulls"));
}

export async function fetchLatestPullRequest(
  repositoryUrl?: string
): Promise<GitHubPullRequest> {
  const repo = resolveRepository(repositoryUrl);
  const pulls = await githubFetch<GitHubPullRequest[]>(
    buildUrl(repo, "pulls", {
      direction: "desc",
      page: "1",
      sort: "created",
    })
  );

  const [first] = pulls;
  if (!first) {
    throw new Error(`No pull requests found for ${repo}`);
  }
  return first;
}

export async function fetchAllIssues(
  repositoryUrl?: string
): Promise<GitHubIssue[]> {
  const repo = resolveRepository(repositoryUrl);
  return await githubFetch<GitHubIssue[]>(buildUrl(repo, "issues"));
}

export async function fetchLatestIssue(
  repositoryUrl?: string
): Promise<GitHubIssue> {
  const repo = resolveRepository(repositoryUrl);
  const issues = await githubFetch<GitHubIssue[]>(
    buildUrl(repo, "issues", {
      direction: "desc",
      page: "1",
      sort: "created",
    })
  );

  const [first] = issues;
  if (!first) {
    throw new Error(`No issues found for ${repo}`);
  }
  return first;
}
