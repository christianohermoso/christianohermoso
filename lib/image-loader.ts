"use client";

import { imageWidths } from "./image-widths.mjs";

type LoaderProps = {
  src: string;
  width: number;
  quality?: number;
};

function closestWidth(width: number) {
  return imageWidths.find((candidate) => candidate >= width) ?? imageWidths[imageWidths.length - 1];
}

export default function imageLoader({ src, width, quality }: LoaderProps) {
  if (!src.startsWith("https://cdn.sanity.io/images/")) return src;
  const url = new URL(src);
  url.searchParams.set("w", String(closestWidth(width)));
  url.searchParams.set("q", String(quality ?? 80));
  url.searchParams.set("fit", "max");
  url.searchParams.set("auto", "format");
  return url.toString();
}
