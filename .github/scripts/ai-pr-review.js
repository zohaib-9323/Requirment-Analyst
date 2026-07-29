// @ts-check
/**
 * AI PR Review Script
 * - Posts inline review comments on each changed file
 * - Adds an overall quality rating out of 5 (stack-aware) at the end
 * - Uses OpenRouter with nvidia/nemotron-3-ultra-550b-a55b:free + fallback chain
 */

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

// Model fallback chain — tries each in order until one returns a non-empty response
const MODELS = [
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "stepfun/step-3.5-flash:free",
  "deepseek/deepseek-r1-0528:free",
  "google/gemma-3-27b-it:free",
];
const MAX_DIFF_CHARS = 14000;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// ─── Validate env ──────────────────────────────────────────────────────────

if (!OPENROUTER_API_KEY) {
  console.error("❌  OPENROUTER_API_KEY is not set.");
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

// ─── Diff helpers ──────────────────────────────────────────────────────────

/**
 * Get the git diff between base and head SHAs.
 */
function getDiff() {
  try {
    const diff = execSync(
      `git diff ${BASE_SHA} ${HEAD_SHA} -- . ':(exclude)package-lock.json' ':(exclude)*.lock'`,
      { maxBuffer: 10 * 1024 * 1024, encoding: "utf8" }
    );
    if (!diff.trim()) return execSync("git show --stat HEAD", { encoding: "utf8" });
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

/** Trim diff to safe character limit */
function trimDiff(diff) {
  if (diff.length <= MAX_DIFF_CHARS) return diff;
  return (
    diff.slice(0, MAX_DIFF_CHARS) +
    "\n\n[... diff truncated — see full diff on GitHub ...]"
  );
}

/**
 * Parse the diff to extract changed files with their per-file diff hunks.
 * Returns: [{ path, diffHunk, lastLine }]
 */
function parseChangedFiles(diff) {
  const files = [];
  // Split on "diff --git" boundaries
  const sections = diff.split(/^diff --git /m).filter(Boolean);

  for (const section of sections) {
    const lines = section.split("\n");
    // Extract file path from "a/path b/path" header
    const headerMatch = lines[0]?.match(/^a\/.+ b\/(.+)$/);
    if (!headerMatch) continue;
    const path = headerMatch[1].trim();

    // Skip lockfiles
    if (path.includes("package-lock.json") || path.endsWith(".lock")) continue;

    // Find the last changed line number (added or removed)
    let lastLine = 1;
    let currentLine = 0;
    for (const line of lines) {
      const hunkMatch = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)/);
      if (hunkMatch) currentLine = parseInt(hunkMatch[1], 10) - 1;
      if (line.startsWith("+") && !line.startsWith("+++")) {
        currentLine++;
        lastLine = currentLine;
      } else if (!line.startsWith("-")) {
        if (currentLine > 0) currentLine++;
      }
    }

    // Extract just this file's diff (capped)
    const fileDiff = "diff --git " + section.slice(0, 3000);
    files.push({ path, diffHunk: fileDiff, lastLine: Math.max(lastLine, 1) });
  }

  return files;
}

// ─── AI prompt ─────────────────────────────────────────────────────────────

function buildPrompt(diff, changedFiles) {
  const fileList = changedFiles.map((f) => `- ${f.path}`).join("\n");

  return `You are a senior software engineer performing a thorough GitHub PR code review.

## Pull Request
- **Title**: ${PR_TITLE}
- **Description**: ${PR_BODY}

## Changed Files
${fileList}

## Full Diff
\`\`\`diff
${trimDiff(diff)}
\`\`\`

## Your Task
1. Detect the tech stack from the file paths and code (e.g. React, Node.js/Express, Next.js, TypeScript, Python/Django, etc.)
2. Write a SHORT inline comment for EACH changed file (2–4 sentences max, actionable)
3. Give an overall PR quality score out of 5, broken down by detected stack layers
4. Identify bugs, security issues, performance problems, architecture concerns, code quality issues

## Response Format
Respond ONLY with valid JSON — no markdown fences, no text outside the JSON:

{
  "detectedStack": ["React", "Node.js", "Express"],
  "summary": "2-3 sentence overall verdict and recommendation.",
  "verdict": "APPROVE" | "REQUEST_CHANGES" | "COMMENT",
  "fileComments": [
    {
      "path": "exact/file/path.js",
      "comment": "Short inline review comment for this specific file. Mention what it does well and what needs fixing. Max 4 sentences."
    }
  ],
  "bugs": [{ "severity": "HIGH|MEDIUM|LOW", "file": "path/to/file", "issue": "description", "suggestion": "how to fix" }],
  "security": [{ "severity": "HIGH|MEDIUM|LOW", "file": "path/to/file", "issue": "description", "suggestion": "how to fix" }],
  "performance": [{ "file": "path/to/file", "issue": "description", "suggestion": "improvement" }],
  "architecture": [{ "file": "path/to/file", "issue": "description", "suggestion": "improvement" }],
  "codeQuality": [{ "file": "path/to/file", "issue": "description", "suggestion": "improvement" }],
  "positives": ["Something done well"],
  "overallRating": {
    "score": 2.5,
    "breakdown": [
      { "layer": "Node.js / Express", "score": 2, "reason": "SQL injection, no auth, plaintext passwords" },
      { "layer": "Architecture", "score": 2, "reason": "No service layer, logic in routes" },
      { "layer": "Code Quality", "score": 3, "reason": "Readable structure but no validation or error handling" }
    ],
    "verdict": "Needs significant security and architectural fixes before merge."
  }
}

Rules:
- fileComments must include an entry for EVERY file in the changed files list.
- score is a decimal from 0.0 to 5.0 (e.g. 3.5).
- breakdown has one entry per detected stack layer/concern (2-4 entries).
- Omit empty arrays (bugs, security etc.) if none found — but always include fileComments and overallRating.
- Each item concise, max 2 sentences.`;
}

// ─── OpenRouter call ───────────────────────────────────────────────────────

async function callModel(model, prompt) {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 4000,
    }),
    signal: AbortSignal.timeout(90000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 300)}`);
  }

  const json = await res.json();
  const usage = json.usage;
  if (usage) {
    console.log(
      `📊 Tokens — prompt: ${usage.prompt_tokens}, completion: ${usage.completion_tokens}` +
      (usage.completion_tokens_details?.reasoning_tokens
        ? `, reasoning: ${usage.completion_tokens_details.reasoning_tokens}`
        : "")
    );
  }

  const content = json?.choices?.[0]?.message?.content ?? "";
  return typeof content === "string" ? content.trim() : "";
}

async function getAIReview(prompt) {
  let lastError = null;
  for (const model of MODELS) {
    console.log(`\n🤖 Trying model: ${model}`);
    try {
      const content = await callModel(model, prompt);
      if (content) {
        console.log(`✅ Got response from ${model} (${content.length} chars)`);
        return content;
      }
      console.log(`⚠️  ${model} returned empty — trying next...`);
    } catch (err) {
      lastError = err;
      console.log(`⚠️  ${model} failed: ${err.message} — trying next...`);
    }
  }
  throw lastError ?? new Error("All models returned empty responses.");
}

function parseReview(raw) {
  let text = raw.trim();
  text = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  return JSON.parse(text);
}

// ─── GitHub posting helpers ────────────────────────────────────────────────

/**
 * Fetch PR files from GitHub API — returns [{ filename, patch }]
 */
async function getPRFiles() {
  const { data } = await octokit.pulls.listFiles({
    owner,
    repo,
    pull_number: PR_NUMBER,
    per_page: 100,
  });
  return data;
}

/**
 * Compute the diff position (1-indexed line in the unified diff) for a given
 * file's last added line. Falls back to position 1 if not deterministic.
 * The GitHub review API needs `position` = line number within the diff hunk.
 */
function getDiffPosition(patch) {
  if (!patch) return 1;
  const lines = patch.split("\n");
  // Walk the patch and count diff lines to find the last '+' line position
  let position = 0;
  let lastAddedPosition = 1;
  for (const line of lines) {
    position++;
    if (line.startsWith("+") && !line.startsWith("+++")) {
      lastAddedPosition = position;
    }
  }
  return lastAddedPosition;
}

/**
 * Post inline review comments on each changed file + overall summary as a PR review.
 */
async function postPRReview(review, prFiles) {
  const verdictMap = {
    APPROVE: "APPROVE",
    REQUEST_CHANGES: "REQUEST_CHANGES",
    COMMENT: "COMMENT",
  };
  const event = verdictMap[review.verdict] || "COMMENT";

  // Build per-file inline comments
  const comments = [];
  for (const fc of review.fileComments || []) {
    // Find matching PR file
    const prFile = prFiles.find(
      (f) => f.filename === fc.path || f.filename.endsWith(fc.path)
    );
    if (!prFile || !prFile.patch) {
      console.log(`⚠️  Skipping inline comment for ${fc.path} (no patch/not in PR)`);
      continue;
    }
    const position = getDiffPosition(prFile.patch);
    comments.push({
      path: prFile.filename,
      position,
      body: `### 🤖 AI File Review\n\n${fc.comment}`,
    });
  }

  // Build the main review body
  const body = buildReviewBody(review);

  try {
    const { data } = await octokit.pulls.createReview({
      owner,
      repo,
      pull_number: PR_NUMBER,
      commit_id: HEAD_SHA,
      event,
      body,
      comments,
    });
    console.log(`✅ Posted PR review #${data.id} with ${comments.length} inline comment(s)`);
    console.log(`🔗 ${data.html_url}`);
  } catch (err) {
    // If inline comments fail (e.g. position mismatch), fall back to body-only review
    console.warn(`⚠️  Inline comments failed (${err.message}), posting body-only review`);
    const { data } = await octokit.pulls.createReview({
      owner,
      repo,
      pull_number: PR_NUMBER,
      commit_id: HEAD_SHA,
      event: "COMMENT",
      body,
    });
    console.log(`✅ Posted body-only PR review #${data.id}: ${data.html_url}`);
  }
}

// ─── Comment body builder ──────────────────────────────────────────────────

function formatSection(title, emoji, items, hasSeverity = false) {
  if (!items || items.length === 0) return "";
  let md = `### ${emoji} ${title}\n\n`;
  if (hasSeverity) {
    md += `| Severity | File | Issue | Suggestion |\n|----------|------|-------|------------|\n`;
    for (const item of items) {
      const sev =
        item.severity === "HIGH" ? "🔴 HIGH" :
        item.severity === "MEDIUM" ? "🟡 MEDIUM" : "🟢 LOW";
      md += `| ${sev} | \`${item.file}\` | ${item.issue} | ${item.suggestion} |\n`;
    }
  } else {
    md += `| File | Issue | Suggestion |\n|------|-------|------------|\n`;
    for (const item of items) {
      md += `| \`${item.file || "general"}\` | ${item.issue || item.suggestion} | ${item.suggestion || "—"} |\n`;
    }
  }
  return md + "\n";
}

/** Render a visual star rating bar */
function renderRatingBar(score) {
  const total = 5;
  const filled = Math.round(score);
  const empty = total - filled;
  return "⭐".repeat(filled) + "☆".repeat(empty) + ` **${score}/5**`;
}

function buildReviewBody(review) {
  const verdictEmoji =
    review.verdict === "APPROVE" ? "✅" :
    review.verdict === "REQUEST_CHANGES" ? "❌" : "💬";

  let body = `## 🤖 AI Code Review — ${verdictEmoji} ${review.verdict}\n\n`;
  body += `> *Powered by [nvidia/nemotron-3-ultra-550b-a55b](https://openrouter.ai/nvidia/nemotron-3-ultra-550b-a55b:free) via OpenRouter*\n\n`;

  // Detected stack badges
  if (review.detectedStack?.length) {
    const badges = review.detectedStack.map((s) => `\`${s}\``).join(" · ");
    body += `**Stack detected:** ${badges}\n\n`;
  }

  body += `---\n\n### 📋 Summary\n\n${review.summary}\n\n`;

  // Detailed review sections
  body += formatSection("Bugs & Correctness", "🐛", review.bugs, true);
  body += formatSection("Security", "🔒", review.security, true);
  body += formatSection("Performance", "⚡", review.performance);
  body += formatSection("Architecture & Design", "🏗️", review.architecture);
  body += formatSection("Code Quality", "✅", review.codeQuality);

  if (review.positives?.length) {
    body += `### 🌟 What's Done Well\n\n`;
    for (const p of review.positives) body += `- ${p}\n`;
    body += "\n";
  }

  // ── Overall Rating ──────────────────────────────────────────────────────
  if (review.overallRating) {
    const { score, breakdown, verdict: ratingVerdict } = review.overallRating;
    body += `---\n\n## 🎯 Overall Quality Rating\n\n`;
    body += `### ${renderRatingBar(score)}\n\n`;

    if (breakdown?.length) {
      body += `| Layer / Concern | Score | Assessment |\n`;
      body += `|-----------------|-------|------------|\n`;
      for (const b of breakdown) {
        body += `| **${b.layer}** | ${renderRatingBar(b.score)} | ${b.reason} |\n`;
      }
      body += "\n";
    }

    if (ratingVerdict) {
      body += `> 💬 ${ratingVerdict}\n\n`;
    }
  }

  body += `---\n*Generated at ${new Date().toUTCString()}*`;
  return body;
}

// ─── Dismiss old reviews ───────────────────────────────────────────────────

/**
 * Dismiss previous AI PR reviews to avoid stacking.
 */
async function dismissPreviousReviews() {
  try {
    const { data: reviews } = await octokit.pulls.listReviews({
      owner,
      repo,
      pull_number: PR_NUMBER,
      per_page: 100,
    });

    for (const review of reviews) {
      if (
        review.user?.login === "github-actions[bot]" &&
        review.body?.includes("🤖 AI Code Review")
      ) {
        try {
          await octokit.pulls.dismissReview({
            owner,
            repo,
            pull_number: PR_NUMBER,
            review_id: review.id,
            message: "Superseded by a newer AI review.",
          });
          console.log(`🗑️  Dismissed previous review #${review.id}`);
        } catch {
          // Reviews in PENDING state can't be dismissed — ignore
        }
      }
    }
  } catch (err) {
    console.warn("⚠️  Could not list/dismiss previous reviews:", err.message);
  }

  // Also clean up any old plain issue comments from the previous script version
  try {
    const { data: comments } = await octokit.issues.listComments({
      owner, repo, issue_number: PR_NUMBER, per_page: 100,
    });
    for (const c of comments) {
      if (c.user?.login === "github-actions[bot]" && c.body?.includes("🤖 AI Code Review")) {
        await octokit.issues.deleteComment({ owner, repo, comment_id: c.id });
        console.log(`🗑️  Deleted old issue comment #${c.id}`);
      }
    }
  } catch {
    // Non-fatal
  }
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

  // Parse changed files for inline comment targeting
  const changedFiles = parseChangedFiles(diff);
  console.log(`📁 Changed files: ${changedFiles.map((f) => f.path).join(", ")}`);

  // Fetch PR files from GitHub API (for accurate diff positions)
  const prFiles = await getPRFiles();
  console.log(`📡 GitHub PR files fetched: ${prFiles.length}`);

  // Build prompt and get AI review
  const prompt = buildPrompt(diff, changedFiles);
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
    console.error("Raw snippet:", rawResponse.slice(0, 500));
    // Fallback: post a plain comment
    await octokit.issues.createComment({
      owner, repo, issue_number: PR_NUMBER,
      body: `## 🤖 AI Code Review — ⚠️ Parse Error\n\nThe model returned a response that could not be parsed.\n\n<details><summary>Raw (first 1000 chars)</summary>\n\n\`\`\`\n${rawResponse.slice(0, 1000)}\n\`\`\`\n</details>\n\n*Re-run the workflow or review manually.*`,
    });
    process.exit(0);
  }

  // Dismiss old reviews, then post the new one
  await dismissPreviousReviews();
  await postPRReview(review, prFiles);

  console.log(`\n🎉 AI review complete — verdict: ${review.verdict}, rating: ${review.overallRating?.score ?? "N/A"}/5`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
