// @ts-check
/**
 * AI PR Review Script
 * Uses OpenRouter SDK with nvidia/nemotron-3-ultra-550b-a55b:free model
 * to review pull request diffs and post structured feedback as PR comments.
 */

import { OpenRouter } from "@openrouter/sdk";
import { Octokit } from "@octokit/rest";
import { execSync } from "child_process";

// ─── Config ────────────────────────────────────────────────────────────────

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO = process.env.REPO; // "owner/repo"
const PR_NUMBER = parseInt(process.env.PR_NUMBER, 10);
const PR_TITLE = process.env.PR_TITLE || "";
const PR_BODY = process.env.PR_BODY || "(no description)";
const BASE_SHA = process.env.BASE_SHA;
const HEAD_SHA = process.env.HEAD_SHA;

const MODEL = "nvidia/nemotron-3-ultra-550b-a55b:free";
const MAX_DIFF_CHARS = 12000; // Trim large diffs to stay within token limits

// ─── Validate env ──────────────────────────────────────────────────────────

if (!OPENROUTER_API_KEY) {
  console.error("❌  OPENROUTER_API_KEY repository variable is not set.");
  process.exit(1);
}
if (!GITHUB_TOKEN) {
  console.error("❌  GITHUB_TOKEN is not available.");
  process.exit(1);
}
if (!REPO || !PR_NUMBER) {
  console.error("❌  REPO or PR_NUMBER environment variables are missing.");
  process.exit(1);
}

// ─── GitHub client ─────────────────────────────────────────────────────────

const [owner, repo] = REPO.split("/");
const octokit = new Octokit({ auth: GITHUB_TOKEN });

// ─── Helpers ───────────────────────────────────────────────────────────────

/**
 * Get the git diff between base and head SHAs.
 * Falls back to the last commit diff if SHAs are unavailable.
 */
function getDiff() {
  try {
    const diff = execSync(`git diff ${BASE_SHA} ${HEAD_SHA} -- . ':(exclude)package-lock.json' ':(exclude)*.lock'`, {
      maxBuffer: 10 * 1024 * 1024,
      encoding: "utf8",
    });
    if (!diff.trim()) {
      return execSync("git show --stat HEAD", { encoding: "utf8" });
    }
    return diff;
  } catch {
    try {
      return execSync("git diff HEAD~1 HEAD -- . ':(exclude)package-lock.json'", {
        encoding: "utf8",
      });
    } catch {
      return "Unable to retrieve diff.";
    }
  }
}

/**
 * Trim diff to a safe character limit, adding a note if truncated.
 */
function trimDiff(diff) {
  if (diff.length <= MAX_DIFF_CHARS) return diff;
  return (
    diff.slice(0, MAX_DIFF_CHARS) +
    "\n\n[... diff truncated for length — review the full diff on GitHub ...]"
  );
}

/**
 * Build the review prompt sent to the AI model.
 */
function buildPrompt(diff) {
  return `You are a senior software engineer performing a thorough code review on a GitHub Pull Request.

## Pull Request Details
- **Title**: ${PR_TITLE}
- **Description**: ${PR_BODY}

## Diff
\`\`\`diff
${trimDiff(diff)}
\`\`\`

## Your Task
Analyze the diff above and produce a structured review. Cover these areas:

1. **🐛 Bugs & Correctness** — Logic errors, off-by-one, null-pointer risks, unhandled edge cases.
2. **🔒 Security** — Injection risks, exposed secrets, insecure patterns, missing auth/validation.
3. **⚡ Performance** — Unnecessary re-renders, expensive loops, missing memoization, N+1 queries.
4. **🏗️ Architecture & Design** — Separation of concerns, abstraction quality, SOLID principles.
5. **✅ Code Quality** — Readability, naming, dead code, duplication, missing error handling.
6. **💡 Suggestions** — Optional improvements, best practices, or alternative approaches.

## Format
Respond ONLY with valid JSON — no markdown fences, no explanation outside the JSON. Use this exact schema:

{
  "summary": "A 2-3 sentence overall verdict on the PR quality and recommendation (approve / request changes).",
  "verdict": "APPROVE" | "REQUEST_CHANGES" | "COMMENT",
  "bugs": [{ "severity": "HIGH|MEDIUM|LOW", "file": "path/to/file or 'general'", "issue": "description", "suggestion": "how to fix" }],
  "security": [{ "severity": "HIGH|MEDIUM|LOW", "file": "path/to/file or 'general'", "issue": "description", "suggestion": "how to fix" }],
  "performance": [{ "file": "path/to/file or 'general'", "issue": "description", "suggestion": "improvement" }],
  "architecture": [{ "file": "path/to/file or 'general'", "issue": "description", "suggestion": "improvement" }],
  "codeQuality": [{ "file": "path/to/file or 'general'", "issue": "description", "suggestion": "improvement" }],
  "positives": ["Something done well #1", "Something done well #2"],
  "suggestions": [{ "file": "path/to/file or 'general'", "suggestion": "Optional improvement idea" }]
}

Rules:
- Omit any array that has 0 items (except summary and verdict which are always present).
- Keep each item concise (max 2 sentences).
- If the PR looks clean with no concerns, set verdict to "APPROVE" and keep arrays minimal.`;
}

/**
 * Stream the AI response and collect the full text.
 */
async function getAIReview(prompt) {
  const openrouter = new OpenRouter({ apiKey: OPENROUTER_API_KEY });

  console.log(`🤖 Sending diff to ${MODEL} via OpenRouter...`);

  const stream = await openrouter.chat.send({
    chatRequest: {
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
      stream: true,
    },
  });

  let response = "";
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content;
    if (content) {
      response += content;
      process.stdout.write(content);
    }
    if (chunk.usage) {
      console.log(
        `\n📊 Reasoning tokens used: ${chunk.usage.completionTokensDetails?.reasoningTokens ?? "N/A"}`
      );
    }
  }

  console.log("\n✅ AI response received.");
  return response;
}

/**
 * Parse and clean the raw JSON text from the AI.
 */
function parseReview(raw) {
  let text = raw.trim();
  // Strip markdown code fences if present
  text = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  return JSON.parse(text);
}

/**
 * Format a list of review items into a markdown table section.
 */
function formatSection(title, emoji, items, hasSeverity = false) {
  if (!items || items.length === 0) return "";

  let md = `### ${emoji} ${title}\n\n`;

  if (hasSeverity) {
    md += `| Severity | File | Issue | Suggestion |\n`;
    md += `|----------|------|-------|------------|\n`;
    for (const item of items) {
      const sev = item.severity === "HIGH" ? "🔴 HIGH" : item.severity === "MEDIUM" ? "🟡 MEDIUM" : "🟢 LOW";
      md += `| ${sev} | \`${item.file}\` | ${item.issue} | ${item.suggestion} |\n`;
    }
  } else {
    md += `| File | Issue | Suggestion |\n`;
    md += `|------|-------|------------|\n`;
    for (const item of items) {
      md += `| \`${item.file || item.suggestion ? (item.file || "general") : "general"}\` | ${item.issue || item.suggestion} | ${item.suggestion || "—"} |\n`;
    }
  }

  return md + "\n";
}

/**
 * Build the full markdown comment body to post on the PR.
 */
function buildComment(review) {
  const verdictEmoji =
    review.verdict === "APPROVE" ? "✅" :
    review.verdict === "REQUEST_CHANGES" ? "❌" : "💬";

  let body = `## 🤖 AI Code Review — ${verdictEmoji} ${review.verdict}\n\n`;
  body += `> *Powered by [nvidia/nemotron-3-ultra-550b-a55b](https://openrouter.ai/nvidia/nemotron-3-ultra-550b-a55b:free) via OpenRouter*\n\n`;
  body += `---\n\n`;
  body += `### 📋 Summary\n\n${review.summary}\n\n`;

  body += formatSection("Bugs & Correctness", "🐛", review.bugs, true);
  body += formatSection("Security", "🔒", review.security, true);
  body += formatSection("Performance", "⚡", review.performance);
  body += formatSection("Architecture & Design", "🏗️", review.architecture);
  body += formatSection("Code Quality", "✅", review.codeQuality);

  if (review.positives && review.positives.length > 0) {
    body += `### 🌟 What's Done Well\n\n`;
    for (const p of review.positives) {
      body += `- ${p}\n`;
    }
    body += "\n";
  }

  if (review.suggestions && review.suggestions.length > 0) {
    body += `### 💡 Optional Suggestions\n\n`;
    for (const s of review.suggestions) {
      body += `- **\`${s.file || "general"}\`**: ${s.suggestion}\n`;
    }
    body += "\n";
  }

  body += `---\n*Generated at ${new Date().toUTCString()}*`;
  return body;
}

/**
 * Delete any previous AI review comments on the PR to avoid duplicates.
 */
async function deletePreviousReviews() {
  const comments = await octokit.issues.listComments({
    owner,
    repo,
    issue_number: PR_NUMBER,
    per_page: 100,
  });

  const aiComments = comments.data.filter(
    (c) =>
      c.user?.login === "github-actions[bot]" &&
      c.body?.includes("🤖 AI Code Review")
  );

  for (const comment of aiComments) {
    await octokit.issues.deleteComment({ owner, repo, comment_id: comment.id });
    console.log(`🗑️  Deleted previous AI review comment #${comment.id}`);
  }
}

/**
 * Post the review comment to the PR.
 */
async function postComment(body) {
  const { data } = await octokit.issues.createComment({
    owner,
    repo,
    issue_number: PR_NUMBER,
    body,
  });
  console.log(`💬 Posted review comment: ${data.html_url}`);
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🔍 AI PR Review starting for PR #${PR_NUMBER}: "${PR_TITLE}"\n`);

  const diff = getDiff();
  console.log(`📄 Diff size: ${diff.length} characters`);

  if (!diff.trim() || diff === "Unable to retrieve diff.") {
    console.log("⚠️  No diff detected. Skipping review.");
    return;
  }

  const prompt = buildPrompt(diff);
  let rawResponse;
  try {
    rawResponse = await getAIReview(prompt);
  } catch (err) {
    console.error("❌ Failed to get AI review:", err.message);
    process.exit(1);
  }

  let review;
  try {
    review = parseReview(rawResponse);
  } catch (err) {
    console.error("❌ Failed to parse AI response as JSON:", err.message);
    console.error("Raw response snippet:", rawResponse.slice(0, 500));
    // Post a fallback error comment rather than failing silently
    await deletePreviousReviews();
    await postComment(
      `## 🤖 AI Code Review — ⚠️ Parse Error\n\nThe AI model returned a response that could not be parsed as JSON.\n\n<details><summary>Raw response (first 1000 chars)</summary>\n\n\`\`\`\n${rawResponse.slice(0, 1000)}\n\`\`\`\n</details>\n\n*Please re-run the workflow or review manually.*`
    );
    process.exit(0);
  }

  const comment = buildComment(review);

  await deletePreviousReviews();
  await postComment(comment);

  console.log(`\n🎉 AI review complete — verdict: ${review.verdict}`);

  // Exit with non-zero if REQUEST_CHANGES so the check is marked as failed (optional)
  // Uncomment below if you want the CI to block merging on AI request-changes:
  // if (review.verdict === "REQUEST_CHANGES") process.exit(1);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
