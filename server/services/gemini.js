const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

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
- Provide 3-5 items per category (fewer if requirements are short). If the response would be too long, reduce the number of items to ensure the JSON is complete.
- Keep descriptions concise (max ~3 sentences each)
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

function getEnvOrThrow(name) {
  const val = process.env[name];
  if (!val) throw new Error(`${name} is not set in the server environment.`);
  return val;
}

function cleanModelText(text) {
  let cleaned = String(text || "").trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }
  return cleaned.trim();
}

function normalizeAnalysisShape(parsed) {
  const requiredKeys = [
    "missingRequirements",
    "ambiguousParts",
    "edgeCases",
    "technicalQuestions",
    "businessLogicQuestions",
  ];

  for (const key of requiredKeys) {
    if (!Array.isArray(parsed[key])) parsed[key] = [];
  }

  return parsed;
}

function parseAnalysisJson(rawText) {
  const cleaned = cleanModelText(rawText);
  const parsed = JSON.parse(cleaned);
  return normalizeAnalysisShape(parsed);
}

async function callOpenRouter({
  model,
  apiKey,
  messages,
  reasoningEnabled,
  timeoutMs = 25000,
}) {
  if (typeof fetch !== "function") {
    throw new Error(
      "Global fetch is not available. Use Node.js 18+ (or add a fetch polyfill)."
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  // Optional OpenRouter metadata headers (helpful for dashboards/limits)
  if (process.env.OPENROUTER_HTTP_REFERER) {
    headers["HTTP-Referer"] = process.env.OPENROUTER_HTTP_REFERER;
  }
  if (process.env.OPENROUTER_APP_TITLE) {
    headers["X-Title"] = process.env.OPENROUTER_APP_TITLE;
  }

  const body = {
    model,
    messages,
    temperature: 0.7,
    max_tokens: 2500,
  };

  // OpenRouter reasoning support varies by model/provider
  if (reasoningEnabled) {
    body.reasoning = { enabled: true };
  }

  let res;
  try {
    res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (e) {
    if (e?.name === "AbortError") {
      throw new Error(
        `OpenRouter request timed out after ${Math.round(timeoutMs / 1000)}s`
      );
    }
    throw e;
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const clipped = text && text.length > 1500 ? `${text.slice(0, 1500)}…` : text;
    throw new Error(
      `OpenRouter request failed (${res.status} ${res.statusText})${
        clipped ? `: ${clipped}` : ""
      }`
    );
  }

  const json = await res.json();
  const msg = json?.choices?.[0]?.message;
  let content = msg?.content ?? "";
  // OpenRouter/provider reasoning fields vary by model
  const reasoning_details = msg?.reasoning_details ?? msg?.reasoning;
  const finish_reason = json?.choices?.[0]?.finish_reason ?? null;

  // Some providers return multi-part content arrays
  if (Array.isArray(content)) {
    content = content
      .map((part) => {
        if (!part) return "";
        if (typeof part === "string") return part;
        if (part.type === "text" && typeof part.text === "string") return part.text;
        return "";
      })
      .join("");
  }

  if (typeof content !== "string") content = "";
  content = content.trim();

  // Some models may return reasoning without final content on the first pass.
  // In that case, we'll allow empty content and let the caller do a follow-up call.
  if (!content && !reasoning_details) {
    const debug = JSON.stringify(
      {
        error: json?.error,
        choices0: json?.choices?.[0],
      },
      null,
      2
    );
    const clipped = debug.length > 1500 ? `${debug.slice(0, 1500)}…` : debug;
    throw new Error(
      `OpenRouter returned an empty assistant message. Debug: ${clipped}`
    );
  }

  return { content, reasoning_details, finish_reason };
}

async function analyzeRequirements(requirements) {
  try {
    const apiKey = getEnvOrThrow("OPENROUTER_API_KEY");
    const model = process.env.OPENROUTER_MODEL || "stepfun/step-3.5-flash:free";
    const timeoutMs = Number(process.env.OPENROUTER_TIMEOUT_MS || 25000);
    const reasoningEnabled =
      String(process.env.OPENROUTER_REASONING_ENABLED || "").toLowerCase() ===
      "true";

    const baseMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `PROJECT REQUIREMENTS:\n\n${requirements}`,
      },
    ];

    // First call (optionally with reasoning enabled)
    const startedAt = Date.now();
    const first = await callOpenRouter({
      model,
      apiKey,
      messages: baseMessages,
      reasoningEnabled,
      timeoutMs,
    });

    // If the model returned reasoning but no final content (or it truncated), do a follow-up call
    if (!first.content || first.finish_reason === "length") {
      const messages = [
        ...baseMessages,
        {
          role: "assistant",
          content: first.content || "",
          ...(first.reasoning_details
            ? { reasoning_details: first.reasoning_details }
            : {}),
        },
        {
          role: "user",
          content:
            "Now output ONLY the final answer as valid JSON in the exact schema (no markdown, no code fences). Keep it short: max 3 items per category.",
        },
      ];

      const second = await callOpenRouter({
        model,
        apiKey,
        messages,
        reasoningEnabled: false,
        timeoutMs,
      });

      try {
        const parsed = parseAnalysisJson(second.content);
        console.log(
          `✅ OpenRouter analysis succeeded (follow-up) in ${Date.now() - startedAt}ms (${model})`
        );
        return parsed;
      } catch (e) {
        // Last resort: ask for minimal valid JSON to avoid truncation
        const third = await callOpenRouter({
          model,
          apiKey,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content:
                `Return ONLY valid JSON in the required schema for these requirements. ` +
                `If needed, return 1-2 items per category to keep the JSON complete.\n\nREQUIREMENTS:\n${requirements}`,
            },
          ],
          reasoningEnabled: false,
          timeoutMs,
        });
        const parsed = parseAnalysisJson(third.content);
        console.log(
          `✅ OpenRouter analysis succeeded (3rd try) in ${Date.now() - startedAt}ms (${model})`
        );
        return parsed;
      }
    }

    // Parse attempt #1
    try {
      const parsed = parseAnalysisJson(first.content);
      console.log(
        `✅ OpenRouter analysis succeeded in ${Date.now() - startedAt}ms (${model})`
      );
      return parsed;
    } catch (parseError) {
      // If model output wasn't valid JSON, do a second call preserving reasoning_details
      const messages = [
        ...baseMessages,
        {
          role: "assistant",
          content: first.content,
          ...(first.reasoning_details
            ? { reasoning_details: first.reasoning_details }
            : {}),
        },
        {
          role: "user",
          content:
            "Respond ONLY with valid JSON in the exact schema (no markdown, no code fences). Keep it short: max 3 items per category.",
        },
      ];

      const second = await callOpenRouter({
        model,
        apiKey,
        messages,
        reasoningEnabled: false,
        timeoutMs,
      });

      const parsed = parseAnalysisJson(second.content);
      console.log(
        `✅ OpenRouter analysis succeeded (2-pass) in ${Date.now() - startedAt}ms (${model})`
      );
      return parsed;
    }
  } catch (error) {
    console.error("Failed to analyze requirements via OpenRouter:", error);
    throw new Error(
      error?.message ||
        "Failed to analyze requirements. Check your OpenRouter configuration."
    );
  }
}

module.exports = { analyzeRequirements };
