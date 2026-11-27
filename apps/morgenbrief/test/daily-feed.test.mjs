import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { DailyEditionFeed, isReleased, parseDailyFeed } from "../build/backend/daily-edition-feed.js";

const seed = JSON.parse(readFileSync(new URL("../../../content/morgenbrief/latest.json", import.meta.url), "utf8"));
const originalDate = seed[0].date;
const sample = seed.filter(edition => edition.date === originalDate);

test("18:00 publication follows Berlin time through daylight-saving changes", () => {
  assert.equal(isReleased("2026-11-28", new Date("2026-11-28T16:59:59Z")), false);
  assert.equal(isReleased("2026-11-28", new Date("2026-11-28T17:00:00Z")), true);
  assert.equal(isReleased("2027-07-01", new Date("2027-07-01T15:59:59Z")), false);
  assert.equal(isReleased("2027-07-01", new Date("2027-07-01T16:00:00Z")), true);
});

test("feed shows both complete editions at 18:00 and retains them if a later refresh fails", async () => {
  const data = sample.map((edition, index) => ({ ...edition, id: "2026-11-28-" + (index + 1), date: "2026-11-28" }));
  let now = new Date("2026-11-28T16:59:50Z");
  let requests = 0;
  const feed = new DailyEditionFeed("https://example.test/feed", () => now, async () => {
    requests += 1;
    return requests === 1 ? Response.json(data) : Response.json({ malformed: true });
  });
  assert.deepEqual(await feed.released(), []);
  now = new Date("2026-11-28T17:00:00Z");
  assert.deepEqual(await feed.released(), data);
  assert.equal(requests, 1);
  now = new Date("2026-11-28T17:01:00Z");
  assert.deepEqual(await feed.released(), data);
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(await feed.released(), data);
  assert.equal(requests, 2);
});

test("feed rejects incomplete days and invalid translations", () => {
  assert.throws(() => parseDailyFeed([sample[0]]));
  const data = structuredClone(sample);
  delete data[0].sections[0].sentences[0].annotations.A1;
  assert.throws(() => parseDailyFeed(data));
});
