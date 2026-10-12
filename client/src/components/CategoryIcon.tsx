import { Puzzle, HelpCircle, Zap, Code2, Briefcase } from "lucide-react";
import { AnalysisCategory } from "@/types";

const icons = { Puzzle, HelpCircle, Zap, Code2, Briefcase };

export default function CategoryIcon({
  category,
  size = "md",
}: {
  category: AnalysisCategory;
  size?: "sm" | "md";
}) {
  const Icon = icons[category.icon];
  const box = size === "sm" ? "h-8 w-8 rounded-lg" : "h-10 w-10 rounded-xl";
  const icon = size === "sm" ? "h-4 w-4" : "h-[18px] w-[18px]";
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center border ${box} ${category.bg} ${category.border}`}
    >
      <Icon className={`${icon} ${category.text}`} />
    </span>
  );
}
