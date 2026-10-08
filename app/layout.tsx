import type { Metadata, Viewport } from "next";
import { Shell } from "./components/Shell";
import { identity } from "./data/site";
import { pageCopy, pageMetadata, siteUrl, structuredData } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  ...pageMetadata("/", pageCopy.home),
  metadataBase: new URL(siteUrl),
  title: {
    default: pageCopy.home.title,
    template: `%s — ${identity.name}`,
  },
  applicationName: identity.name,
  authors: [{ name: identity.name, url: siteUrl }],
  creator: identity.name,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>
        <noscript>
          <style>{`html{overflow:auto !important}.loader{display:none}.gallery__item img{opacity:1}[data-logo-target]{visibility:visible}`}</style>
        </noscript>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData()).replace(/</g, "\\u003c") }}
        />
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
