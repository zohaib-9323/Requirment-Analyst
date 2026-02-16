"use client";

import { motion } from "framer-motion";
import {
  Search,
  HelpCircle,
  Zap,
  AlertTriangle,
  Code2,
  Briefcase,
} from "lucide-react";

const features = [
  { icon: Search, label: "Missing Pieces", color: "text-red-400" },
  { icon: HelpCircle, label: "Ambiguities", color: "text-amber-400" },
  { icon: Zap, label: "Edge Cases", color: "text-orange-400" },
  { icon: Code2, label: "Tech Gaps", color: "text-blue-400" },
  { icon: Briefcase, label: "Business Logic", color: "text-purple-400" },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.3 },
  },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

export default function HeroSection() {
  return (
    <section className="pt-20 pb-12 text-center">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-3xl mx-auto"
      >
        {/* Badge */}
        <motion.div variants={item} className="mb-8">
          <span className="pill bg-indigo-500/[0.08] border-indigo-500/15 text-indigo-400">
            <svg
              className="w-3 h-3"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0L14.59 8.41L23 12L14.59 15.59L12 24L9.41 15.59L1 12L9.41 8.41L12 0Z" />
            </svg>
            Think like a Senior Architect
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={item}
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6"
        >
          <span className="text-white">Catch what</span>
          <br />
          <span className="gradient-text-hero">everyone misses</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={item}
          className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto leading-relaxed mb-10"
        >
          Paste your project requirements and let AI surface the missing pieces,
          ambiguities, and edge cases — the questions a senior engineer
          would ask before writing a single line of code.
        </motion.p>

        {/* Feature pills */}
        <motion.div
          variants={item}
          className="flex flex-wrap justify-center gap-2.5"
        >
          {features.map((feat) => (
            <span
              key={feat.label}
              className="pill bg-white/[0.03] border-white/[0.07] text-gray-400 hover:text-gray-200 hover:border-white/[0.14] hover:bg-white/[0.06] cursor-default"
            >
              <feat.icon className={`w-3 h-3 ${feat.color}`} />
              {feat.label}
            </span>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          variants={item}
          className="mt-12 flex flex-col items-center gap-2"
        >
          <span className="text-[11px] text-gray-600 uppercase tracking-widest font-medium">
            Paste & analyze
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg
              className="w-5 h-5 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
