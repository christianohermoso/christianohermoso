import type { Metadata, Viewport } from "next";
import { Shell } from "./components/Shell";
import { content } from "./data/content";
import { identity } from "./data/site";
import "./globals.css";

const shareImage = content.selected.find((photo) => photo.src && !photo.video);
const shareUrl = shareImage?.src ? `${shareImage.src}?w=1200&q=80&fm=jpg&fit=max` : undefined;

export const metadata: Metadata = {
  metadataBase: new URL("https://www.christianohermoso.com"),
  title: {
    default: identity.name,
    template: `%s — ${identity.name}`,
  },
  description: identity.description,
  openGraph: {
    title: identity.name,
    description: identity.description,
    siteName: identity.name,
    type: "website",
    images: shareUrl
      ? [
          {
            url: shareUrl,
            width: 1200,
            height: Math.round((shareImage!.height / shareImage!.width) * 1200),
          },
        ]
      : undefined,
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
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
