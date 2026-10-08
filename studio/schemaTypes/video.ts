import { defineField, defineType } from "sanity";
import { PlayIcon } from "@sanity/icons/Play";

export const video = defineType({
  name: "video",
  title: "Video",
  type: "object",
  icon: PlayIcon,
  fields: [
    defineField({
      name: "file",
      title: "Video file",
      description: "MP4 (H.264) or WebM. iPhone .mov files don't play in Chrome or Firefox; export as MP4 first.",
      type: "file",
      options: { accept: "video/mp4,video/webm" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "poster",
      title: "Cover image",
      description: "Optional. Shown before the video starts playing.",
      type: "image",
    }),
    defineField({ name: "width", type: "number", hidden: true, readOnly: true }),
    defineField({ name: "height", type: "number", hidden: true, readOnly: true }),
  ],
  preview: {
    select: { filename: "file.asset.originalFilename", poster: "poster" },
    prepare: ({ filename, poster }) => ({ title: filename ?? "Video", media: poster ?? PlayIcon }),
  },
});
