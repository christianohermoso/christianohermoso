import { contact } from "./contact";
import { intro } from "./intro";
import { project } from "./project";
import { selected } from "./selected";
import { video } from "./video";

export const schemaTypes = [intro, selected, project, contact, video];

export const singletonTypes = new Set(["intro", "selected", "contact"]);
