const mediaItem = `{
  _type == "video" => {
    "video": file.asset->url,
    "src": poster.asset->url,
    "width": coalesce(width, poster.asset->metadata.dimensions.width, 1080),
    "height": coalesce(height, poster.asset->metadata.dimensions.height, 1350)
  },
  _type == "image" => {
    "src": asset->url,
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height
  }
}`;

export const contentQuery = `{
  "selected": *[_id == "selected"][0].media[]${mediaItem},
  "projects": *[_type == "project" && count(media) > 0] | order(orderRank) {
    title,
    "photos": media[]${mediaItem}
  },
  "contact": *[_id == "contact"][0]{ email, clients, instagram },
  "intro": *[_type == "intro" && !(_id in path("drafts.**"))][0].images[]{
    "src": asset->url,
    "width": asset->metadata.dimensions.width,
    "height": asset->metadata.dimensions.height
  }
}`;

function cleanPhotos(photos) {
  return (photos ?? [])
    .filter((photo) => photo && (photo.src || photo.video) && photo.width && photo.height)
    .map(({ src, video, width, height }) => ({
      ...(src ? { src } : {}),
      ...(video ? { video } : {}),
      width,
      height,
    }));
}

export function normalizeContent(raw) {
  const selected = cleanPhotos(raw?.selected);
  const projects = (raw?.projects ?? [])
    .map((project) => ({ title: project.title ?? "", photos: cleanPhotos(project.photos) }))
    .filter((project) => project.photos.length > 0);
  const chosenIntro = cleanPhotos(raw?.intro);
  const intro = chosenIntro.length ? chosenIntro : selected.filter((photo) => photo.src && !photo.video).slice(0, 12);
  return {
    selected,
    projects,
    intro: intro.map(({ src, width, height }) => ({ src, width, height })),
    contact: {
      email: raw?.contact?.email ?? "",
      clients: raw?.contact?.clients ?? [],
      instagram: raw?.contact?.instagram ?? "",
    },
  };
}
