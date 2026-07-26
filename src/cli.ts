import { defineCommand, runMain } from "citty";
import { fetchAllIssues, fetchAllTags, fetchLatestRelease } from "./index";

const release = defineCommand({
  args: {
    repo: {
      description: "Repository in owner/repo format",
      required: true,
      type: "positional",
    },
    token: {
      alias: ["t"],
      description: "GitHub token (or set GITHUB_TOKEN env var)",
      type: "string",
    },
  },
  meta: {
    description: "Fetch the latest release of a GitHub repository",
    name: "release",
  },
  async run({ args }) {
    if (args.token) {
      process.env.GITHUB_TOKEN = args.token;
    }

    const result = await fetchLatestRelease(args.repo);
    console.log(`${result.tag_name}: ${result.name}`);
    console.log(`Published: ${result.published_at}`);
    console.log(`URL: ${result.html_url}`);
    if (result.body) {
      console.log(`\n${result.body}`);
    }
  },
});

const tags = defineCommand({
  args: {
    repo: {
      description: "Repository in owner/repo format",
      required: true,
      type: "positional",
    },
    token: {
      alias: ["t"],
      description: "GitHub token (or set GITHUB_TOKEN env var)",
      type: "string",
    },
  },
  meta: {
    description: "Fetch all tags of a GitHub repository",
    name: "tags",
  },
  async run({ args }) {
    if (args.token) {
      process.env.GITHUB_TOKEN = args.token;
    }

    const result = await fetchAllTags(args.repo);
    for (const tag of result) {
      console.log(`${tag.name} (${tag.commit.sha.slice(0, 7)})`);
    }
  },
});

const issues = defineCommand({
  args: {
    repo: {
      description: "Repository in owner/repo format",
      required: true,
      type: "positional",
    },
    token: {
      alias: ["t"],
      description: "GitHub token (or set GITHUB_TOKEN env var)",
      type: "string",
    },
  },
  meta: {
    description: "Fetch all issues of a GitHub repository",
    name: "issues",
  },
  async run({ args }) {
    if (args.token) {
      process.env.GITHUB_TOKEN = args.token;
    }

    const result = await fetchAllIssues(args.repo);
    for (const issue of result) {
      console.log(`#${issue.number} [${issue.state}] ${issue.title}`);
    }
  },
});

const main = defineCommand({
  meta: {
    description: "Fetch any release of any GitHub Repository",
    name: "octoship",
    version: "1.0.0-ALPHA",
  },
  subCommands: { issues, release, tags },
});

runMain(main);
