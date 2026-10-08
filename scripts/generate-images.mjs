import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { imageWidths, outputFolder, sourceRoot } from "../lib/image-widths.mjs";

const sourceDirectory = path.resolve(sourceRoot);
const publicDirectory = path.resolve("public");
const concurrency = 8;

async function isFresh(source, target) {
  try {
    const [sourceStats, targetStats] = await Promise.all([stat(source), stat(target)]);
    return targetStats.mtimeMs >= sourceStats.mtimeMs;
  } catch {
    return false;
  }
}

async function resize(file) {
  const source = path.join(sourceDirectory, file);
  const { dir, name } = path.parse(file);
  const targetDirectory = path.join(publicDirectory, outputFolder, dir);
  await mkdir(targetDirectory, { recursive: true });
  let written = 0;
  for (const width of imageWidths) {
    const target = path.join(targetDirectory, `${name}-${width}.webp`);
    if (await isFresh(source, target)) continue;
    await sharp(source)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 90, smartSubsample: true })
      .toFile(target);
    written += 1;
  }
  return written;
}

async function collect(relative = "") {
  const entries = await readdir(path.join(sourceDirectory, relative), { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(relative, entry.name);
    if (entry.isDirectory()) files.push(...(await collect(entryPath)));
    else if (/\.(webp|jpe?g|png)$/i.test(entry.name)) files.push(entryPath);
  }
  return files;
}

async function run() {
  const files = await collect();
  let written = 0;
  let cursor = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (cursor < files.length) {
      const file = files[cursor++];
      const count = await resize(file);
      written += count;
    }
  });
  await Promise.all(workers);
  console.log(`images: ${files.length} sources, ${written} sizes written`);
}

await run();
