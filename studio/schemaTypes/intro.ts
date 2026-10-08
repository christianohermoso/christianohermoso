import { defineArrayMember, defineField, defineType } from "sanity";
import { PlayIcon } from "@sanity/icons/Play";
import { MediaUploadInput } from "../components/MediaUploadInput";

export const intro = defineType({
  name: "intro",
  title: "Intro",
  type: "document",
  icon: PlayIcon,
  fields: [
    defineField({
      name: "images",
      title: "Intro images",
      description:
        "The photos that flick through when the site opens, in this order. Upload new ones with the button below or pick existing ones from the media library. Drag to reorder. 8–16 works best.",
      type: "array",
      options: { layout: "grid" },
      of: [defineArrayMember({ type: "image" })],
      components: { input: MediaUploadInput },
      validation: (rule) => [
        rule.min(3).error("Add at least 3 images."),
        rule.max(20).warning("More than 20 makes the intro long."),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Intro" }) },
});
