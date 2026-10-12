import { AnalysisCategory } from "@/types";

export const CATEGORIES: AnalysisCategory[] = [
  {
    key: "missingRequirements",
    label: "Missing requirements",
    shortLabel: "Missing",
    description: "Things the product clearly needs that nobody wrote down.",
    icon: "Puzzle",
    text: "text-cat-missing",
    bg: "bg-cat-missing/10",
    border: "border-cat-missing/25",
    dot: "bg-cat-missing",
  },
  {
    key: "ambiguousParts",
    label: "Ambiguous parts",
    shortLabel: "Ambiguous",
    description: "Statements two people could read in two different ways.",
    icon: "HelpCircle",
    text: "text-cat-ambiguous",
    bg: "bg-cat-ambiguous/10",
    border: "border-cat-ambiguous/25",
    dot: "bg-cat-ambiguous",
  },
  {
    key: "edgeCases",
    label: "Edge cases",
    shortLabel: "Edge cases",
    description: "Unusual situations that could break things in production.",
    icon: "Zap",
    text: "text-cat-edge",
    bg: "bg-cat-edge/10",
    border: "border-cat-edge/25",
    dot: "bg-cat-edge",
  },
  {
    key: "technicalQuestions",
    label: "Technical questions",
    shortLabel: "Technical",
    description: "Architecture and tooling decisions the team still has to make.",
    icon: "Code2",
    text: "text-cat-technical",
    bg: "bg-cat-technical/10",
    border: "border-cat-technical/25",
    dot: "bg-cat-technical",
  },
  {
    key: "businessLogicQuestions",
    label: "Business logic",
    shortLabel: "Business",
    description: "Rules and workflows the business side needs to clarify.",
    icon: "Briefcase",
    text: "text-cat-business",
    bg: "bg-cat-business/10",
    border: "border-cat-business/25",
    dot: "bg-cat-business",
  },
];

export const MIN_LENGTH = 20;

export const SAMPLES: { label: string; text: string }[] = [
  {
    label: "Online store",
    text: `Build an e-commerce platform where users can browse products, add them to cart, and checkout.
The system should have an admin panel for managing products and orders.
Users should be able to create accounts and track their orders.
The platform should support multiple payment methods.
There should be a search functionality for products.
The admin should be able to view sales reports.`,
  },
  {
    label: "Food delivery app",
    text: `A mobile app where customers order food from nearby restaurants.
Customers see restaurants sorted by distance and rating, browse menus, and pay in the app.
Restaurants receive orders on a tablet and mark them as ready.
Riders get assigned to orders and the customer can track the rider live on a map.
Customers can rate the restaurant and rider after delivery.
We take a 15% commission on every order.`,
  },
  {
    label: "Clinic booking",
    text: `Patients can book appointments with doctors at our clinic through a website.
Doctors set their weekly availability, and patients pick a free slot.
Patients get an SMS reminder the day before.
Receptionists can reschedule or cancel appointments on behalf of patients.
Doctors can write notes after each visit that patients can see later.
No-shows should be tracked.`,
  },
];

export const EXPECTED_DURATION_MS = 110_000;
