import type { Metadata } from "next";
import { Gallery } from "../components/Gallery";
import { about } from "../data/photos";
import { bio, clients, identity, publications } from "../data/site";

export const metadata: Metadata = {
  title: "About/contact",
};

export default function ContactPage() {
  return (
    <>
      <h1 className="visually-hidden">About and contact</h1>
      <div className="contact">
        <div className="contact__bio">
          {bio.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <dl className="contact__details">
          <div>
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${identity.email}`}>{identity.email}</a>
            </dd>
          </div>
          <div>
            <dt>Representation</dt>
            <dd>
              <a href={identity.representation.href}>{identity.representation.email}</a>
            </dd>
          </div>
          <div>
            <dt>Select Client List:</dt>
            <dd>{clients}</dd>
          </div>
          <div>
            <dt>Published In:</dt>
            <dd>{publications}</dd>
          </div>
        </dl>
      </div>
      <Gallery groups={[{ photos: about }]} label="About" />
    </>
  );
}
