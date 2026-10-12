import { AnalysisResult } from "@/types";
import { CATEGORIES } from "./constants";

/** Stable id for a finding, used to track which ones are addressed. */
export const findingId = (categoryKey: string, index: number) =>
  `${categoryKey}:${index}`;

export function countFindings(result: AnalysisResult) {
  return CATEGORIES.reduce((sum, c) => sum + (result[c.key]?.length || 0), 0);
}

export function buildMarkdown(
  result: AnalysisResult,
  requirements: string,
  addressed: Set<string>
) {
  const date = new Date().toLocaleString("en-US", {
    dateStyle: "long",
    timeStyle: "short",
  });
  let md = `# Requirements Analysis\n\n_Generated ${date} · ${countFindings(result)} findings_\n\n`;
  md += `## Original requirements\n\n${requirements
    .split("\n")
    .map((l) => `> ${l}`)
    .join("\n")}\n\n---\n\n`;

  CATEGORIES.forEach((cat) => {
    const items = result[cat.key] || [];
    if (!items.length) return;
    md += `## ${cat.label} (${items.length})\n\n_${cat.description}_\n\n`;
    items.forEach((item, i) => {
      const done = addressed.has(findingId(cat.key, i)) ? "x" : " ";
      md += `- [${done}] **${item.title}**  \n  ${item.description}\n`;
    });
    md += "\n";
  });
  return md;
}

export function buildPlainText(result: AnalysisResult) {
  let text = "";
  CATEGORIES.forEach((cat) => {
    const items = result[cat.key] || [];
    if (!items.length) return;
    text += `${cat.label.toUpperCase()} (${items.length})\n\n`;
    items.forEach((item, i) => {
      text += `${i + 1}. ${item.title}\n   ${item.description}\n\n`;
    });
  });
  return text.trim();
}

export function downloadFile(content: string, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
