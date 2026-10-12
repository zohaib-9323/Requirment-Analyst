"use client";

import { motion } from "framer-motion";
import { Clock, ListChecks, FileDown } from "lucide-react";

const points = [
  { icon: ListChecks, text: "Five kinds of findings" },
  { icon: Clock, text: "Ready in 1–2 minutes" },
  { icon: FileDown, text: "Export as a checklist" },
];

export default function HeroSection() {
  return (
    <section className="pb-10 pt-14 text-center sm:pt-20">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto max-w-3xl"
      >
        <p className="eyebrow">AI requirements review</p>
        <h1 className="mt-5 text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
          Find the gaps in your spec{" "}
          <span className="font-serif text-[1.12em] font-normal italic text-accent">
            before
          </span>{" "}
          they become bugs.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
          Paste your requirements and get the questions a senior architect would
          ask — what&apos;s missing, what&apos;s unclear, and what could break —
          before anyone writes a line of code.
        </p>
        <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
          {points.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-accent" aria-hidden />
              {text}
            </li>
          ))}
        </ul>
      </motion.div>
    </section>
  );
}
