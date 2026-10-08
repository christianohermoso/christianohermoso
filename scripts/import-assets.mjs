import { execFile } from "node:child_process";
import { readdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { convertImage, convertVideo, photosModule } from "./lib/media.mjs";

const run = promisify(execFile);
const sourceRoot = path.resolve("originals/website assets");
const mediaRoot = path.resolve("media");
const videoRoot = path.resolve("public/video");
const dataFile = path.resolve("app/data/photos.ts");
const concurrency = 4;

const imagePattern = /\.(jpe?g|tiff?|png|webp)$/i;
const videoPattern = /\.(mov|mp4|m4v)$/i;

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function byName(a, b) {
  return a.localeCompare(b, "en", { numeric: true, sensitivity: "base" });
}

async function listMedia(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && (imagePattern.test(entry.name) || videoPattern.test(entry.name)))
    .map((entry) => entry.name)
    .sort(byName);
}

async function importFolder(sourceDirectory, mediaFolder) {
  const files = await listMedia(sourceDirectory);
  const results = new Array(files.length);
  let cursor = 0;

  const workers = Array.from({ length: concurrency }, async () => {
    while (cursor < files.length) {
      const position = cursor++;
      const file = files[position];
      const source = path.join(sourceDirectory, file);
      const name = String(position + 1).padStart(3, "0");
      const imageTarget = path.join(mediaRoot, mediaFolder, `${name}.webp`);
      const publicPath = `/${mediaFolder}/${name}.webp`;

      if (videoPattern.test(file)) {
        const videoTarget = path.join(videoRoot, mediaFolder, `${name}.mp4`);
        const size = await convertVideo(source, videoTarget, imageTarget);
        results[position] = { src: publicPath, ...size, video: `/video/${mediaFolder}/${name}.mp4` };
      } else {
        const size = await convertImage(source, imageTarget);
        results[position] = { src: publicPath, ...size };
      }
      console.log(`  ${mediaFolder}/${name}  ${file}`);
    }
  });

  await Promise.all(workers);
  return results;
}

async function main() {
  await rm(mediaRoot, { recursive: true, force: true });
  await rm(videoRoot, { recursive: true, force: true });

  console.log("selected");
  const selected = await importFolder(path.join(sourceRoot, "SELECTED"), "selected");

  const advertisingRoot = path.join(sourceRoot, "ADVERTISING");
  const folders = (await readdir(advertisingRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort(byName);

  const projects = [];
  for (const folder of folders) {
    console.log(folder);
    const photos = await importFolder(path.join(advertisingRoot, folder), `advertising/${slugify(folder)}`);
    projects.push({ title: folder, photos });
  }

  const source = photosModule(selected, projects);
  await writeFile(dataFile, source);

  const total = selected.length + projects.reduce((sum, project) => sum + project.photos.length, 0);
  const mediaSize = (await run("du", ["-sh", mediaRoot])).stdout.split("\t")[0];
  const videoSize = (await run("du", ["-sh", videoRoot])).stdout.split("\t")[0];
  console.log(`done: ${total} items, media ${mediaSize}, video ${videoSize}`);
  await stat(dataFile);
}

await main();
