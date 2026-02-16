# Requirement Analyst

AI-powered single-page application that analyzes project requirements like a senior software architect — catching missing pieces, ambiguities, edge cases, and technical gaps before development begins.

![Requirement Analyst](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Express](https://img.shields.io/badge/Express-4-000000?style=flat-square&logo=express)
![Gemini](https://img.shields.io/badge/Google-Gemini%202.5-4285F4?style=flat-square&logo=google)

---

## Overview

**Requirement Analyst** is a full-stack web app that lets you paste raw project requirements (PRDs, user stories, specs) and get an instant, structured analysis. The app uses **Google Gemini AI** to think like a senior architect and surface:

- **Missing requirements** — What’s clearly needed but not mentioned  
- **Ambiguous / confusing parts** — Vague or multi-interpretation statements  
- **Edge cases** — Scenarios that could break the system  
- **Technical questions** — Decisions about stack, integrations, performance  
- **Business logic questions** — Rules and workflows that need clarification  

You can view results in the UI, filter by category, copy items, and export a full report as Markdown.

---

## Architecture

```
Requirment-Analyst/
├── client/                 # Next.js frontend (React + Tailwind)
│   ├── src/
│   │   ├── app/            # App router (page, layout)
│   │   ├── components/     # UI components
│   │   ├── lib/            # Constants, utilities
│   │   └── types/          # TypeScript types
│   ├── package.json
│   └── tailwind.config.ts
├── server/                 # Express backend (Node.js + Gemini)
│   ├── routes/             # API routes (e.g. /api/analyze)
│   ├── services/           # Gemini AI service
│   ├── index.js            # Server entry
│   ├── .env                # PORT, GEMINI_API_KEY (create from .env.example)
│   └── package.json
├── README.md
└── .gitignore
```

- **Frontend:** Single-page app (SPA). One page: paste requirements → analyze → view/export results.  
- **Backend:** REST API. One main endpoint: `POST /api/analyze` — accepts `requirements` (string), returns structured analysis JSON.  
- **AI:** Google Generative AI (Gemini 2.5 Flash) with a custom “senior architect” system prompt and strict JSON output.

---

## Features

- **Single-page flow:** Paste → Analyze → Results (no page reloads).  
- **Rich UI:** Dark theme, glassmorphism, animations (Framer Motion), responsive layout.  
- **5 analysis categories:** Missing requirements, ambiguities, edge cases, technical questions, business logic.  
- **Export:** Download full analysis as a Markdown report.  
- **Copy:** Copy individual items or full report to clipboard.  
- **Error handling:** Validation, API errors, rate limits (e.g. Gemini quota) with clear messages and retry.  
- **Loading state:** Step-by-step progress while the AI analyzes.

---

## Tech Stack

| Layer    | Technologies |
|----------|--------------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons |
| Backend  | Node.js, Express, CORS, dotenv |
| AI       | Google Generative AI (Gemini 2.5 Flash) |

---

## Prerequisites

- **Node.js** 18+  
- **npm** (or yarn/pnpm)  
- **Google Gemini API key** — [Get one here](https://aistudio.google.com/apikey)

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/zohaib-9323/Requirment-Analyst.git
cd Requirment-Analyst
```

### 2. Install dependencies

```bash
# Backend
cd server && npm install

# Frontend (from repo root)
cd ../client && npm install
```

### 3. Configure environment

Create `server/.env` (do not commit this file):

```env
PORT=5001
GEMINI_API_KEY=your_gemini_api_key_here
```

Replace `your_gemini_api_key_here` with your actual Gemini API key.

### 4. Run the app

Use two terminals:

**Terminal 1 — Backend**

```bash
cd server && npm run dev
```

Server runs at **http://localhost:5001** (or whatever `PORT` you set).

**Terminal 2 — Frontend**

```bash
cd client && npm run dev
```

Client runs at **http://localhost:3000**.

Ensure the frontend is configured to call the backend (e.g. `http://localhost:5001`). If the client uses a Next.js API route as proxy, configure it to forward to the backend URL.

### 5. Use the app

1. Open **http://localhost:3000** in your browser.  
2. Paste your project requirements into the text area (or use “Try Sample”).  
3. Click **Analyze Requirements**.  
4. Review the analysis, filter by category, copy items, or **Export .md** to download the report.

---

## API

### `POST /api/analyze`

Analyzes the given requirements and returns a structured analysis.

**Request body:**

```json
{
  "requirements": "Your project requirements as a single string..."
}
```

**Validation:**

- `requirements` must be a non-empty string.  
- Minimum length: 20 characters.

**Response (success):**

```json
{
  "success": true,
  "analysis": {
    "missingRequirements": [{ "title": "...", "description": "..." }],
    "ambiguousParts": [...],
    "edgeCases": [...],
    "technicalQuestions": [...],
    "businessLogicQuestions": [...]
  }
}
```

**Errors:** `400` for validation errors, `500` for server or Gemini errors (with `error` and `message` in the body).

### `GET /api/health`

Returns `{ "status": "ok", "timestamp": "..." }` for health checks.

---

## Project Scripts

**Server (`server/`)**

- `npm run dev` — Start with nodemon (auto-reload).  
- `npm start` — Start with node.

**Client (`client/`)**

- `npm run dev` — Start Next.js dev server.  
- `npm run build` — Production build.  
- `npm start` — Run production build.

---

## Security & Environment

- **Do not commit** `server/.env` or any file containing your Gemini API key.  
- `.gitignore` should include: `node_modules/`, `.next/`, `.env`, `*.tsbuildinfo`.  
- Keep the API key only on the server; the frontend should never receive or store it.

---

## License

This project is open source. Use and modify as needed for your own requirement analysis workflows.

---

## Contributing

1. Fork the repository.  
2. Create a feature branch, make your changes, and run tests/linting if applicable.  
3. Open a pull request against `main` with a clear description of the change.

---

**Requirement Analyst** — Catch what everyone misses before you write a single line of code.
