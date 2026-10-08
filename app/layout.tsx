import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import { Shell } from "./components/Shell";
import { identity } from "./data/site";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
});

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
    images: [{ url: "/_img/selected/024-1080.webp", width: 1080, height: 1350 }],
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={archivo.variable}>
      <body>
        <noscript>
          <style>{`html{overflow:auto !important}.loader{display:none}.gallery__item img{opacity:1}[data-logo-target]{visibility:visible}`}</style>
        </noscript>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
