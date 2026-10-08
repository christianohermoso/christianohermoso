import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="missing">
      <h1 className="missing__code">404</h1>
      <p>This page doesn&apos;t exist.</p>
      <Link href="/" className="missing__link">
        Back to Selected
      </Link>
    </div>
  );
}
