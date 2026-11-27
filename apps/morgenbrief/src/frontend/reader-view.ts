import type { Annotation, EditionResponse, Level, Sentence, TranslationLanguage } from "../shared/edition.js";
import { isReadingLevel, levelHelp } from "./reading-levels.js";

function required<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing reader element: ${id}`);
  return node as T;
}

function element<K extends keyof HTMLElementTagNameMap>(tag: K, value = "", className = "") {
  const node = document.createElement(tag);
  node.textContent = value;
  node.className = className;
  return node;
}

function annotate(target: HTMLElement, german: string, { highlight, kind, note }: Annotation) {
  const start = highlight ? german.indexOf(highlight) : -1;
  if (start < 0) {
    target.textContent = german;
    return;
  }
  const marked = element("span", highlight, kind === "clause" ? "clause" : "marked");
  if (note) marked.title = note;
  target.replaceChildren(german.slice(0, start), marked, german.slice(start + highlight.length));
}

const dateFormat = new Intl.DateTimeFormat("zh-CN", { dateStyle: "full", timeZone: "Europe/Berlin" });
const languages = {
  EN: { lang: "en", label: "英语" },
  CN: { lang: "zh-CN", label: "中文" }
} satisfies Record<TranslationLanguage, { lang: string; label: string }>;

type SentenceView = { sentence: Sentence; german: HTMLElement; note: HTMLElement };

type TranslationView = { button: HTMLButtonElement; text: HTMLParagraphElement };
const translationLanguages = ["EN", "CN"] as const;

export class ReaderView {
  private readonly levels = [...document.querySelectorAll<HTMLButtonElement>("[data-level]")];
  private readonly body = required("body");
  private readonly next = required<HTMLButtonElement>("next");
  private readonly nextEnd = required<HTMLButtonElement>("nextEnd");
  private readonly previous = required<HTMLButtonElement>("previous");
  private readonly status = required("editionStatus");
  private readonly feedback = required("readerFeedback");
  private readonly feedbackText = required("readerFeedbackText");
  private readonly retry = required<HTMLButtonElement>("readerRetry");
  private readonly title = required("title");
  private readonly progress = required<HTMLProgressElement>("progress");
  private readonly percent = required("percent");
  private readonly translationControls = {
    EN: required<HTMLButtonElement>("allEn"),
    CN: required<HTMLButtonElement>("allCn")
  };
  private readonly translationDefaults = { EN: false, CN: false };
  private readonly translationExceptions = { EN: new Set<string>(), CN: new Set<string>() };
  private readonly translationRows: Record<TranslationLanguage, TranslationView[]> = { EN: [], CN: [] };
  private progressFrame: number | undefined;
  private sentences: SentenceView[] = [];
  private data?: EditionResponse;

  bind(actions: {
    levelChanged: (level: Level) => void;
    next: () => void;
    previous: () => void;
    retry: () => void;
  }) {
    for (const button of this.levels) {
      button.addEventListener("click", () => {
        const level = button.dataset.level;
        if (isReadingLevel(level)) actions.levelChanged(level);
      });
    }
    this.next.addEventListener("click", actions.next);
    this.nextEnd.addEventListener("click", actions.next);
    this.previous.addEventListener("click", actions.previous);
    this.retry.addEventListener("click", actions.retry);
    for (const language of translationLanguages) {
      this.translationControls[language].addEventListener("click", () => this.toggleAllTranslations(language));
    }
    window.addEventListener("scroll", () => this.scheduleProgress(), { passive: true });
    window.addEventListener("resize", () => this.scheduleProgress());
  }

  setLoading(loading: boolean) {
    this.body.setAttribute("aria-busy", String(loading));
    this.updateNavigation(loading);
    if (loading) {
      this.feedback.hidden = false;
      this.feedbackText.textContent = "正在读取简报…";
      this.retry.hidden = true;
    } else {
      this.feedback.hidden = true;
    }
  }

  showError() {
    this.feedback.hidden = false;
    this.feedbackText.textContent = "简报加载失败，请重试。";
    this.retry.hidden = false;
  }

  renderEdition(data: EditionResponse, level: Level) {
    this.data = data;
    this.sentences = [];
    for (const language of translationLanguages) this.translationRows[language] = [];
    const { edition } = data;
    this.title.textContent = edition.title;
    required("subtitle").textContent = edition.subtitle;
    required("issue").textContent = "TAGESBRIEFING / 每日新闻";
    const date = dateFormat.format(new Date(edition.date + "T12:00:00Z"));
    const count = edition.sections.reduce((total, section) => total + section.sentences.length, 0);
    required("metadata").replaceChildren(
      element("span", date), element("span", "·"), element("span", "约 5 分钟"), element("b", `约 ${count} 条新闻`)
    );

    const contents = required("contents");
    const chapters = document.createDocumentFragment();
    const links = document.createDocumentFragment();
    edition.sections.forEach((section, sectionIndex) => {
      const chapter = element("section", "", "chapter");
      chapter.id = "chapter-" + sectionIndex;
      const title = element("h3");
      const germanTitle = element("strong", section.title);
      germanTitle.lang = "de";
      title.append(germanTitle, element("span", section.titleZh));
      chapter.append(title);

      const link = element("a", section.titleZh);
      link.href = "#" + chapter.id;
      links.append(link);
      section.sentences.forEach((sentence, sentenceIndex) => {
        const id = `edition-${edition.id}-${sectionIndex}-${sentenceIndex}`;
        chapter.append(this.renderSentence(sentence, id, sentenceIndex));
      });
      chapters.append(chapter);
    });
    this.body.replaceChildren(chapters);
    contents.replaceChildren(links);
    for (const language of translationLanguages) this.updateTranslationControl(language);
    required("sources").replaceChildren(...edition.sources.map(({ name, url }) => {
      const item = element("li");
      const link = element("a", name);
      link.href = url;
      item.append(link);
      return item;
    }));
    this.renderLevel(level);
  }

  renderLevel(level: Level) {
    this.levels.forEach(button => button.setAttribute("aria-pressed", String(button.dataset.level === level)));
    required("levelHelp").textContent = levelHelp[level];
    for (const { sentence, german, note } of this.sentences) {
      const annotation = sentence.annotations[level];
      annotate(german, sentence.german, annotation);
      note.textContent = annotation.note;
      note.hidden = !annotation.note;
    }
    if (!this.data) return;
    required("studyLevel").textContent = level;
    required("studyGrid").replaceChildren(...this.data.edition.study.map(({ title, entries }) => {
      const panel = element("section", "", "panel");
      const list = element("dl");
      for (const { term, explanation } of entries[level]) {
        const name = element("dt", term);
        name.lang = "de";
        list.append(name, element("dd", explanation));
      }
      panel.append(element("h3", title), list);
      return panel;
    }));
    this.scheduleProgress();
  }

  focusEdition() {
    window.scrollTo({ top: 0, behavior: "instant" });
    history.replaceState(null, "", location.pathname + location.search);
    this.title.tabIndex = -1;
    this.title.focus({ preventScroll: true });
  }

  private renderSentence(sentence: Sentence, id: string, index: number) {
    const block = element("div");
    const line = element("p", "", "sentence");
    const german = element("span");
    german.lang = "de";
    const toggles = element("span", "", "toggles");
    const note = element("p", "", "sentence-note");
    line.append(german, toggles);
    block.append(line);

    for (const code of translationLanguages) {
      const { lang, label } = languages[code];
      const button = element("button", code, "toggle");
      const translation = element("p", "", "translation");
      translation.id = id + "-" + code;
      translation.lang = lang;
      translation.append(element("b", code), sentence.translations[code]);
      button.setAttribute("aria-label", `${label}翻译，第 ${index + 1} 句`);
      button.setAttribute("aria-controls", translation.id);
      const row = { button, text: translation };
      const exceptions = this.translationExceptions[code];
      this.setTranslation(row, this.translationDefaults[code] !== exceptions.has(translation.id));
      this.translationRows[code].push(row);
      button.addEventListener("click", () => {
        if (!exceptions.delete(translation.id)) exceptions.add(translation.id);
        this.setTranslation(row, translation.hidden);
        this.updateTranslationControl(code);
        this.scheduleProgress();
      });
      toggles.append(button);
      block.append(translation);
    }

    block.append(note);
    this.sentences.push({ sentence, german, note });
    return block;
  }

  private updateNavigation(loading: boolean) {
    const navigation = this.data?.navigation;
    this.next.disabled = loading || !navigation?.nextId;
    this.nextEnd.disabled = this.next.disabled;
    this.nextEnd.hidden = !navigation?.nextId;
    this.previous.disabled = loading;
    this.previous.hidden = !navigation?.previousId;
    this.status.textContent = navigation
      ? `第 ${navigation.position} 篇，共 ${navigation.total} 篇。${navigation.nextId ? "" : "本日简报已读至最后一篇。"}`
      : "";
  }

  private setTranslation({ button, text }: TranslationView, visible: boolean) {
    text.hidden = !visible;
    button.setAttribute("aria-expanded", String(visible));
  }

  private toggleAllTranslations(language: TranslationLanguage) {
    const rows = this.translationRows[language];
    if (!rows.length) return;
    const visible = rows.some(row => row.text.hidden);
    this.translationDefaults[language] = visible;
    this.translationExceptions[language].clear();
    for (const row of rows) {
      if (row.text.hidden === visible) this.setTranslation(row, visible);
    }
    this.updateTranslationControl(language);
    this.scheduleProgress();
  }

  private updateTranslationControl(language: TranslationLanguage) {
    const rows = this.translationRows[language];
    const button = this.translationControls[language];
    button.disabled = rows.length === 0;
    const visibleCount = rows.filter(row => !row.text.hidden).length;
    const pressed = visibleCount === 0 ? "false" : visibleCount === rows.length ? "true" : "mixed";
    button.setAttribute("aria-pressed", pressed);
  }

  private scheduleProgress() {
    if (this.progressFrame !== undefined) return;
    this.progressFrame = requestAnimationFrame(() => {
      this.progressFrame = undefined;
      const { top, height } = this.body.getBoundingClientRect();
      const percent = Math.round(Math.min(1, Math.max(0, -top / Math.max(1, height - innerHeight))) * 100);
      if (this.progress.value === percent) return;
      this.progress.value = percent;
      this.percent.textContent = percent + "%";
    });
  }
}
