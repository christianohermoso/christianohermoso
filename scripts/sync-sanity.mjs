import { access, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@sanity/client";
import sharp from "sharp";
import { convertVideo, inParallel, masterEdge, masterQuality, photosModule } from "./lib/media.mjs";
import { sanityConfig } from "./sanity-config.mjs";

const mediaDirectory = path.resolve("media/sanity");
const videoDirectory = path.resolve("public/video/sanity");
const cacheDirectory = path.resolve(".cache/sanity");
const photosFile = path.resolve("app/data/photos.ts");
const contactFile = path.resolve("app/data/contact.ts");
const introDirectory = path.resolve("public/load/sanity");
const introFile = path.resolve("app/data/intro.ts");
const introSize = { w: 640, h: 800 };

const client = createClient({ ...sanityConfig, useCdn: false, perspective: "published" });

const mediaProjection = `media[]{
  _type,
  "image": asset->{ _id, url },
  "video": file.asset->{ _id, url, originalFilename }
}`;

const query = `{
  "selected": *[_id == "selected"][0]{ ${mediaProjection} },
  "projects": *[_type == "project" && count(media) > 0] | order(orderRank) { title, ${mediaProjection} },
  "contact": *[_id == "contact"][0]{ email, clients, instagram },
  "intro": *[_id == "intro"][0].images[].asset->{ _id, url }
}`;

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function download(url, target) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Download failed (${response.status}) for ${url}`);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, Buffer.from(await response.arrayBuffer()));
}

async function syncImage(asset) {
  const target = path.join(mediaDirectory, `${asset._id}.webp`);
  if (!(await exists(target))) {
    const params = new URLSearchParams({ w: masterEdge, h: masterEdge, fit: "max", fm: "webp", q: masterQuality });
    await download(`${asset.url}?${params}`, target);
  }
  const { width, height } = await sharp(target).metadata();
  return { src: `/sanity/${asset._id}.webp`, width, height };
}

async function syncVideo(asset) {
  const poster = path.join(mediaDirectory, `${asset._id}.webp`);
  const target = path.join(videoDirectory, `${asset._id}.mp4`);
  if (!(await exists(poster)) || !(await exists(target))) {
    const original = path.join(cacheDirectory, `${asset._id}${path.extname(asset.originalFilename ?? ".mov")}`);
    await download(asset.url, original);
    await convertVideo(original, target, poster);
    await rm(original);
  }
  const { width, height } = await sharp(poster).metadata();
  return { src: `/sanity/${asset._id}.webp`, width, height, video: `/video/sanity/${asset._id}.mp4` };
}

async function syncMedia(items = []) {
  const usable = items.filter((item) => (item._type === "video" ? item.video : item.image));
  return inParallel(usable, 4, (item) => (item._type === "video" ? syncVideo(item.video) : syncImage(item.image)));
}

async function prune(directory, keep) {
  if (!(await exists(directory))) return 0;
  const stale = (await readdir(directory)).filter((file) => !keep.has(file));
  await Promise.all(stale.map((file) => rm(path.join(directory, file))));
  return stale.length;
}

async function syncIntroFrame(asset) {
  const target = path.join(introDirectory, `${asset._id}.webp`);
  if (!(await exists(target))) {
    const params = new URLSearchParams({ ...introSize, fit: "max", fm: "webp", q: 85 });
    await download(`${asset.url}?${params}`, target);
  }
  const { width, height } = await sharp(target).metadata();
  return { src: `/load/sanity/${asset._id}.webp`, width, height };
}

function introModule(frames) {
  return `export type IntroFrame = {
  src: string;
  width: number;
  height: number;
};

export const introFrames: IntroFrame[] = [
${frames.map((frame) => `  { src: "${frame.src}", width: ${frame.width}, height: ${frame.height} },`).join("\n")}
];
`;
}

function contactModule(contact) {
  return `export const contact = {
  email: ${JSON.stringify(contact.email)},
  clients: ${JSON.stringify(contact.clients ?? [], null, 2).replace(/\n/g, "\n  ")},
  instagram: ${JSON.stringify(contact.instagram)},
};
`;
}

async function main() {
  const content = await client.fetch(query);
  const hasMedia = (content.selected?.media?.length ?? 0) > 0 || content.projects.length > 0;

  if (!hasMedia) {
    console.log("sanity: no published media yet, keeping current site data");
  } else {
    const selected = await syncMedia(content.selected?.media);
    const projects = [];
    for (const project of content.projects) {
      projects.push({ title: project.title, photos: await syncMedia(project.media) });
    }
    await writeFile(photosFile, photosModule(selected, projects));

    const used = [selected, ...projects.map((project) => project.photos)].flat();
    const keepImages = new Set(used.map((photo) => path.basename(photo.src)));
    const keepVideos = new Set(used.filter((photo) => photo.video).map((photo) => path.basename(photo.video)));
    const removed = (await prune(mediaDirectory, keepImages)) + (await prune(videoDirectory, keepVideos));
    const total = used.length;
    console.log(`sanity: ${selected.length} selected, ${projects.length} projects, ${total} items, ${removed} stale files removed`);
  }

  const introAssets = (content.intro ?? []).filter(Boolean);
  if (introAssets.length) {
    const frames = await inParallel(introAssets, 4, syncIntroFrame);
    await writeFile(introFile, introModule(frames));
    await prune(introDirectory, new Set(frames.map((frame) => path.basename(frame.src))));
    console.log(`sanity: intro ${frames.length} images`);
  } else {
    console.log("sanity: no intro images chosen yet, keeping current intro");
  }

  if (content.contact?.email) {
    await writeFile(contactFile, contactModule(content.contact));
    console.log("sanity: contact updated");
  }
}

await main();
