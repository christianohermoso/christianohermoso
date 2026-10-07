import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { imageWidths, outputFolder, sourceFolders } from "../lib/image-widths.mjs";

const sourceDirectory = path.resolve("media");
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

async function resize(source, folder, file) {
  const name = path.parse(file).name;
  const targetDirectory = path.join(publicDirectory, outputFolder, folder);
  await mkdir(targetDirectory, { recursive: true });
  let written = 0;
  for (const width of imageWidths) {
    const target = path.join(targetDirectory, `${name}-${width}.webp`);
    if (await isFresh(source, target)) continue;
    await sharp(source).resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(target);
    written += 1;
  }
  return written;
}

async function run() {
  const jobs = [];
  for (const folder of sourceFolders) {
    const files = await readdir(path.join(sourceDirectory, folder));
    for (const file of files.filter((entry) => /\.(webp|jpe?g|png)$/i.test(entry))) {
      jobs.push(() => resize(path.join(sourceDirectory, folder, file), folder, file));
    }
  }

  let written = 0;
  let cursor = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (cursor < jobs.length) {
      const job = jobs[cursor++];
      const count = await job();
      written += count;
    }
  });
  await Promise.all(workers);
  console.log(`images: ${jobs.length} sources, ${written} sizes written`);
}

await run();
