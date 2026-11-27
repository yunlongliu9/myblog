import type { EditionResponse } from "../shared/edition.js";

export async function fetchEdition(id?: string): Promise<EditionResponse> {
  const path = id ? "/news/api/editions/" + encodeURIComponent(id) : "/news/api/editions";
  const response = await fetch(path, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Edition API returned HTTP ${response.status}`);
  return await response.json() as EditionResponse;
}

export async function fetchNewEdition(currentDate: string): Promise<EditionResponse | null> {
  const response = await fetch("/news/api/editions?after=" + encodeURIComponent(currentDate), {
    headers: { Accept: "application/json" }
  });
  if (response.status === 204) return null;
  if (!response.ok) throw new Error(`Edition API returned HTTP ${response.status}`);
  return await response.json() as EditionResponse;
}
