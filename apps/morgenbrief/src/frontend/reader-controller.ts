import type { EditionResponse, Level } from "../shared/edition.js";
import { fetchEdition } from "./edition-client.js";
import { ReaderView } from "./reader-view.js";
import { isReadingLevel } from "./reading-levels.js";

const levelKey = "morgenbrief-level";
const view = new ReaderView();
let level: Level = "B2";
try {
  const savedLevel = localStorage.getItem(levelKey);
  if (isReadingLevel(savedLevel)) level = savedLevel;
} catch {
  // Reading mode still works without browser storage.
}

let current: EditionResponse | undefined;
let pending = false;
let failedId: string | undefined;
const recentlyRead = new Map<string, EditionResponse>();

async function loadEdition(id?: string) {
  if (pending) return;
  pending = true;
  view.setLoading(true);
  let failed = false;
  try {
    const edition = (id ? recentlyRead.get(id) : undefined) ?? await fetchEdition(id);
    recentlyRead.delete(edition.edition.id);
    recentlyRead.set(edition.edition.id, edition);
    if (recentlyRead.size > 4) {
      const oldest = recentlyRead.keys().next();
      if (!oldest.done) recentlyRead.delete(oldest.value);
    }
    view.renderEdition(edition, level);
    current = edition;
    if (id) view.focusEdition();
  } catch {
    failed = true;
    failedId = id;
  } finally {
    pending = false;
    view.setLoading(false);
    if (failed) view.showError();
  }
}

view.bind({
  levelChanged(selected) {
    if (level === selected) return;
    level = selected;
    try {
      localStorage.setItem(levelKey, level);
    } catch {
      // A storage failure should not interrupt the current view.
    }
    view.renderLevel(level);
  },
  next() {
    const id = current?.navigation.nextId;
    if (id) void loadEdition(id);
  },
  previous() {
    const id = current?.navigation.previousId;
    if (id) void loadEdition(id);
  },
  retry() {
    void loadEdition(failedId);
  }
});
view.renderLevel(level);
void loadEdition();
