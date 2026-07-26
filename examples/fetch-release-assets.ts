import { fetchLatestRelease } from "../src/index";

const repo = "tailwindlabs/tailwindcss";
const release = await fetchLatestRelease(repo);

console.log(`Release: ${release.tag_name}`);
console.log(`Assets: ${release.assets.length}`);

for (const asset of release.assets) {
  console.log(`  ${asset.name} (${asset.download_count} downloads)`);
}

// Verify checksum of first asset (if available)
const [firstAsset] = release.assets;
if (firstAsset) {
  console.log(`\nDownloading ${firstAsset.name}...`);
  const response = await fetch(firstAsset.browser_download_url);
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status}`);
  }
  console.log(`Downloaded ${firstAsset.name} successfully`);
}
