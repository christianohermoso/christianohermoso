import type { Metadata } from "next";
import { pageCopy, pageMetadata } from "@/lib/seo";
import { LiveContact } from "../components/LiveContact";
import { content } from "../data/content";

export const metadata: Metadata = pageMetadata("/contact", pageCopy.contact);

export default function ContactPage() {
  return (
    <>
      <h1 className="visually-hidden">Contact</h1>
      <LiveContact initial={content} />
    </>
  );
}
