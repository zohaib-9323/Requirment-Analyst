export interface AnalysisItem {
  title: string;
  description: string;
}

export interface AnalysisResult {
  missingRequirements: AnalysisItem[];
  ambiguousParts: AnalysisItem[];
  edgeCases: AnalysisItem[];
  technicalQuestions: AnalysisItem[];
  businessLogicQuestions: AnalysisItem[];
}

export type CategoryKey = keyof AnalysisResult;

export interface AnalysisCategory {
  key: CategoryKey;
  label: string;
  shortLabel: string;
  description: string;
  icon: "Puzzle" | "HelpCircle" | "Zap" | "Code2" | "Briefcase";
  /** Full Tailwind class strings so the JIT compiler can see them. */
  text: string;
  bg: string;
  border: string;
  dot: string;
}
