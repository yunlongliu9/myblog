import type { EditionResponse, Level } from "../shared/edition.js";
import { fetchEdition, fetchNewEdition } from "./edition-client.js";
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

function showEdition(edition: EditionResponse) {
  recentlyRead.delete(edition.edition.id);
  recentlyRead.set(edition.edition.id, edition);
  if (recentlyRead.size > 4) {
    const oldest = recentlyRead.keys().next();
    if (!oldest.done) recentlyRead.delete(oldest.value);
  }
  view.renderEdition(edition, level);
  current = edition;
}

let refreshing = false;
async function refreshDailyEdition() {
  if (!current || pending || refreshing || document.hidden) return;
  refreshing = true;
  try {
    const edition = await fetchNewEdition(current.edition.date);
    if (!pending && edition && edition.edition.date > current.edition.date) {
      showEdition(edition);
      view.setLoading(false);
    }
  } catch {
    // Keep the current article available and try again on the next refresh.
  } finally {
    refreshing = false;
  }
}

async function loadEdition(id?: string) {
  if (pending) return;
  pending = true;
  view.setLoading(true);
  let failed = false;
  try {
    const edition = (id ? recentlyRead.get(id) : undefined) ?? await fetchEdition(id);
    showEdition(edition);
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

window.setInterval(() => void refreshDailyEdition(), 20_000);
window.addEventListener("focus", () => void refreshDailyEdition());
