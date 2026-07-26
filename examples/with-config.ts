import { loadConfig } from "../src/index";

// Reads octoship.json from the current working directory.
// Falls back to octoship.conf.json, then to env vars.
//
// Example octoship.json:
//   {
//     "token": "ghp_xxx",
//     "defaultRepository": "facebook/react",
//     "perPage": 50,
//     "userAgent": "my-app"
//   }

const config = loadConfig();
console.log("Config loaded:", config);
