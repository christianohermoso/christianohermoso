import { writeFile } from "node:fs/promises";
import path from "node:path";
import { contentQuery, normalizeContent } from "../lib/content-query.mjs";
import { sanityConfig } from "../lib/sanity-config.mjs";

const contentFile = path.resolve("app/data/content.ts");

async function main() {
  const { projectId, dataset, apiVersion } = sanityConfig;
  const params = new URLSearchParams({ query: contentQuery, perspective: "published" });
  const response = await fetch(`https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}?${params}`);
  if (!response.ok) {
    console.warn(`sanity: request failed (${response.status}), keeping current content`);
    return;
  }
  const content = normalizeContent((await response.json()).result);
  if (!content.selected.length && !content.projects.length) {
    console.warn("sanity: no published media, keeping current content");
    return;
  }
  const source = `import type { SiteContent } from "@/lib/content";\n\nexport const content: SiteContent = ${JSON.stringify(content, null, 2)};\n`;
  await writeFile(contentFile, source);
  const items = content.selected.length + content.projects.reduce((sum, project) => sum + project.photos.length, 0);
  console.log(`sanity: ${content.selected.length} selected, ${content.projects.length} projects, ${items} items, intro ${content.intro.length}`);
}

await main().catch((error) => {
  console.warn(`sanity: ${error.message}, keeping current content`);
});
