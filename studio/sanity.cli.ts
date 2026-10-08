import { defineCliConfig } from "sanity/cli";
import { dataset, projectId } from "./env";

export default defineCliConfig({
  api: { projectId, dataset },
  studioHost: "christianohermoso",
  deployment: { appId: "ea5cza2phqjm0067xhwp6kxk", autoUpdates: true },
});
