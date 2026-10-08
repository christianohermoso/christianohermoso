import type { Metadata } from "next";
import { LiveGallery } from "../components/LiveGallery";
import { content } from "../data/content";

export const metadata: Metadata = {
  title: "Advertising",
};

export default function AdvertisingPage() {
  return (
    <>
      <h1 className="visually-hidden">Advertising</h1>
      <LiveGallery initial={content} view="advertising" />
    </>
  );
}
