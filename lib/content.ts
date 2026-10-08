import { contentQuery, normalizeContent } from "./content-query.mjs";
import { sanityConfig } from "./sanity-config.mjs";

export type Photo = {
  src?: string;
  width: number;
  height: number;
  video?: string;
};

export type Project = {
  title: string;
  photos: Photo[];
};

export type IntroFrame = {
  src: string;
  width: number;
  height: number;
};

export type SiteContent = {
  selected: Photo[];
  projects: Project[];
  intro: IntroFrame[];
  contact: {
    email: string;
    clients: string[];
    instagram: string;
  };
};

export async function fetchContent(): Promise<SiteContent> {
  const params = new URLSearchParams({ query: contentQuery, perspective: "published" });
  const { projectId, dataset, apiVersion } = sanityConfig;
  const response = await fetch(`https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}?${params}`);
  if (!response.ok) throw new Error(`Sanity responded ${response.status}`);
  const { result } = await response.json();
  return normalizeContent(result) as SiteContent;
}

export function photoKey(photo: Photo) {
  return photo.video ?? photo.src ?? "";
}
