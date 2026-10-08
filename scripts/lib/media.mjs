import { execFile } from "node:child_process";
import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import ffmpegStatic from "ffmpeg-static";
import sharp from "sharp";

const run = promisify(execFile);
const ffmpeg = ffmpegStatic ?? "ffmpeg";

export const masterEdge = 2560;
export const masterQuality = 95;
const videoEdge = 1600;

export async function convertImage(source, target) {
  await mkdir(path.dirname(target), { recursive: true });
  const info = await sharp(source, { limitInputPixels: false })
    .rotate()
    .resize({ width: masterEdge, height: masterEdge, fit: "inside", withoutEnlargement: true })
    .toColorspace("srgb")
    .webp({ quality: masterQuality, effort: 6, smartSubsample: true })
    .toFile(target);
  return { width: info.width, height: info.height };
}

export async function convertVideo(source, target, poster) {
  await mkdir(path.dirname(target), { recursive: true });
  const scale = `scale='if(gt(iw,ih),min(${videoEdge},iw),-2)':'if(gt(iw,ih),-2,min(${videoEdge},ih))'`;
  await run(ffmpeg, [
    "-y", "-loglevel", "error", "-i", source,
    "-vf", `${scale},format=yuv420p`,
    "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-profile:v", "high",
    "-an", "-movflags", "+faststart", target,
  ]);
  const still = `${poster}.png`;
  await mkdir(path.dirname(poster), { recursive: true });
  await run(ffmpeg, ["-y", "-loglevel", "error", "-i", target, "-frames:v", "1", still]);
  const size = await convertImage(still, poster);
  await rm(still);
  return size;
}

export async function inParallel(items, limit, task) {
  const results = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: limit }, async () => {
    while (cursor < items.length) {
      const position = cursor++;
      results[position] = await task(items[position], position);
    }
  });
  await Promise.all(workers);
  return results;
}

export function photoLiteral(photo) {
  const video = photo.video ? `, video: "${photo.video}"` : "";
  return `{ src: "${photo.src}", width: ${photo.width}, height: ${photo.height}${video} }`;
}

export function photosModule(selected, projects) {
  const list = (photos, indent) => photos.map((photo) => `${indent}${photoLiteral(photo)},`).join("\n");
  const projectBlocks = projects
    .map(
      (project) => `  {
    title: ${JSON.stringify(project.title)},
    photos: [
${list(project.photos, "      ")}
    ],
  },`,
    )
    .join("\n");
  return `export type Photo = {
  src: string;
  width: number;
  height: number;
  video?: string;
};

export type Project = {
  title?: string;
  photos: Photo[];
};

export const selected: Photo[] = [
${list(selected, "  ")}
];

export const advertisingProjects: Project[] = [
${projectBlocks}
];
`;
}
