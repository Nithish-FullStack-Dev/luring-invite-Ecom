import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceRoot = process.argv[2];

if (!sourceRoot) {
  console.error('Usage: node scripts/import-legacy-media.mjs "C:\\xampp\\htdocs\\luringwebsite\\api"');
  process.exit(1);
}

async function copyFolder(source, destination, { skipDirectories = new Set() } = {}) {
  let stat;
  try {
    stat = await fs.stat(source);
  } catch {
    console.warn(`Skipped missing folder: ${source}`);
    return { files: 0, bytes: 0 };
  }
  if (!stat.isDirectory()) {
    console.warn(`Skipped non-folder path: ${source}`);
    return { files: 0, bytes: 0 };
  }

  await fs.mkdir(destination, { recursive: true });
  const entries = await fs.readdir(source, { withFileTypes: true });
  let files = 0;
  let bytes = 0;

  for (const entry of entries) {
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) {
      if (skipDirectories.has(entry.name.toLowerCase())) continue;
      const result = await copyFolder(from, to, { skipDirectories });
      files += result.files;
      bytes += result.bytes;
    } else if (entry.isFile()) {
      await fs.mkdir(path.dirname(to), { recursive: true });
      await fs.copyFile(from, to);
      const fileStat = await fs.stat(from);
      files += 1;
      bytes += fileStat.size;
    }
  }
  return { files, bytes };
}

function formatBytes(bytes) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let current = bytes;
  let unit = 0;
  while (current >= 1024 && unit < units.length - 1) {
    current /= 1024;
    unit += 1;
  }
  return `${current.toFixed(2)} ${units[unit]}`;
}

const source = path.resolve(sourceRoot);
const tasks = [
  [path.join(source, "templates"), path.join(projectRoot, "public/media/templates"), {}],
  [path.join(source, "uploads"), path.join(projectRoot, "public/media/uploads"), { skipDirectories: new Set(["music"]) }],
  [path.join(source, "uploads/music"), path.join(projectRoot, "public/media/music"), {}],
  [path.join(source, "fonts"), path.join(projectRoot, "public/media/fonts"), {}],
];

let totalFiles = 0;
let totalBytes = 0;
for (const [from, to, options] of tasks) {
  console.log(`Copying ${from} -> ${to}`);
  const result = await copyFolder(from, to, options);
  totalFiles += result.files;
  totalBytes += result.bytes;
}

console.log(`\nMedia import complete: ${totalFiles} files, ${formatBytes(totalBytes)} copied.`);
console.log("Existing files with the same names are overwritten with the source copies.");
