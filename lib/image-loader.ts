"use client";

import { imageWidths, outputFolder } from "./image-widths.mjs";

type LoaderProps = {
  src: string;
  width: number;
  quality?: number;
};

function closestWidth(width: number) {
  return imageWidths.find((candidate) => candidate >= width) ?? imageWidths[imageWidths.length - 1];
}

export default function imageLoader({ src, width, quality }: LoaderProps) {
  if (src.startsWith("https://cdn.sanity.io/")) {
    const url = new URL(src);
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(quality ?? 80));
    url.searchParams.set("auto", "format");
    return url.toString();
  }

  const extension = src.lastIndexOf(".");
  const base = extension > 0 ? src.slice(0, extension) : src;
  return `/${outputFolder}${base}-${closestWidth(width)}.webp`;
}
