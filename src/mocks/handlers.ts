import type { components } from "@octokit/openapi-types";
import { HttpResponse, http } from "msw";

type Release = components["schemas"]["release"];
type Tag = components["schemas"]["tag"];
type Branch = components["schemas"]["short-branch"];
type PullRequest = components["schemas"]["pull-request"];
type Issue = components["schemas"]["issue"];

const mockUser = {
  avatar_url: "https://avatars.githubusercontent.com/u/1",
  gravatar_id: "",
  html_url: "https://github.com/testuser",
  id: 1,
  login: "testuser",
  node_id: "MDQ6VXNlcjE=",
  type: "User" as const,
  url: "https://api.github.com/users/testuser",
} as unknown as components["schemas"]["simple-user"];

const mockReleaseAsset = {
  browser_download_url:
    "https://github.com/test/repo/releases/download/v1.0.0/asset.tar.gz",
  content_type: "application/gzip",
  created_at: "2026-01-01T00:00:00Z",
  deleted: false,
  digest: null,
  download_count: 42,
  id: 1,
  label: "",
  name: "asset.tar.gz",
  node_id: "RA_1",
  size: 1024,
  state: "uploaded" as const,
  updated_at: "2026-01-01T00:00:00Z",
  uploader: mockUser,
  url: "https://api.github.com/repos/test/repo/releases/assets/1",
} as unknown as components["schemas"]["release-asset"];

export const mockRelease = {
  assets: [mockReleaseAsset],
  assets_url: "https://api.github.com/repos/test/repo/releases/1/assets",
  author: mockUser,
  body: "Initial release",
  created_at: "2026-01-01T00:00:00Z",
  draft: false,
  html_url: "https://github.com/test/repo/releases/tag/v1.0.0",
  id: 1,
  name: "Release 1.0.0",
  node_id: "RE_1",
  prerelease: false,
  published_at: "2026-01-01T00:00:00Z",
  tag_name: "v1.0.0",
  tarball_url: "https://api.github.com/repos/test/repo/tarball/v1.0.0",
  target_commitish: "main",
  upload_url: "https://uploads.github.com/repos/test/repo/releases/1/assets",
  url: "https://api.github.com/repos/test/repo/releases/1",
  zipball_url: "https://api.github.com/repos/test/repo/zipball/v1.0.0",
} satisfies Partial<Release> as Release;

export const mockTag = {
  commit: {
    sha: "abc123",
    url: "https://api.github.com/repos/test/repo/commits/abc123",
  },
  name: "v1.0.0",
  node_id: "REF_1",
  tarball_url: "https://api.github.com/repos/test/repo/tarball/v1.0.0",
  zipball_url: "https://api.github.com/repos/test/repo/zipball/v1.0.0",
} satisfies Partial<Tag> as Tag;

export const mockBranch = {
  commit: {
    sha: "def456",
    url: "https://api.github.com/repos/test/repo/commits/def456",
  },
  name: "main",
  protected: false,
} satisfies Partial<Branch> as Branch;

export const mockPullRequest = {
  assignees: [],
  auto_merge: null,
  base: { ref: "main", repo: null, sha: "def456" },
  body: "Test description",
  closed_at: null,
  created_at: "2026-01-01T00:00:00Z",
  diff_url: "https://github.com/test/repo/pull/1.diff",
  draft: false,
  head: { ref: "feature", repo: null, sha: "abc123" },
  html_url: "https://github.com/test/repo/pull/1",
  id: 1,
  labels: [],
  locked: false,
  merge_commit_sha: null,
  merged_at: null,
  node_id: "PR_1",
  number: 1,
  patch_url: "https://github.com/test/repo/pull/1.patch",
  requested_reviewers: [],
  requested_teams: [],
  review_comment_url: "https://api.github.com/repos/test/repo/pulls/comments/1",
  review_comments_url: "https://api.github.com/repos/test/repo/pulls/comments",
  statuses_url: "https://api.github.com/repos/test/repo/statuses/abc123",
  title: "Test PR",
  updated_at: "2026-01-01T00:00:00Z",
  url: "https://api.github.com/repos/test/repo/pulls/1",
  user: mockUser,
} as unknown as PullRequest;

export const mockIssue = {
  assignee: null,
  assignees: [],
  body: "Test description",
  closed_at: null,
  comments: 0,
  created_at: "2026-01-01T00:00:00Z",
  html_url: "https://github.com/test/repo/issues/1",
  id: 1,
  labels: [],
  locked: false,
  node_id: "I_1",
  number: 1,
  state: "open" as const,
  state_reason: null,
  title: "Test Issue",
  updated_at: "2026-01-01T00:00:00Z",
  url: "https://api.github.com/repos/test/repo/issues/1",
  user: mockUser,
} as unknown as Issue;

export const handlers = [
  // ── Specific paths FIRST (MSW matches in order) ──────────────────────

  http.get("https://api.github.com/repos/missing/repo/releases/latest", () =>
    HttpResponse.json(
      {
        documentation_url: "https://docs.github.com",
        message: "Not Found",
      },
      { status: 404 }
    )
  ),

  http.get(
    "https://api.github.com/repos/rate-limited/repo/releases/latest",
    () =>
      HttpResponse.json({ message: "API rate limit exceeded" }, { status: 403 })
  ),

  http.get(
    "https://api.github.com/repos/redirect/repo/releases/latest",
    () =>
      new HttpResponse(null, {
        headers: {
          location:
            "https://api.github.com/repos/redirect/repo/releases/tags/v1.0.0",
        },
        status: 301,
      })
  ),

  http.get(
    "https://api.github.com/repos/redirect/repo/releases/tags/v1.0.0",
    () => HttpResponse.json(mockRelease)
  ),

  // ── Generic catch-all AFTER specific handlers ────────────────────────

  http.get("https://api.github.com/repos/:owner/:repo/releases/latest", () =>
    HttpResponse.json(mockRelease)
  ),

  http.get(
    "https://api.github.com/repos/:owner/:repo/releases/tags/:tag",
    ({ params }) => {
      if (params.tag !== mockRelease.tag_name) {
        return HttpResponse.json(
          {
            documentation_url: "https://docs.github.com",
            message: "Not Found",
          },
          { status: 404 }
        );
      }
      return HttpResponse.json(mockRelease);
    }
  ),

  http.get("https://api.github.com/repos/:owner/:repo/releases", () =>
    HttpResponse.json([mockRelease])
  ),

  http.get("https://api.github.com/repos/:owner/:repo/tags", () =>
    HttpResponse.json([mockTag])
  ),

  http.get("https://api.github.com/repos/:owner/:repo/branches", () =>
    HttpResponse.json([mockBranch])
  ),

  http.get("https://api.github.com/repos/:owner/:repo/pulls", () =>
    HttpResponse.json([mockPullRequest])
  ),

  http.get("https://api.github.com/repos/:owner/:repo/issues", () =>
    HttpResponse.json([mockIssue])
  ),
];
