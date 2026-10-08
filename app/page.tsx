import { Gallery } from "./components/Gallery";
import { selected } from "./data/photos";
import { identity } from "./data/site";

export default function SelectedPage() {
  return (
    <>
      <h1 className="visually-hidden">
        {identity.name}, {identity.description}
      </h1>
      <Gallery groups={[{ photos: selected }]} label="Selected" />
    </>
  );
}
