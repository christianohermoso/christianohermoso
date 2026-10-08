import { LiveGallery } from "./components/LiveGallery";
import { content } from "./data/content";
import { identity } from "./data/site";

export default function SelectedPage() {
  return (
    <>
      <h1 className="visually-hidden">
        {identity.name}, {identity.description}
      </h1>
      <LiveGallery initial={content} view="selected" />
    </>
  );
}
