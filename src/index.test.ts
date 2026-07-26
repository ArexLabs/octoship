import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

// ── Fixtures ─────────────────────────────────────────────────────────────────

const mockRelease = {
  assets: [],
  author: {
    avatar_url: "https://avatars.githubusercontent.com/u/1",
    html_url: "https://github.com/testuser",
    id: 1,
    login: "testuser",
  },
  body: "Initial release",
  created_at: "2024-01-01T00:00:00Z",
  draft: false,
  html_url: "https://github.com/test/repo/releases/tag/v1.0.0",
  id: 1,
  name: "Release 1.0.0",
  prerelease: false,
  published_at: "2024-01-01T00:00:00Z",
  tag_name: "v1.0.0",
  tarball_url: "https://api.github.com/repos/test/repo/tarball/v1.0.0",
  zipball_url: "https://api.github.com/repos/test/repo/zipball/v1.0.0",
};

const mockTag = {
  commit: {
    sha: "abc123",
    url: "https://api.github.com/repos/test/repo/commits/abc123",
  },
  name: "v1.0.0",
  tarball_url: "https://api.github.com/repos/test/repo/tarball/v1.0.0",
  zipball_url: "https://api.github.com/repos/test/repo/zipball/v1.0.0",
};

const mockBranch = {
  commit: {
    sha: "def456",
    url: "https://api.github.com/repos/test/repo/commits/def456",
  },
  name: "main",
  protected: false,
};

const mockPullRequest = {
  base: { ref: "main", sha: "def456" },
  body: "Test description",
  created_at: "2024-01-01T00:00:00Z",
  head: { ref: "feature", sha: "abc123" },
  html_url: "https://github.com/test/repo/pull/1",
  id: 1,
  number: 1,
  state: "open" as const,
  title: "Test PR",
  updated_at: "2024-01-01T00:00:00Z",
  user: {
    avatar_url: "https://avatars.githubusercontent.com/u/1",
    html_url: "https://github.com/testuser",
    id: 1,
    login: "testuser",
  },
};

const mockIssue = {
  body: "Test description",
  created_at: "2024-01-01T00:00:00Z",
  html_url: "https://github.com/test/repo/issues/1",
  id: 1,
  labels: [],
  number: 1,
  state: "open" as const,
  title: "Test Issue",
  updated_at: "2024-01-01T00:00:00Z",
  user: {
    avatar_url: "https://avatars.githubusercontent.com/u/1",
    html_url: "https://github.com/testuser",
    id: 1,
    login: "testuser",
  },
};

// ── Mocks ────────────────────────────────────────────────────────────────────

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  resetConfig();
  delete process.env.GITHUB_TOKEN;
});

afterEach(() => {
  vi.restoreAllMocks();
  resetConfig();
  delete process.env.GITHUB_TOKEN;
});

function mockSuccess(body: unknown) {
  fetchMock.mockResolvedValueOnce({
    json: () => Promise.resolve(body),
    ok: true,
    status: 200,
    statusText: "OK",
  });
}

function mockError(status: number, statusText: string) {
  fetchMock.mockResolvedValueOnce({
    json: () => Promise.resolve({ message: "Not Found" }),
    ok: false,
    status,
    statusText,
  });
}

// ── Tests: fetchLatestRelease ────────────────────────────────────────────────

describe("fetchLatestRelease", () => {
  it("fetches the latest release for a given repository", async () => {
    mockSuccess(mockRelease);

    const release = await fetchLatestRelease("test/repo");

    expect(release).toEqual(mockRelease);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.github.com/repos/test/repo/releases/latest",
      expect.objectContaining({ headers: expect.any(Object) })
    );
  });

  it("throws on non-ok response", async () => {
    mockError(404, "Not Found");

    await expect(fetchLatestRelease("test/missing")).rejects.toThrow(
      "GitHub API error: 404 Not Found"
    );
  });
});

// ── Tests: fetchRelease ──────────────────────────────────────────────────────

describe("fetchRelease", () => {
  it("fetches a release by tag", async () => {
    mockSuccess(mockRelease);

    const release = await fetchRelease("v1.0.0", "test/repo");

    expect(release).toEqual(mockRelease);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.github.com/repos/test/repo/releases/tags/v1.0.0",
      expect.objectContaining({ headers: expect.any(Object) })
    );
  });

  it("encodes special characters in tag names", async () => {
    mockSuccess(mockRelease);

    await fetchRelease("v1.0.0-beta.1", "test/repo");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("releases/tags/v1.0.0-beta.1"),
      expect.anything()
    );
  });

  it("throws on non-ok response", async () => {
    mockError(404, "Not Found");

    await expect(fetchRelease("v999.0.0", "test/repo")).rejects.toThrow(
      "GitHub API error: 404 Not Found"
    );
  });
});

// ── Tests: fetchFirstRelease ─────────────────────────────────────────────────

describe("fetchFirstRelease", () => {
  it("fetches the first (oldest) release", async () => {
    mockSuccess([mockRelease]);

    const release = await fetchFirstRelease("test/repo");

    expect(release).toEqual(mockRelease);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("direction=asc"),
      expect.anything()
    );
  });

  it("throws when no releases exist", async () => {
    mockSuccess([]);

    await expect(fetchFirstRelease("test/repo")).rejects.toThrow(
      "No releases found for test/repo"
    );
  });
});

// ── Tests: fetchAllReleases ──────────────────────────────────────────────────

describe("fetchAllReleases", () => {
  it("fetches all releases", async () => {
    mockSuccess([mockRelease]);

    const releases = await fetchAllReleases("test/repo");

    expect(releases).toEqual([mockRelease]);
    expect(releases).toHaveLength(1);
  });

  it("throws on non-ok response", async () => {
    mockError(403, "Forbidden");

    await expect(fetchAllReleases("test/repo")).rejects.toThrow(
      "GitHub API error: 403 Forbidden"
    );
  });
});

// ── Tests: fetchAllTags ──────────────────────────────────────────────────────

describe("fetchAllTags", () => {
  it("fetches all tags", async () => {
    mockSuccess([mockTag]);

    const tags = await fetchAllTags("test/repo");

    expect(tags).toEqual([mockTag]);
  });
});

// ── Tests: fetchAllBranches ──────────────────────────────────────────────────

describe("fetchAllBranches", () => {
  it("fetches all branches", async () => {
    mockSuccess([mockBranch]);

    const branches = await fetchAllBranches("test/repo");

    expect(branches).toEqual([mockBranch]);
  });
});

// ── Tests: fetchAllPullRequests ──────────────────────────────────────────────

describe("fetchAllPullRequests", () => {
  it("fetches all pull requests", async () => {
    mockSuccess([mockPullRequest]);

    const pulls = await fetchAllPullRequests("test/repo");

    expect(pulls).toEqual([mockPullRequest]);
  });
});

// ── Tests: fetchLatestPullRequest ────────────────────────────────────────────

describe("fetchLatestPullRequest", () => {
  it("fetches the latest pull request", async () => {
    mockSuccess([mockPullRequest]);

    const pr = await fetchLatestPullRequest("test/repo");

    expect(pr).toEqual(mockPullRequest);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("direction=desc"),
      expect.anything()
    );
  });

  it("throws when no pull requests exist", async () => {
    mockSuccess([]);

    await expect(fetchLatestPullRequest("test/repo")).rejects.toThrow(
      "No pull requests found for test/repo"
    );
  });
});

// ── Tests: fetchAllIssues ────────────────────────────────────────────────────

describe("fetchAllIssues", () => {
  it("fetches all issues", async () => {
    mockSuccess([mockIssue]);

    const issues = await fetchAllIssues("test/repo");

    expect(issues).toEqual([mockIssue]);
  });
});

// ── Tests: fetchLatestIssue ──────────────────────────────────────────────────

describe("fetchLatestIssue", () => {
  it("fetches the latest issue", async () => {
    mockSuccess([mockIssue]);

    const issue = await fetchLatestIssue("test/repo");

    expect(issue).toEqual(mockIssue);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("direction=desc"),
      expect.anything()
    );
  });

  it("throws when no issues exist", async () => {
    mockSuccess([]);

    await expect(fetchLatestIssue("test/repo")).rejects.toThrow(
      "No issues found for test/repo"
    );
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
    mockSuccess(mockRelease);

    await fetchLatestRelease("test/repo");

    expect(fetchMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer ghp_test123",
        }),
      })
    );
  });

  it("does not include Authorization header when no token is set", async () => {
    mockSuccess(mockRelease);

    await fetchLatestRelease("test/repo");

    const callHeaders = fetchMock.mock.calls[0]?.[1]?.headers as Record<
      string,
      string
    >;
    expect(callHeaders.Authorization).toBeUndefined();
  });
});
