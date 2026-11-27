import type { Level } from "../shared/edition.js";

export const levelHelp = {
  A1: "认读常见单词，配有简短的中文释义。",
  A2: "标注日常短语、时间与地点表达，并附中文释义。",
  B1: "提示新闻常见搭配和句子结构，帮你读懂长句。",
  B2: "标出核心词汇，部分句子附有中文理解提示。",
  C1: "标出固定搭配和从句，部分句子附有进阶句法解析。"
} satisfies Record<Level, string>;

export function isReadingLevel(value: unknown): value is Level {
  return typeof value === "string" && Object.hasOwn(levelHelp, value);
}
