import { defineField, defineType } from "sanity";
import { ImagesIcon } from "@sanity/icons/Images";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { mediaField } from "./mediaField";

export const project = defineType({
  name: "project",
  title: "Advertising project",
  type: "document",
  icon: ImagesIcon,
  orderings: [orderRankOrdering],
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    mediaField(),
    orderRankField({ type: "project" }),
  ],
  preview: {
    select: { title: "title", media: "media.0.asset", count: "media" },
    prepare: ({ title, media, count }) => ({
      title,
      subtitle: Array.isArray(count) ? `${count.length} items` : "Empty",
      media,
    }),
  },
});
