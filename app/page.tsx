import { Gallery } from "./components/Gallery";
import { overviewProjects } from "./data/projects";
import { identity } from "./data/site";

export default function OverviewPage() {
  return (
    <>
      <h1 className="visually-hidden">
        {identity.name}, {identity.description}
      </h1>
      <Gallery groups={overviewProjects} label="Overview" />
    </>
  );
}
