"use client";

import { useEffect } from "react";
import { Moon, Sun } from "lucide-react";

const STORAGE_KEY = "color-scheme";

function getMeta() {
  return document.querySelector<HTMLMetaElement>('meta[name="color-scheme"]');
}

/**
 * Two-state toggle: "follow system" and "the opposite of system".
 * Which icon shows is decided purely in CSS (see globals.css).
 */
export default function ThemeToggle() {
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const meta = getMeta();
      if (meta) meta.content = e.newValue ?? "light dark";
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = () => {
    const meta = getMeta();
    if (!meta) return;
    const system = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
    const rendered =
      meta.content === "dark" || meta.content === "light"
        ? meta.content
        : system;
    const target = rendered === "dark" ? "light" : "dark";

    try {
      if (target === system) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, target);
    } catch {
      // Storage blocked: still apply the theme for this page view.
    }
    meta.content = target === system ? "light dark" : target;
  };

  return (
    <button type="button" onClick={toggle} className="btn-ghost !px-2.5">
      <span className="theme-to-dark items-center">
        <Moon className="h-[18px] w-[18px]" aria-hidden />
        <span className="sr-only">Switch to dark theme</span>
      </span>
      <span className="theme-to-light items-center">
        <Sun className="h-[18px] w-[18px]" aria-hidden />
        <span className="sr-only">Switch to light theme</span>
      </span>
    </button>
  );
}
