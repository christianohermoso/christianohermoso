import type { NextConfig } from "next";
import { imageWidths } from "./lib/image-widths.mjs";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    loader: "custom",
    loaderFile: "./lib/image-loader.ts",
    deviceSizes: imageWidths.slice(1),
    imageSizes: imageWidths.slice(0, 1),
  },
};

export default nextConfig;
