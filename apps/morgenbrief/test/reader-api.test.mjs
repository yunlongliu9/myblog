import assert from "node:assert/strict";
import { once } from "node:events";
import { test } from "node:test";
import { createMorgenbriefServer } from "../build/backend/node-server.js";

test("Node serves the frontend and both non-overlapping editions through the API", async t => {
  const server = createMorgenbriefServer().listen(0, "127.0.0.1");
  t.after(() => server.close());
  await once(server, "listening");
  const origin = "http://127.0.0.1:" + server.address().port;
  const base = origin + "/news";

  const page = await fetch(base);
  assert.equal((await fetch(base + "/")).status, 200);
  assert.equal((await fetch(origin + "/api/editions")).status, 404);
  assert.equal(page.status, 200);
  const html = await page.text();
  assert.match(html, /type="module" src="\/news\/reader-controller\.js"/);
  const levels = ["A1", "A2", "B1", "B2", "C1"];
  assert.deepEqual([...html.matchAll(/data-level="([^"]+)"/g)].map(([, level]) => level), levels);
  for (const id of ["allEn", "allCn"]) assert.ok(html.includes('id="' + id + '"'));
  for (const file of ["reader-controller.js", "style.css", "berlin.webp"]) {
    const asset = await fetch(base + "/" + file);
    assert.equal(asset.status, 200, file);
    assert.ok((await asset.arrayBuffer()).byteLength > 0, file);
  }
  assert.equal((await fetch(base + "/editions.js")).status, 404);

  const response = await fetch(base + "/api/editions");
  assert.equal(response.status, 200);
  const first = await response.json();
  const unchanged = await fetch(base + "/api/editions?after=" + first.edition.date);
  assert.equal(unchanged.status, 204);
  assert.equal(await unchanged.text(), "");
  const second = await (await fetch(base + "/api/editions/" + first.navigation.nextId)).json();
  assert.equal(first.navigation.previousId, null);
  assert.equal(second.navigation.previousId, first.edition.id);
  assert.equal(second.navigation.nextId, null);
  assert.equal(first.edition.date, second.edition.date);
  assert.deepEqual(await (await fetch(base + "/api/editions?date=" + first.edition.date)).json(), first);

  const sentences = ({ edition }) => edition.sections.flatMap(section => section.sentences);
  const firstSentences = sentences(first);
  const secondSentences = sentences(second);
  assert.equal(firstSentences.length, 20);
  assert.equal(secondSentences.length, 20);
  assert.equal(new Set([...firstSentences, ...secondSentences].map(sentence => sentence.german)).size, 40);
  for (const sentence of [...firstSentences, ...secondSentences]) {
    assert.ok(sentence.translations.EN && sentence.translations.CN);
    for (const level of levels) {
      assert.ok(sentence.annotations[level].highlight);
      assert.ok(sentence.german.includes(sentence.annotations[level].highlight));
    }
  }
  assert.equal(first.edition.study.length, 4);
  for (const { edition } of [first, second]) {
    for (const { entries } of edition.study) {
      for (const level of levels) assert.ok(entries[level].length, level);
      assert.equal(new Set(levels.map(level => JSON.stringify(entries[level]))).size, levels.length);
    }
  }

  assert.equal((await fetch(base + "/api/editions/missing")).status, 404);
  assert.equal((await fetch(base + "/api/editions?date=2026-02-31")).status, 400);
  assert.equal((await fetch(base + "/api/editions?date=2026-01-01")).status, 404);
  const post = await fetch(base + "/api/editions", { method: "POST" });
  assert.equal(post.status, 405);
  assert.equal(post.headers.get("Allow"), "GET");
});
