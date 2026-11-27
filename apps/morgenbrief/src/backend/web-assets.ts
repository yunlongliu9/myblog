export const webAssets = {
  "/": { file: "index.html", type: "text/html; charset=utf-8" },
  "/index.html": { file: "index.html", type: "text/html; charset=utf-8" },
  "/style.css": { file: "style.css", type: "text/css; charset=utf-8" },
  "/berlin.webp": { file: "berlin.webp", type: "image/webp" },
  "/reader-controller.js": { file: "reader-controller.js", type: "text/javascript; charset=utf-8" }
} as const;

export type AssetFile = typeof webAssets[keyof typeof webAssets]["file"];

export function getWebAsset(path: string) {
  if (Object.hasOwn(webAssets, path)) return webAssets[path as keyof typeof webAssets];
}
