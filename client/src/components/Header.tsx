"use client";

import { motion } from "framer-motion";
import { Scan, Github, Sparkles } from "lucide-react";

export default function Header() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#06060b]/80 backdrop-blur-xl"
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Scan className="w-[18px] h-[18px] text-white" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[15px] font-bold text-white tracking-tight">
              ReqAnalyst
            </span>
            <span className="hidden sm:inline text-[10px] font-medium text-gray-600 uppercase tracking-widest">
              v1.0
            </span>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="pill bg-emerald-500/[0.08] border-emerald-500/20 text-emerald-400">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
            </span>
            <Sparkles className="w-3 h-3" />
            Gemini 2.5
          </div>
        </div>
      </div>
    </motion.header>
  );
}
