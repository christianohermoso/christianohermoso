"use client";

import type { SiteContent } from "@/lib/content";
import { useSiteContent } from "@/lib/useSiteContent";

export function LiveContact({ initial }: { initial: SiteContent }) {
  const { contact } = useSiteContent(initial);

  return (
    <dl className="contact">
      <div>
        <dt>Contact</dt>
        <dd>
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
        </dd>
      </div>
      {contact.clients.length > 0 && (
        <div>
          <dt>Select Client List</dt>
          <dd>{contact.clients.join(", ")}.</dd>
        </div>
      )}
    </dl>
  );
}
