import type { Edition } from "../shared/edition.js";

const levels = ["A1", "A2", "B1", "B2", "C1"] as const;
const limit = 512 * 1024;
const dailyPublication = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Europe/Berlin",
  year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23"
});

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown): value is string {
  return typeof value === "string" && Boolean(value.trim());
}

function validDate(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    new Date(value).toJSON()?.slice(0, 10) === value;
}

function isEdition(value: unknown): value is Edition {
  if (!object(value) || !validDate(value.date) ||
    (value.id !== value.date + "-1" && value.id !== value.date + "-2") ||
    !text(value.title) || !text(value.subtitle) || !Array.isArray(value.sections) ||
    !Array.isArray(value.study) || value.study.length !== 4 ||
    !Array.isArray(value.sources) || value.sources.length < 2) return false;

  const sections = value.sections.every(section => object(section) && text(section.title) &&
    text(section.titleZh) && Array.isArray(section.sentences) && section.sentences.length &&
    section.sentences.every(sentence => {
      if (!object(sentence) || !text(sentence.german) || !object(sentence.translations) ||
        !text(sentence.translations.EN) || !text(sentence.translations.CN) || !object(sentence.annotations)) return false;
      const { german, annotations } = sentence;
      return levels.every(level => {
        const annotation = annotations[level];
        return object(annotation) && text(annotation.highlight) && german.includes(annotation.highlight) &&
          (annotation.kind === "vocabulary" || annotation.kind === "collocation" || annotation.kind === "clause") &&
          typeof annotation.note === "string";
      });
    }));
  const study = value.study.every(category => {
    if (!object(category) || !text(category.title) || !object(category.entries)) return false;
    const { entries } = category;
    return levels.every(level => {
      const items = entries[level];
      return Array.isArray(items) && items.length > 0 &&
        items.every(item => object(item) && text(item.term) && text(item.explanation));
    });
  });
  return sections && study && value.sources.every(source => {
    if (!object(source) || !text(source.name) || !text(source.url)) return false;
    try { return new URL(source.url).protocol === "https:"; } catch { return false; }
  });
}

export function parseDailyFeed(value: unknown): readonly Edition[] {
  if (!Array.isArray(value) || !value.length || value.length > 4 || !value.every(isEdition)) {
    throw new Error("Invalid daily edition feed");
  }
  const ids = new Set(value.map(edition => edition.id));
  if (ids.size !== value.length || [...ids].some(id => !ids.has(id.slice(0, -1) + (id.endsWith("1") ? "2" : "1")))) {
    throw new Error("A publication date must contain exactly two editions");
  }
  for (const date of new Set(value.map(edition => edition.date))) {
    const issues = value.filter(edition => edition.date === date);
    const originals = new Set<string>();
    for (const issue of issues) {
      const sentences = issue.sections.flatMap(section => section.sentences);
      if (sentences.length < 18 || sentences.length > 22) throw new Error("Unexpected edition size");
      for (const { german } of sentences) {
        const key = german.trim().toLowerCase();
        if (originals.has(key)) throw new Error("Repeated German sentence");
        originals.add(key);
      }
    }
  }
  return value;
}

export function isReleased(date: string, instant: Date): boolean {
  const [today, hour] = dailyPublication.format(instant).split(" ");
  return date < today || (date === today && Number(hour) >= 18);
}

export class DailyEditionFeed {
  private editions: readonly Edition[] = [];
  private checkAfter = 0;
  private pending?: Promise<void>;

  constructor(
    private readonly url: string,
    private readonly now = () => new Date(),
    private readonly request = fetch
  ) {}

  async released(): Promise<readonly Edition[]> {
    if (this.now().getTime() >= this.checkAfter) {
      this.pending ??= this.refresh().finally(() => {
        this.checkAfter = this.now().getTime() + 30_000;
        this.pending = undefined;
      });
      // Serve the last good edition without waiting on a periodic network refresh.
      if (!this.editions.length) await this.pending;
    }
    return this.editions.filter(edition => isReleased(edition.date, this.now()));
  }

  private async refresh() {
    try {
      const response = await this.request(this.url, { signal: AbortSignal.timeout(4000) });
      if (!response.ok || !response.body) throw new Error("Feed HTTP " + response.status);
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let bytes = 0;
      let json = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > limit) {
          await reader.cancel();
          throw new Error("Daily edition feed exceeds its size limit");
        }
        json += decoder.decode(value, { stream: true });
      }
      const next = parseDailyFeed(JSON.parse(json + decoder.decode()));
      const latest = (editions: readonly Edition[]) => editions.map(edition => edition.date).sort().at(-1) ?? "";
      if (latest(next) >= latest(this.editions)) this.editions = next;
    } catch (error) {
      console.warn("Daily edition feed refresh failed:", error instanceof Error ? error.message : "Unknown error");
    }
  }
}
