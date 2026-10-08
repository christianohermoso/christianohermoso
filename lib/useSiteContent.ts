"use client";

import useSWR from "swr";
import { fetchContent, type SiteContent } from "./content";

export function useSiteContent(fallback: SiteContent) {
  const { data } = useSWR("site-content", fetchContent, {
    fallbackData: fallback,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 5 * 60 * 1000,
  });
  return data ?? fallback;
}
