import { loadConfig } from "../src/index";

// Reads octoship.yaml from the current working directory.
// Token, defaultRepository, perPage, etc. are all optional.
//
// Example octoship.yaml:
//   token: "ghp_xxx"
//   defaultRepository: "facebook/react"
//   perPage: 50
//   userAgent: "my-app"

const config = loadConfig();
console.log("Config loaded:", config);
