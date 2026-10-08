import { contact } from "./contact";
import { project } from "./project";
import { selected } from "./selected";
import { video } from "./video";

export const schemaTypes = [selected, project, contact, video];

export const singletonTypes = new Set(["selected", "contact"]);
