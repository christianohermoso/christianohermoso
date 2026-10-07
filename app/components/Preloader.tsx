"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { identity, loaderFrames, monogram } from "@/app/data/site";

const scatter: Array<[number, number]> = [
  [-0.62, -0.22],
  [0.48, 0.12],
  [-0.2, 0.3],
  [0.66, -0.26],
  [-0.74, 0.16],
  [0.12, -0.34],
  [0.52, 0.32],
  [-0.4, -0.06],
  [0.22, 0.18],
  [-0.58, -0.36],
  [0.4, -0.08],
  [-0.04, 0.04],
];

const total = String(loaderFrames.length).padStart(2, "0");
const hiddenStroke = "polygon(0% 100%, 0% 100%, 0% 100%)";
const fullStroke = "polygon(0% 100%, 220% 100%, 0% -120%)";

function cadence(index: number) {
  return Math.max(0.07, 0.27 * Math.pow(0.84, index));
}

function decoded(image: HTMLImageElement | null | undefined) {
  if (!image) return Promise.resolve();
  return image.decode().catch(() => undefined);
}

type PreloaderProps = {
  onDone: () => void;
};

export function Preloader({ onDone }: PreloaderProps) {
  const root = useRef<HTMLDivElement>(null);
  const mark = useRef<HTMLDivElement>(null);
  const counter = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const frames = gsap.utils.toArray<HTMLElement>("[data-frame]");
      const chrome = gsap.utils.toArray<HTMLElement>("[data-chrome]");
      const logo = document.querySelector<HTMLElement>("[data-logo-target]");
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const frameHeight = Math.min(window.innerHeight * 0.3, window.innerWidth * 0.42);
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const markHeight = Math.min(window.innerHeight * 0.36, window.innerWidth * 0.5);
      const markWidth = markHeight * (monogram.width / monogram.height);

      gsap.set(logo, { autoAlpha: 0 });
      gsap.set(mark.current, {
        width: markWidth,
        height: markHeight,
        left: centerX - markWidth / 2,
        top: centerY - markHeight / 2,
        clipPath: hiddenStroke,
      });

      frames.forEach((frame, index) => {
        const width = frameHeight * Number(frame.dataset.ratio);
        const [offsetX, offsetY] = scatter[index] ?? [0, 0];
        gsap.set(frame, {
          width,
          height: frameHeight,
          left: centerX - width / 2 + offsetX * frameHeight,
          top: centerY - frameHeight / 2 + offsetY * frameHeight,
        });
      });

      const showCount = (value: number) => {
        if (counter.current) counter.current.textContent = String(value).padStart(2, "0");
      };

      const showLogo = () => gsap.set(logo, { autoAlpha: 1 });
      const timeline = gsap.timeline({ paused: true, onComplete: onDone });

      if (reduced) {
        timeline.call(showLogo).to(root.current, { autoAlpha: 0, duration: 0.3 });
      } else {
        timeline.to(mark.current, { clipPath: fullStroke, duration: 1.1, ease: "power3.inOut" }, 0.15);

        let cursor = 1.05;
        frames.forEach((frame, index) => {
          timeline
            .set(frame, { visibility: "visible" }, cursor)
            .fromTo(
              frame,
              { clipPath: "inset(100% 0% 0% 0%)" },
              { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, ease: "expo.out" },
              cursor,
            )
            .fromTo(frame.firstElementChild, { scale: 1.2 }, { scale: 1, duration: 0.9, ease: "expo.out" }, cursor)
            .call(showCount, [index + 1], cursor);
          cursor += cadence(index);
        });

        timeline
          .to(
            frames,
            {
              clipPath: "inset(0% 0% 100% 0%)",
              duration: 0.7,
              ease: "expo.inOut",
              stagger: { each: 0.02, from: "end" },
            },
            cursor + 0.45,
          )
          .to(chrome, { autoAlpha: 0, duration: 0.35, ease: "power2.out" }, "<0.15")
          .to(root.current, { backgroundColor: "rgba(255,255,255,0)", duration: 0.7, ease: "power2.inOut" }, "<0.2")
          .to(
            mark.current,
            {
              left: () => logo?.getBoundingClientRect().left ?? 24,
              top: () => logo?.getBoundingClientRect().top ?? 24,
              width: () => logo?.getBoundingClientRect().width ?? 48,
              height: () => logo?.getBoundingClientRect().height ?? 44,
              duration: 1.15,
              ease: "expo.inOut",
            },
            "<",
          )
          .call(showLogo)
          .set(mark.current, { autoAlpha: 0 });
      }

      Promise.all([
        ...frames.map((frame) => decoded(frame.querySelector("img"))),
        decoded(mark.current?.querySelector("img")),
        document.fonts.ready,
      ]).then(() => timeline.play());
    },
    { scope: root },
  );

  return (
    <div ref={root} className="loader" aria-hidden="true">
      <p className="loader__name" data-chrome>
        {identity.name}
      </p>
      <p className="loader__count" data-chrome>
        <span ref={counter}>00</span>
        <span className="loader__total"> | {total}</span>
      </p>
      {loaderFrames.map((frame, index) => (
        <div
          key={frame.src}
          className="loader__frame"
          data-frame
          data-ratio={frame.width / frame.height}
          style={{ zIndex: index + 1 }}
        >
          <Image src={frame.src} alt="" width={frame.width} height={frame.height} unoptimized loading="eager" />
        </div>
      ))}
      <div ref={mark} className="loader__mark">
        <Image src={monogram.src} alt="" width={monogram.width} height={monogram.height} unoptimized loading="eager" />
      </div>
    </div>
  );
}
