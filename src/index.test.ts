import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  fetchAllBranches,
  fetchAllIssues,
  fetchAllPullRequests,
  fetchAllReleases,
  fetchAllTags,
  fetchFirstRelease,
  fetchLatestIssue,
  fetchLatestPullRequest,
  fetchLatestRelease,
  fetchRelease,
  resetConfig,
} from "./index";
import {
  mockBranch,
  mockIssue,
  mockPullRequest,
  mockRelease,
  mockTag,
} from "./mocks/handlers";

// ── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  resetConfig();
  delete process.env.GITHUB_TOKEN;
});

afterEach(() => {
  resetConfig();
  delete process.env.GITHUB_TOKEN;
});

// ── Tests: fetchLatestRelease ────────────────────────────────────────────────

describe("fetchLatestRelease", () => {
  it("fetches the latest release for a given repository", async () => {
    const release = await fetchLatestRelease("test/repo");

    expect(release).toEqual(mockRelease);
    expect(release.tag_name).toBe("v1.0.0");
    expect(release.assets).toHaveLength(1);
  });

  it("throws on 404 response", async () => {
    await expect(fetchLatestRelease("missing/repo")).rejects.toThrow(
      "GitHub API error: 404 Not Found"
    );
  });

  it("throws on rate limit", async () => {
    await expect(fetchLatestRelease("rate-limited/repo")).rejects.toThrow(
      "GitHub API error: 403 Forbidden"
    );
  });
});

// ── Tests: fetchRelease ──────────────────────────────────────────────────────

describe("fetchRelease", () => {
  it("fetches a release by tag", async () => {
    const release = await fetchRelease("v1.0.0", "test/repo");

    expect(release).toEqual(mockRelease);
    expect(release.tag_name).toBe("v1.0.0");
  });

  it("throws on non-existent tag", async () => {
    await expect(fetchRelease("v999.0.0", "test/repo")).rejects.toThrow(
      "GitHub API error: 404 Not Found"
    );
  });
});

// ── Tests: fetchFirstRelease ─────────────────────────────────────────────────

describe("fetchFirstRelease", () => {
  it("fetches the first (oldest) release", async () => {
    const release = await fetchFirstRelease("test/repo");

    expect(release).toEqual(mockRelease);
  });
});

// ── Tests: fetchAllReleases ──────────────────────────────────────────────────

describe("fetchAllReleases", () => {
  it("fetches all releases", async () => {
    const releases = await fetchAllReleases("test/repo");

    expect(releases).toHaveLength(1);
    expect(releases[0]).toEqual(mockRelease);
  });
});

// ── Tests: fetchAllTags ──────────────────────────────────────────────────────

describe("fetchAllTags", () => {
  it("fetches all tags", async () => {
    const tags = await fetchAllTags("test/repo");

    expect(tags).toHaveLength(1);
    expect(tags[0]).toEqual(mockTag);
  });
});

// ── Tests: fetchAllBranches ──────────────────────────────────────────────────

describe("fetchAllBranches", () => {
  it("fetches all branches", async () => {
    const branches = await fetchAllBranches("test/repo");

    expect(branches).toHaveLength(1);
    expect(branches[0]).toEqual(mockBranch);
  });
});

// ── Tests: fetchAllPullRequests ──────────────────────────────────────────────

describe("fetchAllPullRequests", () => {
  it("fetches all pull requests", async () => {
    const pulls = await fetchAllPullRequests("test/repo");

    expect(pulls).toHaveLength(1);
    expect(pulls[0]).toEqual(mockPullRequest);
  });
});

// ── Tests: fetchLatestPullRequest ────────────────────────────────────────────

describe("fetchLatestPullRequest", () => {
  it("fetches the latest pull request", async () => {
    const pr = await fetchLatestPullRequest("test/repo");

    expect(pr).toEqual(mockPullRequest);
    expect(pr.number).toBe(1);
  });
});

// ── Tests: fetchAllIssues ────────────────────────────────────────────────────

describe("fetchAllIssues", () => {
  it("fetches all issues", async () => {
    const issues = await fetchAllIssues("test/repo");

    expect(issues).toHaveLength(1);
    expect(issues[0]).toEqual(mockIssue);
  });
});

// ── Tests: fetchLatestIssue ──────────────────────────────────────────────────

describe("fetchLatestIssue", () => {
  it("fetches the latest issue", async () => {
    const issue = await fetchLatestIssue("test/repo");

    expect(issue).toEqual(mockIssue);
    expect(issue.number).toBe(1);
  });
});

// ── Tests: Config Resolution ─────────────────────────────────────────────────

describe("config resolution", () => {
  it("throws when no repository is provided and no config exists", async () => {
    await expect(fetchLatestRelease()).rejects.toThrow(
      "No repository specified"
    );
  });

  it("includes Authorization header when GITHUB_TOKEN is set", async () => {
    process.env.GITHUB_TOKEN = "ghp_test123";

    const release = await fetchLatestRelease("test/repo");
    expect(release.tag_name).toBe("v1.0.0");
  });
});

// ── Tests: Redirect Handling ─────────────────────────────────────────────────

describe("redirect handling", () => {
  it("follows 301 redirects automatically", async () => {
    const release = await fetchLatestRelease("redirect/repo");

    expect(release).toEqual(mockRelease);
    expect(release.tag_name).toBe("v1.0.0");
  });
});
