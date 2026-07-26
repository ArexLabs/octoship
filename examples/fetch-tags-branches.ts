import { fetchAllBranches, fetchAllTags } from "../src/index";

const tags = await fetchAllTags("vercel/next.js");
console.log(`Tags: ${tags.map((t) => t.name).join(", ")}`);

const branches = await fetchAllBranches("vercel/next.js");
console.log(`Branches: ${branches.map((b) => b.name).join(", ")}`);
