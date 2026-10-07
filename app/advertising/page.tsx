import type { Metadata } from "next";
import { Gallery } from "../components/Gallery";
import { advertisingProjects } from "../data/projects";

export const metadata: Metadata = {
  title: "Advertising",
};

export default function AdvertisingPage() {
  return (
    <>
      <h1 className="visually-hidden">Advertising</h1>
      <Gallery groups={advertisingProjects} label="Advertising" />
    </>
  );
}
