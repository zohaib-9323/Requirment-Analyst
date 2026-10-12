"use client";

import { Plus } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export function Logo() {
  return (
    <span
      aria-hidden
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-ink text-bg"
    >
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none">
        <path
          d="M7 4h7l4 4v12H7z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M10 12h5M10 15.5h3"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="17.5" cy="17.5" r="3.2" fill="rgb(var(--accent))" />
      </svg>
    </span>
  );
}

export default function Header({ onNew }: { onNew?: () => void }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="/" className="flex items-center gap-2.5 rounded-lg">
          <Logo />
          <span className="text-[15px] font-semibold tracking-tight">
            Requirement Analyst
          </span>
        </a>
        <div className="flex items-center gap-1">
          {onNew && (
            <button type="button" onClick={onNew} className="btn-outline">
              <Plus className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">New analysis</span>
              <span className="sr-only sm:hidden">New analysis</span>
            </button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
