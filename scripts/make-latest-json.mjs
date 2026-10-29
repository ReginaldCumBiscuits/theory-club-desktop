// Builds latest.json, the file every installed copy of Theory Club checks for
// updates. Run from the folder holding the release's update files and their
// .sig signatures.
//
// Usage: node make-latest-json.mjs <version> <download-base-url> [notes]

import { readdirSync, readFileSync, writeFileSync } from "node:fs";

const [version, base, notes = ""] = process.argv.slice(2);
if (!version || !base) {
  console.error("usage: make-latest-json.mjs <version> <download-base-url> [notes]");
  process.exit(1);
}

// file name pattern -> updater platform key
const kinds = [
  [/mac-arm64\.app\.tar\.gz$/, "darwin-aarch64"],
  [/mac-x64\.app\.tar\.gz$/, "darwin-x86_64"],
  [/windows-x64-setup\.exe$/, "windows-x86_64"],
  [/linux-x64\.AppImage$/, "linux-x86_64"],
];

const files = readdirSync(".");
const platforms = {};
for (const f of files) {
  if (f.endsWith(".sig")) continue;
  const k = kinds.find(([re]) => re.test(f));
  if (!k) continue;
  const sig = files.find((x) => x === f + ".sig");
  if (!sig) {
    console.error(`missing signature for ${f}`);
    process.exit(1);
  }
  platforms[k[1]] = {
    signature: readFileSync(sig, "utf8").trim(),
    url: `${base.replace(/\/$/, "")}/${encodeURIComponent(f)}`,
  };
}

if (!Object.keys(platforms).length) {
  console.error("no update files found");
  process.exit(1);
}

const out = { version, notes, pub_date: new Date().toISOString(), platforms };
writeFileSync("latest.json", JSON.stringify(out, null, 2));
console.log(`latest.json: ${version} for ${Object.keys(platforms).join(", ")}`);
