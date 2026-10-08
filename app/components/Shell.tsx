"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { navigation } from "@/app/data/site";
import { Preloader } from "./Preloader";
import { Sidebar } from "./Sidebar";

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [intro, setIntro] = useState(() => navigation.some((item) => item.href === pathname));

  return (
    <>
      {intro && <Preloader onDone={() => setIntro(false)} />}
      <Sidebar />
      <main className="column">{children}</main>
    </>
  );
}
