import type { EditionService } from "./edition-service.js";

function error(status: number, message: string, headers?: HeadersInit): Response {
  return Response.json({ error: message }, { status, headers });
}

export function createEditionController(service: EditionService) {
  return async (method: string, url: URL): Promise<Response> => {
    const { pathname, searchParams } = url;
    const id = /^\/api\/editions\/([a-z0-9-]+)$/.exec(pathname)?.[1];
    if (pathname !== "/api/editions" && !id) return error(404, "Route not found");
    if (method !== "GET") return error(405, "Method not allowed", { Allow: "GET" });

    const date = searchParams.get("date");
    if (date !== null && (!/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      new Date(date).toJSON()?.slice(0, 10) !== date)) {
      return error(400, "Expected a valid date in YYYY-MM-DD format");
    }

    try {
      const result = id ? await service.find(id) : await service.first(date ?? undefined);
      if (!id && !date && result && searchParams.get("after") === result.edition.date) {
        return new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });
      }
      if (!result) return error(404, "Edition not found");
      return Response.json(result, { headers: { "Cache-Control": "no-cache" } });
    } catch (cause) {
      console.error("Could not load edition", cause);
      return error(500, "Could not load edition");
    }
  };
}
