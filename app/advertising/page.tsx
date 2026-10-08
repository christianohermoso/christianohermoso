import type { Metadata } from "next";
import { pageCopy, pageMetadata } from "@/lib/seo";
import { LiveGallery } from "../components/LiveGallery";
import { content } from "../data/content";

export const metadata: Metadata = pageMetadata("/advertising", pageCopy.advertising);

export default function AdvertisingPage() {
  return (
    <>
      <h1 className="visually-hidden">Advertising</h1>
      <LiveGallery initial={content} view="advertising" />
    </>
  );
}
