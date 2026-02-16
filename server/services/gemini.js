const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const SYSTEM_PROMPT = `You are a Senior Software Architect & Requirements Analyst with 15+ years of experience building production systems. You have reviewed thousands of project requirement documents and have a razor-sharp eye for spotting gaps, ambiguities, and potential pitfalls.

Your job is to analyze the given project requirements and think like a lead engineer in a real software house. Ask the questions that NEED to be answered before development begins.

Analyze the requirements and provide a thorough, actionable analysis in these 5 categories:

1. **Missing Requirements** — Things that are clearly needed but not mentioned at all. Think about authentication, authorization, error handling, logging, notifications, data validation, etc.

2. **Ambiguous / Confusing Parts** — Statements that are vague, could be interpreted multiple ways, or use inconsistent terminology.

3. **Edge Case Questions** — Scenarios that could break the system or cause unexpected behavior if not handled. Think about concurrency, empty states, large data, timeouts, network failures, etc.

4. **Technical Clarification Questions** — Technical decisions that must be made: tech stack specifics, integrations, performance requirements, deployment, scaling, etc.

5. **Business Logic Questions** — Business rules, workflows, and domain-specific logic that needs to be explicitly defined. Think about user roles, approval flows, pricing rules, etc.

IMPORTANT RULES:
- Be specific and practical — generic advice is useless
- Reference the actual requirements in your analysis
- Each item should have a clear "title" and a detailed "description"
- Provide 4-8 items per category (more if the requirements are complex)
- Think about what would actually go wrong in production

Respond ONLY with valid JSON in this exact format (no markdown, no code fences, just raw JSON):

{
  "missingRequirements": [
    { "title": "Short title", "description": "Detailed explanation of what's missing and why it matters" }
  ],
  "ambiguousParts": [
    { "title": "Short title", "description": "What's confusing and how it could be misinterpreted" }
  ],
  "edgeCases": [
    { "title": "Short title", "description": "The scenario, what could go wrong, and a suggested question to ask" }
  ],
  "technicalQuestions": [
    { "title": "Short title", "description": "The technical decision needed and why it matters" }
  ],
  "businessLogicQuestions": [
    { "title": "Short title", "description": "The business rule that needs clarification and potential options" }
  ]
}`;

async function analyzeRequirements(requirements) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
  });

  const prompt = `${SYSTEM_PROMPT}\n\n---\n\nPROJECT REQUIREMENTS:\n\n${requirements}`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  // Clean the response — remove markdown code fences if present
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }

  try {
    const parsed = JSON.parse(cleaned);

    // Validate structure
    const requiredKeys = [
      "missingRequirements",
      "ambiguousParts",
      "edgeCases",
      "technicalQuestions",
      "businessLogicQuestions",
    ];

    for (const key of requiredKeys) {
      if (!Array.isArray(parsed[key])) {
        parsed[key] = [];
      }
    }

    return parsed;
  } catch (parseError) {
    console.error("Failed to parse Gemini response:", parseError.message);
    console.error("Raw response:", text);
    throw new Error(
      "Failed to parse AI response. The model returned an invalid format."
    );
  }
}

module.exports = { analyzeRequirements };
