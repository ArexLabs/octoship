import { fetchRelease } from "../src/index";

const release = await fetchRelease("v18.2.0", "reactjs/react.dev");
console.log(`${release.tag_name}: ${release.name}`);
