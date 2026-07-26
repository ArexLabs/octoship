import { fetchAllReleases, fetchLatestRelease } from "../src/index";

const release = await fetchLatestRelease("facebook/react");
console.log(`Latest: ${release.tag_name} — ${release.name}`);
console.log(release.body);

const releases = await fetchAllReleases("facebook/react");
console.log(`Total releases: ${releases.length}`);
