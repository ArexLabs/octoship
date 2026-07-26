import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";

// ── Types ────────────────────────────────────────────────────────────────────

export interface OctoshipConfig {
  defaultBranch?: string;
  defaultRepository?: string;
  perPage?: number;
  token?: string;
  userAgent?: string;
}

export interface GitHubRelease {
  assets: GitHubAsset[];
  author: GitHubUser;
  body: string;
  created_at: string;
  draft: boolean;
  html_url: string;
  id: number;
  name: string;
  prerelease: boolean;
  published_at: string;
  tag_name: string;
  tarball_url: string;
  zipball_url: string;
}

export interface GitHubTag {
  commit: {
    sha: string;
    url: string;
  };
  name: string;
  tarball_url: string;
  zipball_url: string;
}

export interface GitHubBranch {
  commit: {
    sha: string;
    url: string;
  };
  name: string;
  protected: boolean;
}

export interface GitHubPullRequest {
  base: {
    ref: string;
    sha: string;
  };
  body: string | null;
  created_at: string;
  head: {
    ref: string;
    sha: string;
  };
  html_url: string;
  id: number;
  number: number;
  state: "open" | "closed" | "merged";
  title: string;
  updated_at: string;
  user: GitHubUser;
}

export interface GitHubIssue {
  body: string | null;
  created_at: string;
  html_url: string;
  id: number;
  labels: GitHubLabel[];
  number: number;
  state: "open" | "closed";
  title: string;
  updated_at: string;
  user: GitHubUser;
}

export interface GitHubUser {
  avatar_url: string;
  html_url: string;
  id: number;
  login: string;
}

export interface GitHubAsset {
  browser_download_url: string;
  created_at: string;
  download_count: number;
  id: number;
  label: string;
  name: string;
  size: number;
  state: "uploaded" | "open";
  updated_at: string;
}

export interface GitHubLabel {
  color: string;
  description: string | null;
  id: number;
  name: string;
}

// ── Config ───────────────────────────────────────────────────────────────────

let cachedConfig: OctoshipConfig | undefined;

export function loadConfig(cwd?: string): OctoshipConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const dir = cwd ?? process.cwd();
  const configPath = join(dir, "octoship.yaml");

  if (!existsSync(configPath)) {
    cachedConfig = {};
    return cachedConfig;
  }

  const raw = readFileSync(configPath, "utf-8");
  cachedConfig = parseYaml(raw) as OctoshipConfig;
  return cachedConfig;
}

export function resetConfig(): void {
  cachedConfig = undefined;
}

// ── Internal Helpers ─────────────────────────────────────────────────────────

function resolveConfig(): OctoshipConfig {
  return loadConfig();
}

function resolveRepository(repositoryUrl?: string): string {
  const repo = repositoryUrl ?? resolveConfig().defaultRepository;
  if (!repo) {
    throw new Error(
      "No repository specified. Pass a repository URL or set 'defaultRepository' in octoship.yaml."
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

  return response.json() as Promise<T>;
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
    buildUrl(repo, "releases", { direction: "asc", page: "1", sort: "created" })
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
    buildUrl(repo, "pulls", { direction: "desc", page: "1", sort: "created" })
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
    buildUrl(repo, "issues", { direction: "desc", page: "1", sort: "created" })
  );

  const [first] = issues;
  if (!first) {
    throw new Error(`No issues found for ${repo}`);
  }
  return first;
}
