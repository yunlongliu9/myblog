import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { createHttpApp } from "./http-app.js";

const handleRequest = createHttpApp(async file => {
  const bytes = await readFile(new URL("../frontend/" + file, import.meta.url));
  return new Uint8Array(bytes);
});

export function createMorgenbriefServer() {
  return createServer(async (request, response) => {
    try {
      const url = new URL(request.url ?? "/", "http://localhost");
      if (url.pathname !== "/news" && !url.pathname.startsWith("/news/")) {
        response.writeHead(404).end("Not found");
        return;
      }

      url.pathname = url.pathname.slice("/news".length) || "/";
      const result = await handleRequest(request.method ?? "GET", url);
      const body = result.body ? Buffer.from(await result.arrayBuffer()) : undefined;
      response.writeHead(result.status, Object.fromEntries(result.headers));
      response.end(body);
    } catch (cause) {
      console.error("HTTP request failed", cause);
      if (!response.headersSent) response.writeHead(500);
      response.end("Internal server error");
    }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.PORT ?? 3000);
  createMorgenbriefServer().listen(port, process.env.HOST ?? "127.0.0.1", () => {
    console.log(`Morgenbrief listening on port ${port}`);
  });
}
