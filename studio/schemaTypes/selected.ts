import { defineType } from "sanity";
import { StarIcon } from "@sanity/icons/Star";
import { mediaField } from "./mediaField";

export const selected = defineType({
  name: "selected",
  title: "Selected",
  type: "document",
  icon: StarIcon,
  fields: [mediaField()],
  preview: { prepare: () => ({ title: "Selected" }) },
});
