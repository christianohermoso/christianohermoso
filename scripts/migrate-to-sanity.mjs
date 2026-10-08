import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@sanity/client";
import { LexoRank } from "lexorank";
import { sanityConfig } from "./sanity-config.mjs";

const token = process.env.SANITY_WRITE_TOKEN;
if (!token) {
  console.error("Set SANITY_WRITE_TOKEN to a token with Editor access, then run again.");
  process.exit(1);
}

const client = createClient({ ...sanityConfig, token, useCdn: false });
const batchSize = 5;

function parsePhotos(source) {
  const photoPattern = /\{ src: "([^"]+)", width: \d+, height: \d+(?:, video: "([^"]+)")? \}/g;
  const photosIn = (block) => [...block.matchAll(photoPattern)].map(([, src, video]) => ({ src, video }));
  const selectedBlock = source.slice(source.indexOf("export const selected"), source.indexOf("export const advertisingProjects"));
  const advertisingBlock = source.slice(source.indexOf("export const advertisingProjects"));
  const projects = advertisingBlock
    .split(/\n  \{\n/)
    .slice(1)
    .map((block) => ({ title: JSON.parse(block.match(/title: ("(?:[^"\\]|\\.)*")/)[1]), photos: photosIn(block) }));
  return { selected: photosIn(selectedBlock), projects };
}

function uniqueKey() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

async function uploadPhoto(photo) {
  if (photo.video) {
    const file = path.resolve("public", photo.video.slice(1));
    const asset = await client.assets.upload("file", createReadStream(file), { filename: path.basename(file) });
    return { _type: "video", _key: uniqueKey(), file: { _type: "file", asset: { _type: "reference", _ref: asset._id } } };
  }
  const file = path.resolve("media", photo.src.slice(1));
  const asset = await client.assets.upload("image", createReadStream(file), { filename: path.basename(file) });
  return { _type: "image", _key: uniqueKey(), asset: { _type: "reference", _ref: asset._id } };
}

async function uploadAll(photos, label) {
  const items = [];
  for (let start = 0; start < photos.length; start += batchSize) {
    const batch = photos.slice(start, start + batchSize);
    items.push(...(await Promise.all(batch.map(uploadPhoto))));
    console.log(`  ${label}: ${items.length} / ${photos.length}`);
  }
  return items;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const { selected, projects } = parsePhotos(await readFile("app/data/photos.ts", "utf8"));
  const { contact } = await import(path.resolve("app/data/contact.ts")).catch(async () => {
    const source = await readFile("app/data/contact.ts", "utf8");
    return { contact: Function(`return ${source.slice(source.indexOf("{"), source.lastIndexOf("}") + 1)}`)() };
  });

  console.log(`Selected: ${selected.length} items`);
  const selectedMedia = await uploadAll(selected, "Selected");
  await client.createOrReplace({ _id: "selected", _type: "selected", media: selectedMedia });

  let rank = LexoRank.min();
  for (const project of projects) {
    rank = rank.genNext().genNext();
    console.log(`${project.title}: ${project.photos.length} items`);
    const media = await uploadAll(project.photos, project.title);
    await client.createOrReplace({
      _id: `project-${slugify(project.title)}`,
      _type: "project",
      title: project.title,
      orderRank: rank.toString(),
      media,
    });
  }

  await client.createOrReplace({
    _id: "contact",
    _type: "contact",
    email: contact.email,
    clients: contact.clients,
    instagram: contact.instagram,
  });

  console.log("Migration complete.");
}

await main();
