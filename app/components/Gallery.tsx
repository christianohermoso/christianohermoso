"use client";

import Image from "next/image";
import { useState } from "react";
import type { Photo } from "@/app/data/photos";
import { gridSizes } from "@/lib/sizes";
import { Clip } from "./Clip";
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

function arrange(photos: Photo[]) {
  const rows: Photo[][] = [];
  let waiting: Photo | null = null;
  for (const photo of photos) {
    if (isWide(photo)) {
      rows.push([photo]);
    } else if (waiting) {
      rows.push([waiting, photo]);
      waiting = null;
    } else {
      waiting = photo;
    }
  }
  if (waiting) rows.push([waiting]);
  return rows;
}

function isLonePortrait(row: Row) {
  return row.length === 1 && !isWide(row[0].photo);
}

function rowStyle(row: Row) {
  const ratioSum = row.reduce((sum, item) => sum + ratioOf(item.photo), 0);
  return { "--row-ratio": ratioSum.toFixed(4) } as React.CSSProperties;
}

function markLoaded(event: React.SyntheticEvent<HTMLImageElement | HTMLVideoElement>) {
  event.currentTarget.dataset.loaded = "true";
}

function layout(groups: PhotoGroup[]) {
  let index = 0;
  const photos: Photo[] = [];
  const captions: Array<string | undefined> = [];
  const sections = groups.map((group) => {
    const rows: Row[] = arrange(group.photos).map((row) =>
      row.map((photo) => {
        photos.push(photo);
        captions.push(group.title);
        return { photo, index: index++ };
      }),
    );
    return { ...group, rows };
  });
  return { sections, photos, captions };
}

type GalleryProps = {
  groups: PhotoGroup[];
  label: string;
};

export function Gallery({ groups, label }: GalleryProps) {
  const [viewing, setViewing] = useState<number | null>(null);
  const { sections, photos, captions } = layout(groups);

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
              <div
                key={row[0].photo.src}
                className="gallery__row"
                data-lone={isLonePortrait(row) ? "" : undefined}
                style={rowStyle(row)}
              >
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
                    {photo.video ? (
                      <Clip src={photo.video} poster={photo.src} onLoaded={markLoaded} />
                    ) : (
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
                    )}
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
