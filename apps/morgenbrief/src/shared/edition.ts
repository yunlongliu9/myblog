export type Level = "A1" | "A2" | "B1" | "B2" | "C1";
export type TranslationLanguage = "EN" | "CN";

export interface Annotation {
  readonly highlight: string;
  readonly kind: "vocabulary" | "collocation" | "clause";
  readonly note: string;
}

export interface Sentence {
  readonly german: string;
  readonly translations: Readonly<Record<TranslationLanguage, string>>;
  readonly annotations: Readonly<Record<Level, Annotation>>;
}

export interface Section {
  readonly title: string;
  readonly titleZh: string;
  readonly sentences: readonly Sentence[];
}

export interface StudyEntry {
  readonly term: string;
  readonly explanation: string;
}

export interface Edition {
  readonly id: string;
  readonly date: string;
  readonly title: string;
  readonly subtitle: string;
  readonly sections: readonly Section[];
  readonly study: readonly {
    title: string;
    entries: Readonly<Record<Level, readonly StudyEntry[]>>;
  }[];
  readonly sources: readonly { name: string; url: string }[];
}

export interface EditionResponse {
  readonly edition: Edition;
  readonly navigation: {
    position: number;
    total: number;
    previousId: string | null;
    nextId: string | null;
  };
}
