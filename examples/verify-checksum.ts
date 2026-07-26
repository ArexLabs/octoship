import { computeSha256, fetchLatestRelease } from "../src/index";

// Compute SHA-256 hash of arbitrary data using Web Crypto API.
// Works cross-runtime: Node 18+, Bun, Deno, Edge, Browser.

const encoder = new TextEncoder();
const data = encoder.encode("octoship");
const hash = await computeSha256(data.buffer);
console.log(`SHA-256: ${hash}`);

// Verify a release asset's checksum
const release = await fetchLatestRelease("tailwindlabs/tailwindcss");
const [asset] = release.assets;
if (asset) {
  const response = await fetch(asset.browser_download_url);
  if (response.ok) {
    const buffer = await response.arrayBuffer();
    const assetHash = await computeSha256(buffer);
    console.log(`${asset.name}: ${assetHash}`);
  }
}
