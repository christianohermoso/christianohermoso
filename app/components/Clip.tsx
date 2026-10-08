"use client";

import { useRef } from "react";
import { useMountEffect } from "@/hooks/useMountEffect";
import imageLoader from "@/lib/image-loader";

type ClipProps = {
  src: string;
  poster: string;
  className?: string;
  onLoaded?: (event: React.SyntheticEvent<HTMLVideoElement>) => void;
};

export function Clip({ src, poster, className, onLoaded }: ClipProps) {
  const video = useRef<HTMLVideoElement>(null);

  useMountEffect(() => {
    const element = video.current;
    if (!element) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !prefersReducedMotion) element.play().catch(() => undefined);
        else element.pause();
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  });

  return (
    <video
      ref={video}
      className={className}
      src={src}
      poster={imageLoader({ src: poster, width: 1080 })}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      onLoadedData={onLoaded}
    />
  );
}
