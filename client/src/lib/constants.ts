import { AnalysisCategory } from "@/types";

export const CATEGORIES: AnalysisCategory[] = [
  {
    key: "missingRequirements",
    label: "Missing Requirements",
    description: "Things that are clearly needed but not mentioned",
    icon: "AlertTriangle",
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
  },
  {
    key: "ambiguousParts",
    label: "Ambiguous / Confusing",
    description: "Vague statements open to multiple interpretations",
    icon: "HelpCircle",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/20",
  },
  {
    key: "edgeCases",
    label: "Edge Cases",
    description: "Scenarios that could break the system",
    icon: "Zap",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
  },
  {
    key: "technicalQuestions",
    label: "Technical Questions",
    description: "Technical decisions that must be made",
    icon: "Code",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
  },
  {
    key: "businessLogicQuestions",
    label: "Business Logic",
    description: "Business rules and logic needing clarification",
    icon: "Briefcase",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/20",
  },
];

export const SAMPLE_REQUIREMENT = `Build an e-commerce platform where users can browse products, add them to cart, and checkout. 
The system should have an admin panel for managing products and orders. 
Users should be able to create accounts and track their orders.
The platform should support multiple payment methods.
There should be a search functionality for products.
The admin should be able to view sales reports.`;
