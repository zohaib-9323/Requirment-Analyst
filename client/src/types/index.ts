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

export interface AnalysisCategory {
  key: keyof AnalysisResult;
  label: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}
