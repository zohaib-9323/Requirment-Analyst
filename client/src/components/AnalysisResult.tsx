"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AnalysisResult as AnalysisResultType } from "@/types";
import { CATEGORIES } from "@/lib/constants";
import CategoryCard from "./CategoryCard";
import {
  Download,
  RotateCcw,
  CheckCircle2,
  LayoutGrid,
  List,
  Copy,
  Check,
} from "lucide-react";

interface AnalysisResultProps {
  result: AnalysisResultType;
  onReset: () => void;
}

function AnimatedCounter({ value }: { value: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 600;
    const step = Math.max(1, Math.floor(duration / value));
    const timer = setInterval(() => {
      start += 1;
      setCount(start);
      if (start >= value) clearInterval(timer);
    }, step);
    return () => clearInterval(timer);
  }, [value]);
  return <>{count}</>;
}

export default function AnalysisResult({
  result,
  onReset,
}: AnalysisResultProps) {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const totalIssues = CATEGORIES.reduce(
    (sum, cat) => sum + (result[cat.key]?.length || 0),
    0
  );

  const visibleCategories = CATEGORIES.filter(
    (cat) => (result[cat.key]?.length || 0) > 0
  );

  const displayCategories = activeTab
    ? visibleCategories.filter((c) => c.key === activeTab)
    : visibleCategories;

  const handleExport = () => {
    let markdown = "# Requirements Analysis Report\n\n";
    markdown += `> Generated on ${new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}\n\n`;
    markdown += `**Total findings:** ${totalIssues}\n\n---\n\n`;

    CATEGORIES.forEach((cat) => {
      const items = result[cat.key] || [];
      if (items.length === 0) return;
      markdown += `## ${cat.label} (${items.length})\n\n`;
      markdown += `*${cat.description}*\n\n`;
      items.forEach((item, i) => {
        markdown += `### ${i + 1}. ${item.title}\n\n`;
        markdown += `${item.description}\n\n`;
      });
      markdown += "---\n\n";
    });

    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `requirements-analysis-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyAll = async () => {
    let text = "REQUIREMENTS ANALYSIS REPORT\n\n";
    CATEGORIES.forEach((cat) => {
      const items = result[cat.key] || [];
      if (items.length === 0) return;
      text += `── ${cat.label.toUpperCase()} (${items.length}) ──\n\n`;
      items.forEach((item, i) => {
        text += `${i + 1}. ${item.title}\n   ${item.description}\n\n`;
      });
    });
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pt-6 pb-8">
      {/* ── Summary Header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass p-6 mb-6"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Analysis Complete
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                <span className="text-white font-semibold">{totalIssues}</span>{" "}
                findings across {visibleCategories.length} categories
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleCopyAll} className="btn-secondary !text-xs">
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copied ? "Copied!" : "Copy All"}
            </button>
            <button
              onClick={handleExport}
              className="btn-secondary !text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              Export .md
            </button>
            <button
              onClick={onReset}
              className="btn-secondary !text-xs !text-indigo-400 hover:!text-indigo-300 hover:!bg-indigo-500/10 !border-indigo-500/20"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              New Analysis
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-5 gap-3">
          {CATEGORIES.map((cat) => {
            const count = result[cat.key]?.length || 0;
            return (
              <motion.div
                key={cat.key}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className={`text-center p-3 rounded-xl border transition-all duration-300 cursor-pointer ${
                  activeTab === cat.key
                    ? `${cat.bgColor} ${cat.borderColor}`
                    : "border-white/[0.04] bg-white/[0.02] hover:bg-white/[0.04]"
                }`}
                onClick={() =>
                  setActiveTab(activeTab === cat.key ? null : cat.key)
                }
              >
                <div className={`text-2xl font-bold ${cat.color}`}>
                  <AnimatedCounter value={count} />
                </div>
                <div className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider font-semibold leading-tight">
                  {cat.label.split("/")[0].trim().split(" ")[0]}
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ── Filter Tabs ── */}
      {visibleCategories.length > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 mb-5 overflow-x-auto pb-1"
        >
          <button
            onClick={() => setActiveTab(null)}
            className={`pill whitespace-nowrap transition-all duration-200 ${
              !activeTab
                ? "bg-white/[0.08] border-white/[0.15] text-white"
                : "bg-transparent border-white/[0.06] text-gray-500 hover:text-gray-300"
            }`}
          >
            <LayoutGrid className="w-3 h-3" />
            All ({totalIssues})
          </button>
          {visibleCategories.map((cat) => {
            const count = result[cat.key]?.length || 0;
            return (
              <button
                key={cat.key}
                onClick={() =>
                  setActiveTab(activeTab === cat.key ? null : cat.key)
                }
                className={`pill whitespace-nowrap transition-all duration-200 ${
                  activeTab === cat.key
                    ? `${cat.bgColor} ${cat.borderColor} ${cat.color}`
                    : "bg-transparent border-white/[0.06] text-gray-500 hover:text-gray-300"
                }`}
              >
                {cat.label.split("/")[0].trim()}
                <span className="opacity-60">({count})</span>
              </button>
            );
          })}
        </motion.div>
      )}

      {/* ── Category Cards ── */}
      <div className="space-y-4">
        {displayCategories.map((category, index) => {
          const items = result[category.key] || [];
          return (
            <motion.div
              key={category.key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.4 }}
            >
              <CategoryCard
                category={category}
                items={items}
                index={index}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
