import type { Edition } from "../shared/edition.js";
import type { EditionRepository } from "./edition-service.js";
import { catalog } from "./editions.js";

export class BundledEditionRepository implements EditionRepository {
  private readonly editions: readonly Edition[] = catalog;

  async latestDate(): Promise<string | null> {
    let latest: string | null = null;
    for (const { date } of this.editions) {
      if (latest === null || date > latest) latest = date;
    }
    return latest;
  }

  async findByDate(date: string): Promise<readonly Edition[]> {
    return this.editions.filter(edition => edition.date === date);
  }

  async findById(id: string): Promise<Edition | null> {
    return this.editions.find(edition => edition.id === id) ?? null;
  }
}
