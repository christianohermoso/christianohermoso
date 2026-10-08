"use client";

import type { SiteContent } from "@/lib/content";
import { useSiteContent } from "@/lib/useSiteContent";
import { Gallery } from "./Gallery";

type LiveGalleryProps = {
  initial: SiteContent;
  view: "selected" | "advertising";
};

export function LiveGallery({ initial, view }: LiveGalleryProps) {
  const content = useSiteContent(initial);
  if (view === "selected") return <Gallery groups={[{ photos: content.selected }]} label="Selected" />;
  return <Gallery groups={content.projects} label="Advertising" />;
}
