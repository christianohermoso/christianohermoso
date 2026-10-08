import type { StructureResolver } from "sanity/structure";
import { EnvelopeIcon } from "@sanity/icons/Envelope";
import { StarIcon } from "@sanity/icons/Star";
import { orderableDocumentListDeskItem } from "@sanity/orderable-document-list";

export const structure: StructureResolver = (S, context) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Selected")
        .icon(StarIcon)
        .child(S.document().schemaType("selected").documentId("selected").title("Selected")),
      orderableDocumentListDeskItem({ type: "project", title: "Advertising", S, context }),
      S.divider(),
      S.listItem()
        .title("Contact")
        .icon(EnvelopeIcon)
        .child(S.document().schemaType("contact").documentId("contact").title("Contact")),
    ]);
