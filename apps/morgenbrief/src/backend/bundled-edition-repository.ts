import type { Edition } from "../shared/edition.js";
import type { EditionRepository } from "./edition-service.js";
import { catalog } from "./editions.js";
import type { DailyEditionFeed } from "./daily-edition-feed.js";

export class BundledEditionRepository implements EditionRepository {
  constructor(private readonly feed?: DailyEditionFeed) {}

  private async editions(): Promise<readonly Edition[]> {
    const published = await this.feed?.released() ?? [];
    const publishedDates = new Set(published.map(edition => edition.date));
    return [...catalog.filter(edition => !publishedDates.has(edition.date)), ...published];
  }

  async latestDate(): Promise<string | null> {
    let latest: string | null = null;
    for (const { date } of await this.editions()) {
      if (latest === null || date > latest) latest = date;
    }
    return latest;
  }

  async findByDate(date: string): Promise<readonly Edition[]> {
    return (await this.editions()).filter(edition => edition.date === date).sort((a, b) => a.id.localeCompare(b.id));
  }

  async findById(id: string): Promise<Edition | null> {
    return (await this.editions()).find(edition => edition.id === id) ?? null;
  }
}
