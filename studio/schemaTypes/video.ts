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
      type: "file",
      options: { accept: "video/*" },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { filename: "file.asset.originalFilename" },
    prepare: ({ filename }) => ({ title: filename ?? "Video", media: PlayIcon }),
  },
});
