import { fetchLatestRelease } from "../src/index";

const repo = "tailwindlabs/tailwindcss";
const release = await fetchLatestRelease(repo);

console.log(`Release: ${release.tag_name}`);
console.log(`Assets: ${release.assets.length}`);
for (const asset of release.assets) {
  console.log(`  ${asset.name} (${asset.download_count} downloads)`);
}
