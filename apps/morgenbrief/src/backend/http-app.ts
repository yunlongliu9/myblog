import { handleEditionRequest } from "./app.js";
import { getWebAsset } from "./web-assets.js";
import type { AssetFile } from "./web-assets.js";

export function createHttpApp(loadAsset: (file: AssetFile) => Promise<BodyInit>) {
  return async (method: string, url: URL): Promise<Response> => {
    if (url.pathname === "/api" || url.pathname.startsWith("/api/")) {
      return handleEditionRequest(method, url);
    }

    const asset = getWebAsset(url.pathname);
    if (!asset) return new Response("Not found", { status: 404 });
    if (method !== "GET" && method !== "HEAD") {
      return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
    }

    try {
      const body = method === "HEAD" ? null : await loadAsset(asset.file);
      return new Response(body, { headers: { "Content-Type": asset.type } });
    } catch (cause) {
      console.error("Could not load web asset", cause);
      return new Response("Internal server error", { status: 500 });
    }
  };
}
