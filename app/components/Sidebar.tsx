"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { useMountEffect } from "@/hooks/useMountEffect";
import { content } from "@/app/data/content";
import { identity, monogram, navigation } from "@/app/data/site";

const scrollTolerance = 8;

export function Sidebar() {
  const pathname = usePathname();
  const header = useRef<HTMLElement>(null);

  useMountEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const element = header.current;
      if (!element) return;
      const y = Math.max(window.scrollY, 0);
      const delta = y - lastY;
      if (Math.abs(delta) < scrollTolerance) return;
      const pastHeader = y > element.offsetHeight;
      element.dataset.tucked = String(delta > 0 && pastHeader);
      element.dataset.floating = String(pastHeader);
      lastY = y;
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  });

  return (
    <header ref={header} className="sidebar">
      <Link href="/" className="sidebar__home" aria-label={`${identity.name}, overview`}>
        <span className="sidebar__mark" data-logo-target>
          <Image src={monogram.src} alt="" width={monogram.width} height={monogram.height} unoptimized />
        </span>
        <span className="sidebar__name">{identity.name}</span>
      </Link>
      <nav className="sidebar__nav" aria-label="Primary">
        <ul>
          {navigation.map((item) => (
            <li key={item.href}>
              <Link href={item.href} aria-current={pathname === item.href ? "page" : undefined}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
        <a className="sidebar__social" href={content.contact.instagram} target="_blank" rel="noreferrer">
          Instagram
        </a>
      </nav>
    </header>
  );
}
