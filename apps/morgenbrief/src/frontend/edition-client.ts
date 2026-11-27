import type { EditionResponse } from "../shared/edition.js";

export async function fetchEdition(id?: string): Promise<EditionResponse> {
  const path = id ? "/news/api/editions/" + encodeURIComponent(id) : "/news/api/editions";
  const response = await fetch(path, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Edition API returned HTTP ${response.status}`);
  return await response.json() as EditionResponse;
}
