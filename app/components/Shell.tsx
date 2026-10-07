"use client";

import { useState } from "react";
import { Preloader } from "./Preloader";
import { Sidebar } from "./Sidebar";

export function Shell({ children }: { children: React.ReactNode }) {
  const [intro, setIntro] = useState(true);

  return (
    <>
      {intro && <Preloader onDone={() => setIntro(false)} />}
      <Sidebar />
      <main className="column">{children}</main>
    </>
  );
}
