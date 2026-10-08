import { defineArrayMember, defineField } from "sanity";
import { MediaUploadInput } from "../components/MediaUploadInput";

export function mediaField() {
  return defineField({
    name: "media",
    title: "Images & videos",
    description: "Upload many at once with the button below. Drag to reorder.",
    type: "array",
    options: { layout: "grid" },
    of: [defineArrayMember({ type: "image" }), defineArrayMember({ type: "video" })],
    components: { input: MediaUploadInput },
  });
}
