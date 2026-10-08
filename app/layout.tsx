import type { Metadata, Viewport } from "next";
import { Shell } from "./components/Shell";
import { selected } from "./data/photos";
import { identity } from "./data/site";
import "./globals.css";

const shareImage = selected.find((photo) => !photo.video) ?? selected[0];
const shareWidth = Math.min(1080, shareImage.width);

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
    images: [
      {
        url: `/_img${shareImage.src.replace(/\.webp$/, "")}-1080.webp`,
        width: shareWidth,
        height: Math.round((shareImage.height / shareImage.width) * shareWidth),
      },
    ],
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
