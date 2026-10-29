// Stamps the version and this repository's update address into the app
// config before a release build.
//
// Usage: node prepare-release.mjs <version> <owner/repo>

import { readFileSync, writeFileSync } from "node:fs";

const [version, repo] = process.argv.slice(2);
if (!/^\d+\.\d+\.\d+$/.test(version || "") || !/^[\w.-]+\/[\w.-]+$/.test(repo || "")) {
  console.error("usage: prepare-release.mjs <x.y.z> <owner/repo>");
  process.exit(1);
}
const p = new URL("../src-tauri/tauri.conf.json", import.meta.url);
const conf = JSON.parse(readFileSync(p, "utf8"));
conf.version = version;
conf.plugins.updater.endpoints = [`https://github.com/${repo}/releases/latest/download/latest.json`];
writeFileSync(p, JSON.stringify(conf, null, 2));
console.log(`Theory Club ${version}, updates from ${conf.plugins.updater.endpoints[0]}`);
