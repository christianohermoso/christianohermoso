import type { Metadata } from "next";
import { content } from "@/app/data/content";
import { identity } from "@/app/data/site";

export const siteUrl = "https://www.christianohermoso.com";

const shareImage = { url: "/opengraph-image.png", width: 1200, height: 630, alt: identity.name };

const featuredClients = content.contact.clients.slice(0, 5).map((client) =>
  client
    .toLowerCase()
    .replace(/\b([a-z])/g, (letter) => letter.toUpperCase())
    .replace(/\bNyx\b/, "NYX")
    .replace(/\bR\.e\.m\b/, "R.E.M"),
);

export const pageCopy = {
  home: {
    title: `${identity.name}, Photographer & Creative Director`,
    description: `${identity.name} is a Los Angeles based photographer and creative director.`,
  },
  advertising: {
    title: "Advertising",
    description: `Advertising photography by ${identity.name}, a Los Angeles based photographer and creative director, for brands including ${featuredClients.join(", ")}.`,
  },
  contact: {
    title: "Contact",
    description: `Contact ${identity.name}, a Los Angeles based photographer and creative director.`,
  },
};

export function pageMetadata(path: string, copy: { title: string; description: string }): Metadata {
  const title = path === "/" ? { absolute: copy.title } : copy.title;
  return {
    title,
    description: copy.description,
    alternates: { canonical: path },
    openGraph: {
      title: path === "/" ? copy.title : `${copy.title} — ${identity.name}`,
      description: copy.description,
      url: path,
      siteName: identity.name,
      locale: "en_US",
      type: "website",
      images: [shareImage],
    },
    twitter: {
      card: "summary_large_image",
      title: path === "/" ? copy.title : `${copy.title} — ${identity.name}`,
      description: copy.description,
      images: [shareImage],
    },
  };
}

export function structuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${siteUrl}/#person`,
        name: identity.name,
        url: siteUrl,
        jobTitle: ["Photographer", "Creative Director"],
        description: identity.description,
        email: `mailto:${content.contact.email}`,
        address: { "@type": "PostalAddress", addressLocality: "Los Angeles", addressRegion: "CA", addressCountry: "US" },
        sameAs: content.contact.instagram ? [content.contact.instagram] : [],
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        name: identity.name,
        url: siteUrl,
        publisher: { "@id": `${siteUrl}/#person` },
        inLanguage: "en",
      },
    ],
  };
}
