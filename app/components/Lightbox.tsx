"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useMountEffect } from "@/hooks/useMountEffect";
import { gridSizes } from "@/lib/sizes";
import { Clip } from "./Clip";
import { photoKey, type Photo } from "@/lib/content";

const viewerSizes = "100vw";

type LightboxProps = {
  photos: Photo[];
  index: number;
  label: string;
  caption?: string;
  onStep: (delta: number) => void;
  onClose: () => void;
};

function thumbnailFor(index: number) {
  return document.querySelector<HTMLElement>(`[data-photo-index="${index}"]`);
}

function isOnScreen(element: HTMLElement | null): element is HTMLElement {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  return rect.bottom > 0 && rect.top < window.innerHeight;
}

function deltaBetween(from: DOMRect, to: DOMRect) {
  return {
    x: from.left - to.left,
    y: from.top - to.top,
    scaleX: from.width / to.width,
    scaleY: from.height / to.height,
  };
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function markLoaded(event: React.SyntheticEvent<HTMLImageElement | HTMLVideoElement>) {
  event.currentTarget.dataset.loaded = "true";
}

function keepFocusInside(container: HTMLElement | null, event: KeyboardEvent) {
  if (!container) return;
  const focusable = [...container.querySelectorAll<HTMLElement>("button")].filter(
    (element) => element.offsetParent !== null,
  );
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;
  if (event.shiftKey && (active === first || !container.contains(active))) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && (active === last || !container.contains(active))) {
    event.preventDefault();
    first.focus();
  }
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function Lightbox({ photos, index, label, caption, onStep, onClose }: LightboxProps) {
  const root = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const swipeStart = useRef<number | null>(null);
  const hasOpened = useRef(false);
  const closing = useRef(false);

  const photo = photos[index];
  const neighbours = [photos[(index + 1) % photos.length], photos[(index - 1 + photos.length) % photos.length]].filter(
    (item): item is Photo & { src: string } => Boolean(item.src) && !item.video,
  );

  useGSAP(
    () => {
      const isFirstOpen = !hasOpened.current;
      hasOpened.current = true;

      if (isFirstOpen) {
        gsap.from(root.current, { backgroundColor: "rgba(255,255,255,0)", duration: 0.5, ease: "power2.out" });
        gsap.from("[data-viewer-chrome]", { autoAlpha: 0, duration: 0.5, delay: 0.3, ease: "power2.out" });
      }
      if (prefersReducedMotion() || !frame.current) return;

      const thumbnail = thumbnailFor(index);
      if (isFirstOpen && thumbnail) {
        gsap.from(frame.current, {
          ...deltaBetween(thumbnail.getBoundingClientRect(), frame.current.getBoundingClientRect()),
          transformOrigin: "0 0",
          duration: 1,
          ease: "expo.out",
        });
      }
    },
    { scope: root, dependencies: [index] },
  );

  const requestClose = () => {
    if (closing.current) return;
    closing.current = true;
    const current = Number(frame.current?.dataset.index ?? index);
    const thumbnail = thumbnailFor(current);
    const finish = () => {
      onClose();
      thumbnail?.focus({ preventScroll: true });
    };

    const timeline = gsap.timeline({ onComplete: finish });
    timeline.to(root.current?.querySelectorAll("[data-viewer-chrome]") ?? [], { autoAlpha: 0, duration: 0.2 }, 0);

    if (frame.current && isOnScreen(thumbnail) && !prefersReducedMotion()) {
      timeline
        .to(
          frame.current,
          {
            ...deltaBetween(thumbnail.getBoundingClientRect(), frame.current.getBoundingClientRect()),
            transformOrigin: "0 0",
            duration: 0.65,
            ease: "expo.inOut",
          },
          0,
        )
        .to(root.current, { backgroundColor: "rgba(255,255,255,0)", duration: 0.45, ease: "power2.in" }, 0.15);
      return;
    }

    timeline.to(root.current, { autoAlpha: 0, duration: 0.3, ease: "power2.out" }, 0);
  };

  useMountEffect(() => {
    closeButton.current?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") requestClose();
      if (event.key === "ArrowRight") onStep(1);
      if (event.key === "ArrowLeft") onStep(-1);
      if (event.key === "Tab") keepFocusInside(root.current, event);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const onPointerDown = (event: React.PointerEvent) => {
    swipeStart.current = event.clientX;
  };

  const onPointerUp = (event: React.PointerEvent) => {
    if (swipeStart.current === null) return;
    const distance = event.clientX - swipeStart.current;
    swipeStart.current = null;
    if (Math.abs(distance) > 48) onStep(distance < 0 ? 1 : -1);
  };

  return (
    <div
      ref={root}
      className="viewer"
      role="dialog"
      aria-modal="true"
      aria-label={`${caption ?? label} image ${index + 1} of ${photos.length}`}
    >
      <div className="viewer__bar" data-viewer-chrome>
        <p className="viewer__count">
          <span className="viewer__current">{pad(index + 1)}</span> | {pad(photos.length)}
        </p>
        {caption && <p className="viewer__caption">{caption}</p>}
        <button ref={closeButton} type="button" className="viewer__text-button" onClick={requestClose}>
          Close
        </button>
      </div>

      <div
        className="viewer__stage"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (swipeStart.current = null)}
      >
        <figure
          ref={frame}
          key={photoKey(photo)}
          className="viewer__frame"
          data-index={index}
          style={{ "--ratio": (photo.width / photo.height).toFixed(4) } as React.CSSProperties}
        >
          <div className="viewer__prints">
            {photo.src && (
              <Image src={photo.src} alt="" width={photo.width} height={photo.height} sizes={gridSizes} />
            )}
            {photo.video ? (
              <Clip className="viewer__full" src={photo.video} poster={photo.src} onLoaded={markLoaded} />
            ) : (
              <Image
                className="viewer__full"
                src={photo.src ?? ""}
                alt={`${caption ?? label} photography by Christiano Hermoso`}
                width={photo.width}
                height={photo.height}
                sizes={viewerSizes}
                loading="eager"
                onLoad={markLoaded}
              />
            )}
          </div>
        </figure>
        <button
          type="button"
          className="viewer__zone viewer__zone--previous"
          aria-label="Previous image"
          onClick={() => onStep(-1)}
        />
        <button
          type="button"
          className="viewer__zone viewer__zone--next"
          aria-label="Next image"
          onClick={() => onStep(1)}
        />
      </div>

      <div className="viewer__bar viewer__bar--foot" data-viewer-chrome>
        <button type="button" className="viewer__text-button" onClick={() => onStep(-1)}>
          Previous
        </button>
        <button type="button" className="viewer__text-button" onClick={() => onStep(1)}>
          Next
        </button>
      </div>

      <div className="viewer__preload" aria-hidden="true">
        {neighbours.map((item) => (
          <Image
            key={item.src}
            src={item.src}
            alt=""
            width={item.width}
            height={item.height}
            sizes={viewerSizes}
            loading="eager"
          />
        ))}
      </div>
    </div>
  );
}
