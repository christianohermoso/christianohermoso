import type { Metadata } from "next";
import { LiveContact } from "../components/LiveContact";
import { content } from "../data/content";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <>
      <h1 className="visually-hidden">Contact</h1>
      <LiveContact initial={content} />
    </>
  );
}
