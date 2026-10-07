"use client";

import Image from "next/image";
import { useState } from "react";
import type { Photo } from "@/app/data/photos";
import { gridSizes } from "@/lib/sizes";
import { Lightbox } from "./Lightbox";

type Row = Array<{ photo: Photo; index: number }>;

function ratioOf(photo: Photo) {
  return photo.width / photo.height;
}

function isWide(photo: Photo) {
  return ratioOf(photo) > 1.15;
}

export type PhotoGroup = {
  title?: string;
  photos: Photo[];
};

function toRows(photos: Photo[], offset: number) {
  const rows: Row[] = [];
  let pending: Row = [];
  photos.forEach((photo, position) => {
    const index = offset + position;
    if (isWide(photo)) {
      if (pending.length) rows.push(pending);
      rows.push([{ photo, index }]);
      pending = [];
      return;
    }
    pending.push({ photo, index });
    if (pending.length === 2) {
      rows.push(pending);
      pending = [];
    }
  });
  if (pending.length) rows.push(pending);
  return rows;
}

function rowStyle(row: Row) {
  const ratioSum = row.reduce((sum, item) => sum + ratioOf(item.photo), 0);
  return { "--row-ratio": ratioSum.toFixed(4) } as React.CSSProperties;
}

function markLoaded(event: React.SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.dataset.loaded = "true";
}

function layout(groups: PhotoGroup[]) {
  let offset = 0;
  return groups.map((group) => {
    const rows = toRows(group.photos, offset);
    offset += group.photos.length;
    return { ...group, rows };
  });
}

type GalleryProps = {
  groups: PhotoGroup[];
  label: string;
};

export function Gallery({ groups, label }: GalleryProps) {
  const [viewing, setViewing] = useState<number | null>(null);
  const sections = layout(groups);
  const photos = groups.flatMap((group) => group.photos);
  const captions = groups.flatMap((group) => group.photos.map(() => group.title));

  const open = (index: number) => setViewing(index);
  const close = () => setViewing(null);

  const step = (delta: number) =>
    setViewing((current) => (current === null ? current : (current + delta + photos.length) % photos.length));

  return (
    <>
      <div className="gallery">
        {sections.map((section, sectionIndex) => (
          <section key={section.photos[0].src} className="gallery__group" aria-label={section.title}>
            {section.title && <h2 className="gallery__title">{section.title}</h2>}
            {section.rows.map((row) => (
              <div key={row[0].photo.src} className="gallery__row" style={rowStyle(row)}>
                {row.map(({ photo, index }) => (
                  <button
                    key={photo.src}
                    type="button"
                    className="gallery__item"
                    data-photo-index={index}
                    style={{ "--ratio": ratioOf(photo).toFixed(4) } as React.CSSProperties}
                    onClick={() => open(index)}
                    aria-label={`View ${label} image ${index + 1} of ${photos.length}`}
                  >
                    <Image
                      src={photo.src}
                      alt={`${label} photograph ${index + 1} of ${photos.length} by Christiano Hermoso`}
                      width={photo.width}
                      height={photo.height}
                      sizes={gridSizes}
                      loading={sectionIndex < 2 ? "eager" : "lazy"}
                      preload={index === 0}
                      onLoad={markLoaded}
                    />
                  </button>
                ))}
              </div>
            ))}
          </section>
        ))}
      </div>
      {viewing !== null && (
        <Lightbox
          photos={photos}
          index={viewing}
          label={label}
          caption={captions[viewing]}
          onStep={step}
          onClose={close}
        />
      )}
    </>
  );
}
