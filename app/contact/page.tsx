import type { Metadata } from "next";
import { contact } from "../data/contact";

export const metadata: Metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <>
      <h1 className="visually-hidden">Contact</h1>
      <dl className="contact">
        <div>
          <dt>Contact</dt>
          <dd>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </dd>
        </div>
        <div>
          <dt>Select Client List</dt>
          <dd>{contact.clients.join(", ")}.</dd>
        </div>
      </dl>
    </>
  );
}
