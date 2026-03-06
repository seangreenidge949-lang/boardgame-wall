/**
 * Upload rules images from public/rules-images/ to Vercel Blob storage.
 * Usage: npx tsx scripts/upload-rules-images.ts [gameId]
 *
 * If gameId is provided, only uploads images for that game.
 * Otherwise uploads all images under public/rules-images/.
 *
 * Requires BLOB_READ_WRITE_TOKEN in .env.local
 */

import { put } from "@vercel/blob";
import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, relative } from "path";

// Load .env.local manually (no dotenv dependency)
const envPath = join(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const match = line.match(/^([^#=]+)=["']?(.+?)["']?$/);
    if (match) process.env[match[1].trim()] = match[2];
  }
}

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error("Error: BLOB_READ_WRITE_TOKEN not found in .env.local");
  console.error("Run: npx vercel env pull .env.local");
  process.exit(1);
}

const RULES_DIR = join(process.cwd(), "public/rules-images");
const gameId = process.argv[2];

function getFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...getFiles(full));
    } else if (/\.(png|jpe?g|webp|gif|svg)$/i.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

async function main() {
  const baseDir = gameId ? join(RULES_DIR, gameId) : RULES_DIR;

  if (!statSync(baseDir, { throwIfNoEntry: false })) {
    console.error(`Directory not found: ${baseDir}`);
    process.exit(1);
  }

  const files = getFiles(baseDir);
  if (files.length === 0) {
    console.log("No image files found.");
    return;
  }

  console.log(`Uploading ${files.length} files...`);

  const results: { path: string; url: string }[] = [];

  for (const file of files) {
    const relPath = relative(join(process.cwd(), "public"), file);
    const content = readFileSync(file);
    const contentType = file.endsWith(".png")
      ? "image/png"
      : file.endsWith(".jpg") || file.endsWith(".jpeg")
        ? "image/jpeg"
        : file.endsWith(".webp")
          ? "image/webp"
          : "application/octet-stream";

    const blob = await put(relPath, content, {
      access: "public",
      contentType,
      addRandomSuffix: false,
    });

    results.push({ path: relPath, url: blob.url });
    console.log(`  ✓ ${relPath} → ${blob.url}`);
  }

  console.log(`\nDone! ${results.length} files uploaded.`);
  console.log("\nURL mapping (for updating data/rules/*.json):");
  for (const r of results) {
    console.log(`  /${r.path} → ${r.url}`);
  }
}

main().catch((err) => {
  console.error("Upload failed:", err);
  process.exit(1);
});
