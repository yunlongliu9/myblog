import type { Edition, EditionResponse } from "../shared/edition.js";

export interface EditionRepository {
  latestDate(): Promise<string | null>;
  findByDate(date: string): Promise<readonly Edition[]>;
  findById(id: string): Promise<Edition | null>;
}

export class EditionService {
  constructor(private readonly editions: EditionRepository) {}

  async first(date?: string): Promise<EditionResponse | null> {
    const requestedDate = date ?? await this.editions.latestDate();
    if (!requestedDate) return null;
    const editions = await this.editions.findByDate(requestedDate);
    return editions.length ? this.withNavigation(editions, 0) : null;
  }

  async find(id: string): Promise<EditionResponse | null> {
    const edition = await this.editions.findById(id);
    if (!edition) return null;
    const editions = await this.editions.findByDate(edition.date);
    const index = editions.findIndex(candidate => candidate.id === id);
    return index >= 0 ? this.withNavigation(editions, index) : null;
  }

  private withNavigation(editions: readonly Edition[], index: number): EditionResponse {
    return {
      edition: editions[index],
      navigation: {
        position: index + 1,
        total: editions.length,
        previousId: editions[index - 1]?.id ?? null,
        nextId: editions[index + 1]?.id ?? null
      }
    };
  }
}
