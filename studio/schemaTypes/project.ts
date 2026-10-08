import { defineField, defineType } from "sanity";
import { ImagesIcon } from "@sanity/icons/Images";
import { orderRankField, orderRankOrdering } from "@sanity/orderable-document-list";
import { mediaField } from "./mediaField";

function countItems(items: unknown) {
  if (Array.isArray(items)) return items.length;
  if (items && typeof items === "object") return Object.keys(items).length;
  return undefined;
}

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
    select: { title: "title", image: "media.0.asset", poster: "media.0.poster.asset", items: "media" },
    prepare: ({ title, image, poster, items }) => {
      const count = countItems(items);
      return {
        title,
        subtitle: count === undefined ? undefined : count === 0 ? "Empty" : `${count} ${count === 1 ? "item" : "items"}`,
        media: image ?? poster,
      };
    },
  },
});
