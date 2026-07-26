import { fetchAllIssues, fetchLatestPullRequest } from "../src/index";

const pr = await fetchLatestPullRequest("denoland/deno");
console.log(`Latest PR: #${pr.number} ${pr.title} (${pr.state})`);

const issues = await fetchAllIssues("denoland/deno");
console.log(`Open issues: ${issues.length}`);
