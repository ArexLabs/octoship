import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export interface OctoshipConfig {
  defaultBranch?: string;
  defaultRepository?: string;
  perPage?: number;
  token?: string;
  userAgent?: string;
}

const CONFIG_CANDIDATES = ["octoship.json", "octoship.conf.json"] as const;

let cachedConfig: OctoshipConfig | undefined;

export function loadConfig(cwd?: string): OctoshipConfig {
  if (cachedConfig) {
    return cachedConfig;
  }

  const dir = cwd ?? process.cwd();

  for (const filename of CONFIG_CANDIDATES) {
    const configPath = join(dir, filename);
    if (!existsSync(configPath)) {
      continue;
    }

    const raw = readFileSync(configPath, "utf-8");
    cachedConfig = JSON.parse(raw) as OctoshipConfig;
    return cachedConfig;
  }

  cachedConfig = {};
  return cachedConfig;
}

export function resetConfig(): void {
  cachedConfig = undefined;
}
